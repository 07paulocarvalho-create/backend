import { NaoEncontradoError } from "../errors/NaoEncontradoError";
import { Entidade } from "../models/Entidade";
import { Repositorio } from "../repositories/Repositorio";
import { Pagina, Paginacao } from "../types/paginacao";
import { Entrada } from "../utils/entrada";
import { UsuarioAutenticado } from "../utils/token";

// Contrato usado pelo controller genérico; qualquer service que o cumpra pode ser usado no lugar
export interface ServicoCrud<T extends Entidade> {
    listar(paginacao: Paginacao, consulta: Entrada, usuario: UsuarioAutenticado): Promise<Pagina<T>>;
    buscar(id: string, usuario: UsuarioAutenticado): Promise<T>;
    criar(entrada: Entrada, usuario: UsuarioAutenticado): Promise<T>;
    atualizar(id: string, entrada: Entrada, usuario: UsuarioAutenticado): Promise<T>;
    excluir(id: string, usuario: UsuarioAutenticado): Promise<void>;
}

export abstract class CrudService<T extends Entidade> implements ServicoCrud<T> {
    constructor(
        protected readonly repositorio: Repositorio<T>,
        private readonly mensagemNaoEncontrado: string
    ) {}

    async listar(paginacao: Paginacao): Promise<Pagina<T>> {
        return this.repositorio.listar(paginacao);
    }

    async buscar(id: string, _usuario?: UsuarioAutenticado): Promise<T> {
        const entidade = await this.repositorio.buscarPorId(id);
        if (!entidade) {
            throw new NaoEncontradoError(this.mensagemNaoEncontrado);
        }
        return entidade;
    }

    abstract criar(entrada: Entrada, usuario: UsuarioAutenticado): Promise<T>;

    abstract atualizar(id: string, entrada: Entrada, usuario: UsuarioAutenticado): Promise<T>;

    // Não deletar recursos que não existem: buscar() lança 404 antes
    async excluir(id: string, usuario: UsuarioAutenticado): Promise<void> {
        await this.buscar(id, usuario);
        await this.repositorio.excluir(id);
    }
}
