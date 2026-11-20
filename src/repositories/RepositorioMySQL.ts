import { RowDataPacket } from "mysql2";
import { conexao } from "../database/conexao";
import { ConflitoError } from "../errors/ConflitoError";
import { Entidade } from "../models/Entidade";
import { Filtros, Pagina, Paginacao } from "../types/paginacao";
import { Repositorio } from "./Repositorio";

export type Linha = Record<string, string | number | Date | null>;

function codigoErro(erro: unknown): string | undefined {
    return (erro as { code?: string }).code;
}

// Classe abstrata genérica: o SQL comum fica aqui e cada repositório informa só o que muda
export abstract class RepositorioMySQL<T extends Entidade> implements Repositorio<T> {
    protected abstract readonly tabela: string;
    protected abstract readonly ordenacao: string;
    protected readonly camposUnicos: Record<string, string> = {};
    protected readonly mensagemVinculo: string = "Não é possível excluir: existem registros vinculados";

    protected abstract paraLinha(entidade: T): Linha;
    protected abstract deLinha(linha: RowDataPacket): T;

    protected selecao(): string {
        return `SELECT * FROM ${this.tabela}`;
    }

    async salvar(entidade: T): Promise<void> {
        const linha = this.paraLinha(entidade);
        const colunas = Object.keys(linha);
        const marcadores = colunas.map(() => "?").join(", ");

        await this.executar(
            `INSERT INTO ${this.tabela} (${colunas.join(", ")}) VALUES (${marcadores})`,
            Object.values(linha)
        );
    }

    async atualizar(entidade: T): Promise<void> {
        const { id, criado_em, ...campos } = this.paraLinha(entidade);
        const atribuicoes = Object.keys(campos).map((coluna) => `${coluna} = ?`).join(", ");

        await this.executar(
            `UPDATE ${this.tabela} SET ${atribuicoes} WHERE id = ?`,
            [...Object.values(campos), id]
        );
    }

    async buscarPorId(id: string): Promise<T | undefined> {
        const [linhas] = await conexao.query<RowDataPacket[]>(
            `${this.selecao()} WHERE ${this.tabela}.id = ?`,
            [id]
        );
        return linhas.length > 0 ? this.deLinha(linhas[0]) : undefined;
    }

    // Paginação das listagens
    async listar({ pagina, limite }: Paginacao, filtros: Filtros = {}): Promise<Pagina<T>> {
        const condicoes = Object.keys(filtros).map((coluna) => `${coluna} = ?`);
        const where = condicoes.length > 0 ? ` WHERE ${condicoes.join(" AND ")}` : "";
        const valores = Object.values(filtros);

        const [contagem] = await conexao.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total FROM ${this.tabela}${where}`,
            valores
        );
        const [linhas] = await conexao.query<RowDataPacket[]>(
            `${this.selecao()}${where} ORDER BY ${this.ordenacao} LIMIT ? OFFSET ?`,
            [...valores, limite, (pagina - 1) * limite]
        );

        const total = Number(contagem[0].total);

        return {
            itens: linhas.map((linha) => this.deLinha(linha)),
            pagina,
            limite,
            total,
            totalPaginas: Math.ceil(total / limite),
        };
    }

    async excluir(id: string): Promise<void> {
        try {
            await conexao.execute(`DELETE FROM ${this.tabela} WHERE id = ?`, [id]);
        } catch (erro) {
            if (codigoErro(erro) === "ER_ROW_IS_REFERENCED_2") {
                throw new ConflitoError(this.mensagemVinculo);
            }
            throw erro;
        }
    }

    private async executar(sql: string, valores: Linha[keyof Linha][]): Promise<void> {
        try {
            await conexao.execute(sql, valores);
        } catch (erro) {
            if (codigoErro(erro) === "ER_DUP_ENTRY") {
                const mensagemErro = (erro as Error).message;
                const campo = Object.keys(this.camposUnicos).find((c) => mensagemErro.includes(`.${c}'`));

                if (campo) {
                    throw new ConflitoError(this.camposUnicos[campo], { [campo]: this.camposUnicos[campo] });
                }
                throw new ConflitoError("Registro já cadastrado");
            }
            throw erro;
        }
    }
}
