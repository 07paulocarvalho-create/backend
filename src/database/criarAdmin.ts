import { Cpf } from "../models/Cpf";
import { Email } from "../models/Email";
import { Senha } from "../models/Senha";
import { Usuario } from "../models/Usuario";
import { UsuarioRepository } from "../repositories/UsuarioRepository";

export async function criarAdmin(repositorio: UsuarioRepository): Promise<void> {
    const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA, ADMIN_CPF } = process.env;

    if (!ADMIN_NOME || !ADMIN_EMAIL || !ADMIN_SENHA || !ADMIN_CPF) {
        console.warn("Administrador não criado: preencha ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA e ADMIN_CPF no .env");
        return;
    }

    const email = Email.criar(ADMIN_EMAIL);

    if (await repositorio.buscarPorEmail(email)) {
        return;
    }

    const admin = new Usuario({
        nome: ADMIN_NOME,
        email,
        cpf: Cpf.criar(ADMIN_CPF),
        senha: Senha.criar(ADMIN_SENHA),
        perfil: "admin",
    });

    await repositorio.salvar(admin);
    console.log(`Administrador ${email.endereco} criado`);
}
