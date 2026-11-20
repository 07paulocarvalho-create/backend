import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { conexao } from "../database/conexao";
import { ConflitoError } from "../errors/ConflitoError";
import { ItemPedido, ItemPedidoJSON } from "../models/ItemPedido";
import { Pedido } from "../models/Pedido";
import { Repositorio } from "./Repositorio";
import { Linha, RepositorioMySQL } from "./RepositorioMySQL";

// Segregação de interfaces: só pedidos precisam da operação de cancelar
export interface RepositorioPedidos extends Repositorio<Pedido> {
    cancelar(pedido: Pedido): Promise<void>;
}

export class PedidoRepository extends RepositorioMySQL<Pedido> implements RepositorioPedidos {
    protected readonly tabela = "pedidos";
    protected readonly ordenacao = "pedidos.criado_em DESC";

    // Relacionamentos: pedido -> usuário e itens -> livro, com os itens agrupados em uma lista
    protected selecao(): string {
        return `SELECT pedidos.*, usuarios.nome AS cliente_nome,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                    'livroId', itens.livro_id,
                    'titulo', livros.titulo,
                    'quantidade', itens.quantidade,
                    'precoUnitario', itens.preco_unitario))
                FROM pedido_itens itens
                JOIN livros ON livros.id = itens.livro_id
                WHERE itens.pedido_id = pedidos.id) AS itens
            FROM pedidos
            JOIN usuarios ON usuarios.id = pedidos.usuario_id`;
    }

    protected paraLinha(pedido: Pedido): Linha {
        const { id, cliente, status, total } = pedido.toJSON();
        return { id, usuario_id: cliente.id, status, total, criado_em: pedido.criadoEm };
    }

    protected deLinha(linha: RowDataPacket): Pedido {
        const itens = ((linha.itens ?? []) as ItemPedidoJSON[]).map(
            (item) => new ItemPedido(item.livroId, item.titulo, Number(item.quantidade), Number(item.precoUnitario))
        );

        return new Pedido(
            { cliente: { id: linha.usuario_id, nome: linha.cliente_nome }, itens, status: linha.status },
            linha.id,
            linha.criado_em
        );
    }

    // Grava o pedido e os itens e baixa o estoque na mesma transação
    async salvar(pedido: Pedido): Promise<void> {
        const { id, usuario_id, status, total, criado_em } = this.paraLinha(pedido);

        await this.transacao(async (con) => {
            await con.execute(
                "INSERT INTO pedidos (id, usuario_id, status, total, criado_em) VALUES (?, ?, ?, ?, ?)",
                [id, usuario_id, status, total, criado_em]
            );

            for (const item of pedido.toJSON().itens) {
                // Só baixa se ainda houver estoque no momento da gravação
                const [resultado] = await con.execute<ResultSetHeader>(
                    "UPDATE livros SET estoque = estoque - ? WHERE id = ? AND estoque >= ?",
                    [item.quantidade, item.livroId, item.quantidade]
                );

                if (resultado.affectedRows === 0) {
                    throw new ConflitoError(`Estoque insuficiente para "${item.titulo}"`);
                }

                await con.execute(
                    "INSERT INTO pedido_itens (pedido_id, livro_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
                    [id, item.livroId, item.quantidade, item.precoUnitario]
                );
            }
        });
    }

    async cancelar(pedido: Pedido): Promise<void> {
        await this.transacao(async (con) => {
            const [resultado] = await con.execute<ResultSetHeader>(
                "UPDATE pedidos SET status = 'cancelado' WHERE id = ? AND status <> 'cancelado'",
                [pedido.id]
            );

            if (resultado.affectedRows > 0) {
                await this.devolverEstoque(con, pedido.id);
            }
        });
    }

    // Excluir um pedido que não estava cancelado devolve os livros ao estoque
    async excluir(id: string): Promise<void> {
        await this.transacao(async (con) => {
            const [linhas] = await con.execute<RowDataPacket[]>(
                "SELECT status FROM pedidos WHERE id = ? FOR UPDATE",
                [id]
            );

            if (linhas.length > 0 && linhas[0].status !== "cancelado") {
                await this.devolverEstoque(con, id);
            }

            await con.execute("DELETE FROM pedidos WHERE id = ?", [id]);
        });
    }

    private async devolverEstoque(con: PoolConnection, pedidoId: string): Promise<void> {
        await con.execute(
            `UPDATE livros
            JOIN pedido_itens ON pedido_itens.livro_id = livros.id
            SET livros.estoque = livros.estoque + pedido_itens.quantidade
            WHERE pedido_itens.pedido_id = ?`,
            [pedidoId]
        );
    }

    private async transacao(operacao: (con: PoolConnection) => Promise<void>): Promise<void> {
        const con = await conexao.getConnection();
        try {
            await con.beginTransaction();
            await operacao(con);
            await con.commit();
        } catch (erro) {
            await con.rollback();
            throw erro;
        } finally {
            con.release();
        }
    }
}
