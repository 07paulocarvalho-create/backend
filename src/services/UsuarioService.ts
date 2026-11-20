import { AppError, ErrosPorCampo } from "../errors/AppError";
import { Cpf } from "../models/Cpf";
import { Email } from "../models/Email";
import { Senha } from "../models/Senha";
import { Usuario } from "../models/Usuario";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
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

function texto(valor: unknown): string {
    return typeof valor === "string" ? valor : "";
}

export class UsuarioService {
    // Encapsulamento: dependência privada injetada pelo construtor
    constructor(private readonly repositorio: UsuarioRepository) {}

    // Cadastro de Usuário: nome, email, senha e CPF obrigatórios
    async cadastrar(entrada: UsuarioEntrada): Promise<Usuario> {
        const nome = texto(entrada.nome);
        const email = texto(entrada.email);
        const senha = texto(entrada.senha);
        const cpf = texto(entrada.cpf);

        this.validarCampos({
            nome: Usuario.validarNome(nome),
            email: Email.validar(email),
            senha: Senha.validar(senha),
            cpf: Cpf.validar(cpf),
        });

        const emailUsuario = Email.criar(email);
        const cpfUsuario = Cpf.criar(cpf);

        if (await this.repositorio.buscarPorEmail(emailUsuario)) {
            throw new AppError("Email já cadastrado", 409, { email: "Este email já está em uso" });
        }

        if (await this.repositorio.buscarPorCpf(cpfUsuario)) {
            throw new AppError("CPF já cadastrado", 409, { cpf: "Este CPF já está em uso" });
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
            throw new AppError("Informe email e senha", 400);
        }

        const erroEmail = Email.validar(email);
        if (erroEmail) {
            throw new AppError(erroEmail, 400, { email: erroEmail });
        }

        const usuario = await this.repositorio.buscarPorEmail(Email.criar(email));

        // Logar apenas usuário existente
        if (!usuario || !usuario.autenticar(senha)) {
            throw new AppError("Email ou senha incorretos", 401);
        }

        const token = gerarToken({ id: usuario.id, perfil: usuario.perfil });
        return { token, usuario };
    }

    async buscarLogado(idLogado: string): Promise<Usuario> {
        const usuario = await this.repositorio.buscarPorId(idLogado);
        if (!usuario) {
            throw new AppError("Usuário não encontrado", 404);
        }
        return usuario;
    }

    // Edição de Usuário
    async atualizar(id: string, idLogado: string, entrada: UsuarioEntrada): Promise<Usuario> {
        // Só pode editar o próprio usuário
        if (id !== idLogado) {
            throw new AppError("Você só pode editar o seu próprio usuário", 403);
        }

        const usuario = await this.buscarLogado(idLogado);

        // Não permitir que o usuário altere o email
        if (entrada.email !== undefined && !usuario.possuiEmail(texto(entrada.email))) {
            throw new AppError("O email não pode ser alterado", 400, { email: "O email não pode ser alterado" });
        }

        const nome = texto(entrada.nome);
        const senha = texto(entrada.senha);
        const cpf = texto(entrada.cpf);

        // Todos os campos obrigatórios, com validação de CPF e de nível de senha
        this.validarCampos({
            nome: Usuario.validarNome(nome),
            senha: Senha.validar(senha),
            cpf: Cpf.validar(cpf),
        });

        const cpfUsuario = Cpf.criar(cpf);
        const donoDoCpf = await this.repositorio.buscarPorCpf(cpfUsuario);

        if (donoDoCpf && donoDoCpf.id !== usuario.id) {
            throw new AppError("CPF já cadastrado", 409, { cpf: "Este CPF já está em uso" });
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

    private validarCampos(validacoes: Record<string, string | null>): void {
        const erros: ErrosPorCampo = {};

        for (const [campo, erro] of Object.entries(validacoes)) {
            if (erro) {
                erros[campo] = erro;
            }
        }

        if (Object.keys(erros).length > 0) {
            throw new AppError("Dados inválidos", 400, erros);
        }
    }
}
