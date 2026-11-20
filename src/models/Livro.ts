import { ConflitoError } from "../errors/ConflitoError";
import { ValidacaoError } from "../errors/ValidacaoError";
import { Entrada, erroTexto, numero, texto } from "../utils/entrada";
import { Entidade } from "./Entidade";

export type Referencia = {
    id: string;
    nome: string;
};

export type LivroDados = {
    titulo: string;
    descricao: string | null;
    preco: number;
    isbn: string;
    estoque: number;
    capaUrl: string | null;
    autor: Referencia;
    categoria: Referencia;
};

export type LivroValidado = Omit<LivroDados, "autor" | "categoria"> & {
    autorId: string;
    categoriaId: string;
};

export type LivroJSON = LivroDados & {
    id: string;
    criadoEm: string;
};

const PRECO_MAXIMO = 99999.99;

export class Livro extends Entidade {
    #titulo: string;
    #descricao: string | null;
    #preco: number;
    #isbn: string;
    #estoque: number;
    #capaUrl: string | null;
    #autor: Referencia;
    #categoria: Referencia;

    constructor(dados: LivroDados, id?: string, criadoEm?: Date) {
        super(id, criadoEm);
        this.#titulo = dados.titulo;
        this.#descricao = dados.descricao;
        this.#preco = dados.preco;
        this.#isbn = dados.isbn;
        this.#estoque = dados.estoque;
        this.#capaUrl = dados.capaUrl;
        this.#autor = dados.autor;
        this.#categoria = dados.categoria;
    }

    static validar(entrada: Entrada): LivroValidado {
        const titulo = texto(entrada.titulo).trim();
        const descricao = texto(entrada.descricao).trim();
        const capaUrl = texto(entrada.capaUrl).trim();
        const isbn = texto(entrada.isbn).replace(/[\s-]/g, "").toUpperCase();
        const autorId = texto(entrada.autorId).trim();
        const categoriaId = texto(entrada.categoriaId).trim();
        const preco = numero(entrada.preco);
        const estoque = numero(entrada.estoque);

        ValidacaoError.verificar({
            titulo: erroTexto(titulo, 150),
            descricao: erroTexto(descricao, 2000, false),
            capaUrl: capaUrl && !/^https?:\/\/\S+$/.test(capaUrl) ? "Informe uma URL começando com http:// ou https://" : erroTexto(capaUrl, 500, false),
            isbn: Livro.validarIsbn(isbn),
            preco: Livro.validarPreco(preco),
            estoque: Livro.validarEstoque(estoque),
            autorId: autorId ? null : "Campo obrigatório",
            categoriaId: categoriaId ? null : "Campo obrigatório",
        });

        return {
            titulo,
            descricao: descricao || null,
            preco: Math.round(preco * 100) / 100,
            isbn,
            estoque,
            capaUrl: capaUrl || null,
            autorId,
            categoriaId,
        };
    }

    // Regra de negócio: não permitir preço negativo
    private static validarPreco(preco: number): string | null {
        if (Number.isNaN(preco)) {
            return "Informe o preço";
        }
        if (preco < 0) {
            return "O preço não pode ser negativo";
        }
        if (preco > PRECO_MAXIMO) {
            return "Preço acima do permitido";
        }
        return null;
    }

    // Regra de negócio: não permitir estoque negativo
    private static validarEstoque(estoque: number): string | null {
        if (Number.isNaN(estoque)) {
            return "Informe o estoque";
        }
        if (!Number.isInteger(estoque) || estoque < 0) {
            return "O estoque deve ser um número inteiro maior ou igual a zero";
        }
        return null;
    }

    // Validação de ISBN-10 e ISBN-13 pelos dígitos verificadores
    private static validarIsbn(isbn: string): string | null {
        if (!isbn) {
            return "Campo obrigatório";
        }

        if (/^\d{9}[\dX]$/.test(isbn)) {
            const soma = [...isbn].reduce((total, digito, i) => total + (digito === "X" ? 10 : Number(digito)) * (10 - i), 0);
            return soma % 11 === 0 ? null : "ISBN inválido";
        }

        if (/^\d{13}$/.test(isbn)) {
            const soma = [...isbn].reduce((total, digito, i) => total + Number(digito) * (i % 2 === 0 ? 1 : 3), 0);
            return soma % 10 === 0 ? null : "ISBN inválido";
        }

        return "O ISBN deve ter 10 ou 13 dígitos";
    }

    get titulo(): string {
        return this.#titulo;
    }

    // Acesso controlado: o preço é lido pelo pedido para registrar o valor no momento da compra
    get preco(): number {
        return this.#preco;
    }

    atualizar(dados: LivroDados): void {
        this.#titulo = dados.titulo;
        this.#descricao = dados.descricao;
        this.#preco = dados.preco;
        this.#isbn = dados.isbn;
        this.#estoque = dados.estoque;
        this.#capaUrl = dados.capaUrl;
        this.#autor = dados.autor;
        this.#categoria = dados.categoria;
    }

    // Regra de negócio: não permitir pedido com quantidade maior que o estoque
    retirarEstoque(quantidade: number): void {
        if (quantidade > this.#estoque) {
            throw new ConflitoError(`Estoque insuficiente para "${this.#titulo}". Disponível: ${this.#estoque}`);
        }
        this.#estoque -= quantidade;
    }

    devolverEstoque(quantidade: number): void {
        this.#estoque += quantidade;
    }

    toJSON(): LivroJSON {
        return {
            id: this.id,
            titulo: this.#titulo,
            descricao: this.#descricao,
            preco: this.#preco,
            isbn: this.#isbn,
            estoque: this.#estoque,
            capaUrl: this.#capaUrl,
            autor: { ...this.#autor },
            categoria: { ...this.#categoria },
            criadoEm: this.criadoEm.toISOString(),
        };
    }
}
