import { RowDataPacket } from "mysql2";
import { Autor } from "../models/Autor";
import { Linha, RepositorioMySQL } from "./RepositorioMySQL";

export class AutorRepository extends RepositorioMySQL<Autor> {
    protected readonly tabela = "autores";
    protected readonly ordenacao = "nome";
    protected readonly mensagemVinculo = "Não é possível excluir: existem livros deste autor";

    protected paraLinha(autor: Autor): Linha {
        const { id, nome, biografia } = autor.toJSON();
        return { id, nome, biografia, criado_em: autor.criadoEm };
    }

    protected deLinha(linha: RowDataPacket): Autor {
        return new Autor({ nome: linha.nome, biografia: linha.biografia }, linha.id, linha.criado_em);
    }
}
