import { Autor } from "../models/Autor";
import { Repositorio } from "../repositories/Repositorio";
import { Entrada } from "../utils/entrada";
import { CrudService } from "./CrudService";

export class AutorService extends CrudService<Autor> {
    constructor(repositorio: Repositorio<Autor>) {
        super(repositorio, "Autor não encontrado");
    }

    async criar(entrada: Entrada): Promise<Autor> {
        const autor = new Autor(Autor.validar(entrada));
        await this.repositorio.salvar(autor);
        return autor;
    }

    async atualizar(id: string, entrada: Entrada): Promise<Autor> {
        const autor = await this.buscar(id);
        autor.atualizar(Autor.validar(entrada));
        await this.repositorio.atualizar(autor);
        return autor;
    }
}
