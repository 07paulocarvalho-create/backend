import { ValidacaoError } from "../errors/ValidacaoError";
import { Cpf } from "./Cpf";
import { Email } from "./Email";
import { Entidade } from "./Entidade";
import { Senha } from "./Senha";

export type Perfil = "admin" | "cliente";

export type DadosUsuario = {
    id?: string;
    nome: string;
    email: Email;
    cpf: Cpf;
    senha: Senha;
    perfil?: Perfil;
    criadoEm?: Date;
};

export type UsuarioRegistro = {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    senha: string;
    perfil: Perfil;
    criado_em: Date;
};

export type UsuarioResposta = {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    perfil: Perfil;
    criadoEm: string;
};

export class Usuario extends Entidade {
    // Encapsulamento e proteção do estado: campos privados nativos
    #nome: string;
    // Email readonly: não existe forma de alterá-lo depois do cadastro
    readonly #email: Email;
    #cpf: Cpf;
    #senha: Senha;
    readonly #perfil: Perfil;

    // Construtor limpo: apenas inicializa as propriedades
    constructor({ id, nome, email, cpf, senha, perfil = "cliente", criadoEm }: DadosUsuario) {
        super(id, criadoEm);
        this.#nome = Usuario.normalizarNome(nome);
        this.#email = email;
        this.#cpf = cpf;
        this.#senha = senha;
        this.#perfil = perfil;
    }

    static restaurar(registro: UsuarioRegistro): Usuario {
        return new Usuario({
            id: registro.id,
            nome: registro.nome,
            email: Email.criar(registro.email),
            cpf: Cpf.criar(registro.cpf),
            senha: Senha.restaurar(registro.senha),
            perfil: registro.perfil,
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

    // Acesso controlado: perfil só pode ser lido, nunca alterado pela API
    get perfil(): Perfil {
        return this.#perfil;
    }

    get nome(): string {
        return this.#nome;
    }

    // Acesso controlado: setter existe porque aplica validação antes de alterar o estado
    set nome(valor: string) {
        const erro = Usuario.validarNome(valor);
        if (erro) {
            throw new ValidacaoError({ nome: erro }, erro);
        }
        this.#nome = Usuario.normalizarNome(valor);
    }

    alterarCpf(cpf: Cpf): void {
        this.#cpf = cpf;
    }

    alterarSenha(senha: Senha): void {
        this.#senha = senha;
    }

    possuiEmail(endereco: string): boolean {
        return this.#email.endereco === endereco.trim().toLowerCase();
    }

    autenticar(senha: string): boolean {
        return this.#senha.confere(senha);
    }

    paraRegistro(): UsuarioRegistro {
        return {
            id: this.id,
            nome: this.#nome,
            email: this.#email.endereco,
            cpf: this.#cpf.formatado,
            senha: this.#senha.paraArmazenamento(),
            perfil: this.#perfil,
            criado_em: this.criadoEm,
        };
    }

    // Exposição apenas dos dados públicos, a senha nunca vai para a resposta
    toJSON(): UsuarioResposta {
        return {
            id: this.id,
            nome: this.#nome,
            email: this.#email.endereco,
            cpf: this.#cpf.formatado,
            perfil: this.#perfil,
            criadoEm: this.criadoEm.toISOString(),
        };
    }
}
