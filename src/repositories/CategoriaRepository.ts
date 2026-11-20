import { RowDataPacket } from "mysql2";
import { Categoria } from "../models/Categoria";
import { Linha, RepositorioMySQL } from "./RepositorioMySQL";

export class CategoriaRepository extends RepositorioMySQL<Categoria> {
    protected readonly tabela = "categorias";
    protected readonly ordenacao = "nome";
    protected readonly camposUnicos = { nome: "Já existe uma categoria com este nome" };
    protected readonly mensagemVinculo = "Não é possível excluir: existem livros nesta categoria";

    protected paraLinha(categoria: Categoria): Linha {
        const { id, nome, descricao } = categoria.toJSON();
        return { id, nome, descricao, criado_em: categoria.criadoEm };
    }

    protected deLinha(linha: RowDataPacket): Categoria {
        return new Categoria({ nome: linha.nome, descricao: linha.descricao }, linha.id, linha.criado_em);
    }
}
