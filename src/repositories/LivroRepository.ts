import { RowDataPacket } from "mysql2";
import { Livro } from "../models/Livro";
import { Linha, RepositorioMySQL } from "./RepositorioMySQL";

export class LivroRepository extends RepositorioMySQL<Livro> {
    protected readonly tabela = "livros";
    protected readonly ordenacao = "livros.titulo";
    protected readonly camposUnicos = { isbn: "Já existe um livro com este ISBN" };
    protected readonly mensagemVinculo = "Não é possível excluir: este livro já está em pedidos";

    // Relacionamento: traz o nome do autor e da categoria junto com o livro
    protected selecao(): string {
        return `SELECT livros.*, autores.nome AS autor_nome, categorias.nome AS categoria_nome
            FROM livros
            JOIN autores ON autores.id = livros.autor_id
            JOIN categorias ON categorias.id = livros.categoria_id`;
    }

    protected paraLinha(livro: Livro): Linha {
        const { id, titulo, descricao, preco, isbn, estoque, capaUrl, autor, categoria } = livro.toJSON();
        return {
            id,
            titulo,
            descricao,
            preco,
            isbn,
            estoque,
            capa_url: capaUrl,
            autor_id: autor.id,
            categoria_id: categoria.id,
            criado_em: livro.criadoEm,
        };
    }

    protected deLinha(linha: RowDataPacket): Livro {
        return new Livro(
            {
                titulo: linha.titulo,
                descricao: linha.descricao,
                preco: Number(linha.preco),
                isbn: linha.isbn,
                estoque: linha.estoque,
                capaUrl: linha.capa_url,
                autor: { id: linha.autor_id, nome: linha.autor_nome },
                categoria: { id: linha.categoria_id, nome: linha.categoria_nome },
            },
            linha.id,
            linha.criado_em
        );
    }
}
