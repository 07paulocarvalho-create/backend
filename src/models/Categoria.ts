import { ValidacaoError } from "../errors/ValidacaoError";
import { Entrada, erroTexto, texto } from "../utils/entrada";
import { Entidade } from "./Entidade";

export type CategoriaDados = {
    nome: string;
    descricao: string | null;
};

export type CategoriaJSON = CategoriaDados & {
    id: string;
    criadoEm: string;
};

export class Categoria extends Entidade {
    #nome: string;
    #descricao: string | null;

    constructor(dados: CategoriaDados, id?: string, criadoEm?: Date) {
        super(id, criadoEm);
        this.#nome = dados.nome;
        this.#descricao = dados.descricao;
    }

    static validar(entrada: Entrada): CategoriaDados {
        const nome = texto(entrada.nome).trim();
        const descricao = texto(entrada.descricao).trim();

        ValidacaoError.verificar({
            nome: erroTexto(nome, 60),
            descricao: erroTexto(descricao, 255, false),
        });

        return { nome, descricao: descricao || null };
    }

    atualizar(dados: CategoriaDados): void {
        this.#nome = dados.nome;
        this.#descricao = dados.descricao;
    }

    toJSON(): CategoriaJSON {
        return {
            id: this.id,
            nome: this.#nome,
            descricao: this.#descricao,
            criadoEm: this.criadoEm.toISOString(),
        };
    }
}
