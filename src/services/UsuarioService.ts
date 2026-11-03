import { AppError, ErrosPorCampo } from "../errors/AppError";
import { Cpf } from "../models/Cpf";
import { Email } from "../models/Email";
import { Senha } from "../models/Senha";
import { Usuario } from "../models/Usuario";
import { UsuarioRepository } from "../repositories/UsuarioRepository";

export type CadastroUsuarioEntrada = {
    nome?: unknown;
    email?: unknown;
    senha?: unknown;
    cpf?: unknown;
};

export type LoginEntrada = {
    email?: unknown;
    senha?: unknown;
};

function texto(valor: unknown): string {
    return typeof valor === "string" ? valor : "";
}

export class UsuarioService {
    // Encapsulamento: dependência privada injetada pelo construtor
    constructor(private readonly repositorio: UsuarioRepository) {}

    // Cadastro de Usuário: nome, email, senha e CPF obrigatórios
    cadastrar(entrada: CadastroUsuarioEntrada): Usuario {
        const nome = texto(entrada.nome);
        const email = texto(entrada.email);
        const senha = texto(entrada.senha);
        const cpf = texto(entrada.cpf);

        const erros: ErrosPorCampo = {};
        const validacoes = {
            nome: Usuario.validarNome(nome),
            email: Email.validar(email),
            senha: Senha.validar(senha),
            cpf: Cpf.validar(cpf),
        };

        for (const [campo, erro] of Object.entries(validacoes)) {
            if (erro) {
                erros[campo] = erro;
            }
        }

        if (Object.keys(erros).length > 0) {
            throw new AppError("Dados inválidos", 400, erros);
        }

        const emailUsuario = Email.criar(email);
        const cpfUsuario = Cpf.criar(cpf);

        if (this.repositorio.buscarPorEmail(emailUsuario)) {
            throw new AppError("Email já cadastrado", 409, { email: "Este email já está em uso" });
        }

        if (this.repositorio.buscarPorCpf(cpfUsuario)) {
            throw new AppError("CPF já cadastrado", 409, { cpf: "Este CPF já está em uso" });
        }

        const usuario = new Usuario({
            nome,
            email: emailUsuario,
            cpf: cpfUsuario,
            senha: Senha.criar(senha),
        });

        this.repositorio.salvar(usuario);
        return usuario;
    }

    autenticar(entrada: LoginEntrada): Usuario {
        const email = texto(entrada.email);
        const senha = texto(entrada.senha);

        if (!email || !senha) {
            throw new AppError("Informe email e senha", 400);
        }

        const erroEmail = Email.validar(email);
        const usuario = erroEmail ? undefined : this.repositorio.buscarPorEmail(Email.criar(email));

        if (!usuario || !usuario.autenticar(senha)) {
            throw new AppError("Email ou senha incorretos", 401);
        }

        return usuario;
    }

    listar(): Usuario[] {
        return this.repositorio.listar();
    }
}
