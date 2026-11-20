import { NaoEncontradoError } from "../errors/NaoEncontradoError";
import { ProibidoError } from "../errors/ProibidoError";
import { ValidacaoError } from "../errors/ValidacaoError";
import { ItemPedido } from "../models/ItemPedido";
import { Livro } from "../models/Livro";
import { Pedido, STATUS_PEDIDO, StatusPedido } from "../models/Pedido";
import { RepositorioPedidos } from "../repositories/PedidoRepository";
import { Repositorio } from "../repositories/Repositorio";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { Filtros, Pagina, Paginacao } from "../types/paginacao";
import { Entrada, numero, texto } from "../utils/entrada";
import { UsuarioAutenticado } from "../utils/token";
import { CrudService } from "./CrudService";

type ItemSolicitado = {
    livroId: string;
    quantidade: number;
};

type BuscaDeUsuario = Pick<UsuarioRepository, "buscarPorId">;

const MAXIMO_ITENS = 20;

export class PedidoService extends CrudService<Pedido> {
    constructor(
        private readonly pedidos: RepositorioPedidos,
        private readonly livros: Repositorio<Livro>,
        private readonly usuarios: BuscaDeUsuario
    ) {
        super(pedidos, "Pedido não encontrado");
    }

    // Cliente vê apenas os próprios pedidos; admin vê todos e pode filtrar por ?status=
    async listar(paginacao: Paginacao, consulta: Entrada = {}, usuario?: UsuarioAutenticado): Promise<Pagina<Pedido>> {
        const filtros: Filtros = {};
        const status = texto(consulta.status);

        if (usuario?.perfil !== "admin") {
            filtros["pedidos.usuario_id"] = usuario?.id ?? "";
        }
        if (STATUS_PEDIDO.includes(status as StatusPedido)) {
            filtros["pedidos.status"] = status;
        }

        return this.pedidos.listar(paginacao, filtros);
    }

    async buscar(id: string, usuario?: UsuarioAutenticado): Promise<Pedido> {
        const pedido = await super.buscar(id);

        if (usuario && usuario.perfil !== "admin" && !pedido.pertenceA(usuario.id)) {
            throw new ProibidoError("Você não tem acesso a este pedido");
        }
        return pedido;
    }

    async criar(entrada: Entrada, usuario: UsuarioAutenticado): Promise<Pedido> {
        const solicitados = this.lerItens(entrada);
        const cliente = await this.usuarios.buscarPorId(usuario.id);

        if (!cliente) {
            throw new NaoEncontradoError("Usuário não encontrado");
        }

        const itens: ItemPedido[] = [];

        for (const { livroId, quantidade } of solicitados) {
            const livro = await this.livros.buscarPorId(livroId);

            if (!livro) {
                throw new ValidacaoError({ itens: "Um dos livros do pedido não foi encontrado" });
            }

            // Não permitir quantidade maior que o estoque
            livro.retirarEstoque(quantidade);
            // Preço registrado no momento da compra
            itens.push(new ItemPedido(livro.id, livro.titulo, quantidade, livro.preco));
        }

        const pedido = new Pedido({ cliente: { id: cliente.id, nome: cliente.nome }, itens, status: "pendente" });
        await this.pedidos.salvar(pedido);
        return pedido;
    }

    // Edição do pedido: alteração de status; cancelar devolve os livros ao estoque
    async atualizar(id: string, entrada: Entrada): Promise<Pedido> {
        const status = texto(entrada.status) as StatusPedido;

        if (!STATUS_PEDIDO.includes(status)) {
            throw new ValidacaoError({ status: `Status inválido. Use: ${STATUS_PEDIDO.join(", ")}` });
        }

        const pedido = await this.buscar(id);
        pedido.alterarStatus(status);

        if (status === "cancelado") {
            await this.pedidos.cancelar(pedido);
        } else {
            await this.pedidos.atualizar(pedido);
        }
        return pedido;
    }

    private lerItens(entrada: Entrada): ItemSolicitado[] {
        const itens = entrada.itens;

        if (!Array.isArray(itens) || itens.length === 0) {
            throw new ValidacaoError({ itens: "Informe ao menos um livro" });
        }
        if (itens.length > MAXIMO_ITENS) {
            throw new ValidacaoError({ itens: `Máximo de ${MAXIMO_ITENS} livros diferentes por pedido` });
        }

        const lidos = itens.map((item) => {
            const dados = (item ?? {}) as Entrada;
            return { livroId: texto(dados.livroId).trim(), quantidade: numero(dados.quantidade) };
        });

        if (lidos.some((item) => !item.livroId || !Number.isInteger(item.quantidade) || item.quantidade < 1)) {
            throw new ValidacaoError({ itens: "Cada item precisa de um livro e de uma quantidade inteira maior que zero" });
        }
        if (new Set(lidos.map((item) => item.livroId)).size !== lidos.length) {
            throw new ValidacaoError({ itens: "O mesmo livro foi informado mais de uma vez" });
        }

        return lidos;
    }
}
