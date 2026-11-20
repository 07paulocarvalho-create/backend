import { Entidade } from "../models/Entidade";
import { Filtros, Pagina, Paginacao } from "../types/paginacao";

// Contrato genérico: os services dependem desta interface, não do MySQL (inversão de dependência)
export interface Repositorio<T extends Entidade> {
    salvar(entidade: T): Promise<void>;
    atualizar(entidade: T): Promise<void>;
    buscarPorId(id: string): Promise<T | undefined>;
    listar(paginacao: Paginacao, filtros?: Filtros): Promise<Pagina<T>>;
    excluir(id: string): Promise<void>;
}
