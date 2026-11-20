import { ValidacaoError } from "../errors/ValidacaoError";
import { Entrada, erroTexto, texto } from "../utils/entrada";
import { Entidade } from "./Entidade";

export type AutorDados = {
    nome: string;
    biografia: string | null;
};

export type AutorJSON = AutorDados & {
    id: string;
    criadoEm: string;
};

export class Autor extends Entidade {
    #nome: string;
    #biografia: string | null;

    constructor(dados: AutorDados, id?: string, criadoEm?: Date) {
        super(id, criadoEm);
        this.#nome = dados.nome;
        this.#biografia = dados.biografia;
    }

    static validar(entrada: Entrada): AutorDados {
        const nome = texto(entrada.nome).trim();
        const biografia = texto(entrada.biografia).trim();

        ValidacaoError.verificar({
            nome: erroTexto(nome, 100),
            biografia: erroTexto(biografia, 1000, false),
        });

        return { nome, biografia: biografia || null };
    }

    get nome(): string {
        return this.#nome;
    }

    atualizar(dados: AutorDados): void {
        this.#nome = dados.nome;
        this.#biografia = dados.biografia;
    }

    toJSON(): AutorJSON {
        return {
            id: this.id,
            nome: this.#nome,
            biografia: this.#biografia,
            criadoEm: this.criadoEm.toISOString(),
        };
    }
}
