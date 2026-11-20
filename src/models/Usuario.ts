import { randomUUID } from "crypto";
import { AppError } from "../errors/AppError";
import { Cpf } from "./Cpf";
import { Email } from "./Email";
import { Senha } from "./Senha";

export type DadosUsuario = {
    id?: string;
    nome: string;
    email: Email;
    cpf: Cpf;
    senha: Senha;
    criadoEm?: Date;
};

export type UsuarioRegistro = {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    senha: string;
    criado_em: Date;
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
    constructor({ id = randomUUID(), nome, email, cpf, senha, criadoEm = new Date() }: DadosUsuario) {
        this.#id = id;
        this.#nome = Usuario.normalizarNome(nome);
        this.#email = email;
        this.#cpf = cpf;
        this.#senha = senha;
        this.#criadoEm = criadoEm;
    }

    static restaurar(registro: UsuarioRegistro): Usuario {
        return new Usuario({
            id: registro.id,
            nome: registro.nome,
            email: Email.criar(registro.email),
            cpf: Cpf.criar(registro.cpf),
            senha: Senha.restaurar(registro.senha),
            criadoEm: registro.criado_em,
        });
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

    autenticar(senha: string): boolean {
        return this.#senha.confere(senha);
    }

    paraRegistro(): UsuarioRegistro {
        return {
            id: this.#id,
            nome: this.#nome,
            email: this.#email.endereco,
            cpf: this.#cpf.formatado,
            senha: this.#senha.paraArmazenamento(),
            criado_em: this.#criadoEm,
        };
    }

    // Exposição apenas dos dados públicos, a senha nunca vai para a resposta
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
