import { ConflitoError } from "../errors/ConflitoError";
import { NaoAutorizadoError } from "../errors/NaoAutorizadoError";
import { NaoEncontradoError } from "../errors/NaoEncontradoError";
import { ProibidoError } from "../errors/ProibidoError";
import { ValidacaoError } from "../errors/ValidacaoError";
import { Cpf } from "../models/Cpf";
import { Email } from "../models/Email";
import { Senha } from "../models/Senha";
import { Usuario } from "../models/Usuario";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { texto } from "../utils/entrada";
import { gerarToken } from "../utils/token";

export type UsuarioEntrada = {
    nome?: unknown;
    email?: unknown;
    senha?: unknown;
    cpf?: unknown;
};

export type LoginEntrada = {
    email?: unknown;
    senha?: unknown;
};

export class UsuarioService {
    // Encapsulamento: dependência privada injetada pelo construtor
    constructor(private readonly repositorio: UsuarioRepository) {}

    // Cadastro de Usuário: nome, email, senha e CPF obrigatórios
    async cadastrar(entrada: UsuarioEntrada): Promise<Usuario> {
        const nome = texto(entrada.nome);
        const email = texto(entrada.email);
        const senha = texto(entrada.senha);
        const cpf = texto(entrada.cpf);

        ValidacaoError.verificar({
            nome: Usuario.validarNome(nome),
            email: Email.validar(email),
            senha: Senha.validar(senha),
            cpf: Cpf.validar(cpf),
        });

        const emailUsuario = Email.criar(email);
        const cpfUsuario = Cpf.criar(cpf);

        if (await this.repositorio.buscarPorEmail(emailUsuario)) {
            throw new ConflitoError("Email já cadastrado", { email: "Este email já está em uso" });
        }

        if (await this.repositorio.buscarPorCpf(cpfUsuario)) {
            throw new ConflitoError("CPF já cadastrado", { cpf: "Este CPF já está em uso" });
        }

        const usuario = new Usuario({
            nome,
            email: emailUsuario,
            cpf: cpfUsuario,
            senha: Senha.criar(senha),
        });

        await this.repositorio.salvar(usuario);
        return usuario;
    }

    // Autenticação: login com email e senha
    async autenticar(entrada: LoginEntrada): Promise<{ token: string; usuario: Usuario }> {
        const email = texto(entrada.email);
        const senha = texto(entrada.senha);

        if (!email || !senha) {
            throw new ValidacaoError({}, "Informe email e senha");
        }

        const erroEmail = Email.validar(email);
        if (erroEmail) {
            throw new ValidacaoError({ email: erroEmail }, erroEmail);
        }

        const usuario = await this.repositorio.buscarPorEmail(Email.criar(email));

        // Logar apenas usuário existente
        if (!usuario || !usuario.autenticar(senha)) {
            throw new NaoAutorizadoError("Email ou senha incorretos");
        }

        const token = gerarToken({ id: usuario.id, perfil: usuario.perfil });
        return { token, usuario };
    }

    async buscarLogado(idLogado: string): Promise<Usuario> {
        const usuario = await this.repositorio.buscarPorId(idLogado);
        if (!usuario) {
            throw new NaoEncontradoError("Usuário não encontrado");
        }
        return usuario;
    }

    // Edição de Usuário
    async atualizar(id: string, idLogado: string, entrada: UsuarioEntrada): Promise<Usuario> {
        // Só pode editar o próprio usuário
        if (id !== idLogado) {
            throw new ProibidoError("Você só pode editar o seu próprio usuário");
        }

        const usuario = await this.buscarLogado(idLogado);

        // Não permitir que o usuário altere o email
        if (entrada.email !== undefined && !usuario.possuiEmail(texto(entrada.email))) {
            throw new ValidacaoError({ email: "O email não pode ser alterado" }, "O email não pode ser alterado");
        }

        const nome = texto(entrada.nome);
        const senha = texto(entrada.senha);
        const cpf = texto(entrada.cpf);

        // Todos os campos obrigatórios, com validação de CPF e de nível de senha
        ValidacaoError.verificar({
            nome: Usuario.validarNome(nome),
            senha: Senha.validar(senha),
            cpf: Cpf.validar(cpf),
        });

        const cpfUsuario = Cpf.criar(cpf);
        const donoDoCpf = await this.repositorio.buscarPorCpf(cpfUsuario);

        if (donoDoCpf && donoDoCpf.id !== usuario.id) {
            throw new ConflitoError("CPF já cadastrado", { cpf: "Este CPF já está em uso" });
        }

        usuario.nome = nome;
        usuario.alterarCpf(cpfUsuario);
        usuario.alterarSenha(Senha.criar(senha));

        await this.repositorio.atualizar(usuario);
        return usuario;
    }

    async listar(): Promise<Usuario[]> {
        return this.repositorio.listar();
    }
}
