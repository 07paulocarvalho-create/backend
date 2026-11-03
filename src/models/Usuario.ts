import { randomUUID } from "crypto";
import { AppError } from "../errors/AppError";
import { Cpf } from "./Cpf";
import { Email } from "./Email";
import { Senha } from "./Senha";

export type DadosUsuario = {
    nome: string;
    email: Email;
    cpf: Cpf;
    senha: Senha;
};

export type UsuarioResposta = {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    criadoEm: string;
};

export class Usuario {
    // Encapsulamento e proteção do estado: campos privados nativos
    readonly #id: string;
    #nome: string;
    readonly #email: Email;
    readonly #cpf: Cpf;
    readonly #senha: Senha;
    readonly #criadoEm: Date;

    // Construtor limpo: apenas inicializa as propriedades
    constructor({ nome, email, cpf, senha }: DadosUsuario) {
        this.#id = randomUUID();
        this.#nome = Usuario.normalizarNome(nome);
        this.#email = email;
        this.#cpf = cpf;
        this.#senha = senha;
        this.#criadoEm = new Date();
    }

    static validarNome(valor: string): string | null {
        const nome = Usuario.normalizarNome(valor ?? "");

        if (!nome) {
            return "O nome é obrigatório";
        }
        if (nome.length < 3) {
            return "O nome deve ter no mínimo 3 caracteres";
        }
        if (nome.length > 100) {
            return "O nome deve ter no máximo 100 caracteres";
        }
        return null;
    }

    private static normalizarNome(valor: string): string {
        return valor.trim().replace(/\s+/g, " ");
    }

    // Acesso controlado: id somente leitura
    get id(): string {
        return this.#id;
    }

    get nome(): string {
        return this.#nome;
    }

    // Acesso controlado: setter existe porque aplica validação antes de alterar o estado
    set nome(valor: string) {
        const erro = Usuario.validarNome(valor);
        if (erro) {
            throw new AppError(erro, 400, { nome: erro });
        }
        this.#nome = Usuario.normalizarNome(valor);
    }

    possuiEmail(email: Email): boolean {
        return this.#email.igual(email);
    }

    possuiCpf(cpf: Cpf): boolean {
        return this.#cpf.igual(cpf);
    }

    autenticar(senha: string): boolean {
        return this.#senha.confere(senha);
    }

    // Exposição apenas dos dados públicos, a senha nunca sai do objeto
    toJSON(): UsuarioResposta {
        return {
            id: this.#id,
            nome: this.#nome,
            email: this.#email.endereco,
            cpf: this.#cpf.formatado,
            criadoEm: this.#criadoEm.toISOString(),
        };
    }
}
