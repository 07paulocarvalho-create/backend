import { ValidacaoError } from "../errors/ValidacaoError";
import { Autor } from "../models/Autor";
import { Categoria } from "../models/Categoria";
import { Livro, LivroDados, LivroValidado } from "../models/Livro";
import { Repositorio } from "../repositories/Repositorio";
import { Filtros, Pagina, Paginacao } from "../types/paginacao";
import { Entrada, texto } from "../utils/entrada";
import { CrudService } from "./CrudService";

export class LivroService extends CrudService<Livro> {
    constructor(
        repositorio: Repositorio<Livro>,
        private readonly autores: Repositorio<Autor>,
        private readonly categorias: Repositorio<Categoria>
    ) {
        super(repositorio, "Livro não encontrado");
    }

    // Catálogo organizado por categoria: ?categoriaId=... e ?autorId=...
    async listar(paginacao: Paginacao, consulta: Entrada = {}): Promise<Pagina<Livro>> {
        const filtros: Filtros = {};
        const categoriaId = texto(consulta.categoriaId);
        const autorId = texto(consulta.autorId);

        if (categoriaId) {
            filtros["livros.categoria_id"] = categoriaId;
        }
        if (autorId) {
            filtros["livros.autor_id"] = autorId;
        }

        return this.repositorio.listar(paginacao, filtros);
    }

    async criar(entrada: Entrada): Promise<Livro> {
        const livro = new Livro(await this.montarDados(Livro.validar(entrada)));
        await this.repositorio.salvar(livro);
        return livro;
    }

    async atualizar(id: string, entrada: Entrada): Promise<Livro> {
        const livro = await this.buscar(id);
        livro.atualizar(await this.montarDados(Livro.validar(entrada)));
        await this.repositorio.atualizar(livro);
        return livro;
    }

    // Relacionamento: o autor e a categoria informados precisam existir
    private async montarDados({ autorId, categoriaId, ...dados }: LivroValidado): Promise<LivroDados> {
        const autor = await this.autores.buscarPorId(autorId);
        const categoria = await this.categorias.buscarPorId(categoriaId);

        ValidacaoError.verificar({
            autorId: autor ? null : "Autor não encontrado",
            categoriaId: categoria ? null : "Categoria não encontrada",
        });

        return {
            ...dados,
            autor: { id: autor!.id, nome: autor!.nome },
            categoria: { id: categoria!.id, nome: categoria!.nome },
        };
    }
}
