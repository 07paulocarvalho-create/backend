import { Cpf } from "../models/Cpf";
import { Email } from "../models/Email";
import { Usuario } from "../models/Usuario";

export class UsuarioRepository {
    // Encapsulamento: a coleção não é acessível fora da classe
    readonly #usuarios = new Map<string, Usuario>();

    salvar(usuario: Usuario): void {
        this.#usuarios.set(usuario.id, usuario);
    }

    buscarPorEmail(email: Email): Usuario | undefined {
        return this.listar().find((usuario) => usuario.possuiEmail(email));
    }

    buscarPorCpf(cpf: Cpf): Usuario | undefined {
        return this.listar().find((usuario) => usuario.possuiCpf(cpf));
    }

    // Devolve uma cópia para que a lista interna não seja modificada por fora
    listar(): Usuario[] {
        return [...this.#usuarios.values()];
    }
}
