import { RowDataPacket } from "mysql2";
import { conexao } from "../database/conexao";
import { Cpf } from "../models/Cpf";
import { Email } from "../models/Email";
import { Usuario, UsuarioRegistro } from "../models/Usuario";

type LinhaUsuario = UsuarioRegistro & RowDataPacket;

export class UsuarioRepository {
    async salvar(usuario: Usuario): Promise<void> {
        const { id, nome, email, cpf, senha, criado_em } = usuario.paraRegistro();

        await conexao.execute(
            "INSERT INTO usuarios (id, nome, email, cpf, senha, criado_em) VALUES (?, ?, ?, ?, ?, ?)",
            [id, nome, email, cpf, senha, criado_em]
        );
    }

    async buscarPorEmail(email: Email): Promise<Usuario | undefined> {
        return this.buscarUm("SELECT * FROM usuarios WHERE email = ?", email.endereco);
    }

    async buscarPorCpf(cpf: Cpf): Promise<Usuario | undefined> {
        return this.buscarUm("SELECT * FROM usuarios WHERE cpf = ?", cpf.formatado);
    }

    async listar(): Promise<Usuario[]> {
        const [linhas] = await conexao.query<LinhaUsuario[]>("SELECT * FROM usuarios ORDER BY nome");
        return linhas.map((linha) => Usuario.restaurar(linha));
    }

    private async buscarUm(sql: string, valor: string): Promise<Usuario | undefined> {
        const [linhas] = await conexao.execute<LinhaUsuario[]>(sql, [valor]);
        return linhas.length > 0 ? Usuario.restaurar(linhas[0]) : undefined;
    }
}
