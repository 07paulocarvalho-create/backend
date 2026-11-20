import { Categoria } from "../models/Categoria";
import { Repositorio } from "../repositories/Repositorio";
import { Entrada } from "../utils/entrada";
import { CrudService } from "./CrudService";

export class CategoriaService extends CrudService<Categoria> {
    constructor(repositorio: Repositorio<Categoria>) {
        super(repositorio, "Categoria não encontrada");
    }

    async criar(entrada: Entrada): Promise<Categoria> {
        const categoria = new Categoria(Categoria.validar(entrada));
        await this.repositorio.salvar(categoria);
        return categoria;
    }

    // Não editar recursos que não existem: buscar() lança 404 antes de validar
    async atualizar(id: string, entrada: Entrada): Promise<Categoria> {
        const categoria = await this.buscar(id);
        categoria.atualizar(Categoria.validar(entrada));
        await this.repositorio.atualizar(categoria);
        return categoria;
    }
}
