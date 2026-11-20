export type ItemPedidoJSON = {
    livroId: string;
    titulo: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
};

export class ItemPedido {
    readonly #livroId: string;
    readonly #titulo: string;
    readonly #quantidade: number;
    readonly #precoUnitario: number;

    constructor(livroId: string, titulo: string, quantidade: number, precoUnitario: number) {
        this.#livroId = livroId;
        this.#titulo = titulo;
        this.#quantidade = quantidade;
        this.#precoUnitario = precoUnitario;
    }

    get livroId(): string {
        return this.#livroId;
    }

    get quantidade(): number {
        return this.#quantidade;
    }

    // Acesso controlado: valor calculado, não armazenado
    get subtotal(): number {
        return Math.round(this.#precoUnitario * this.#quantidade * 100) / 100;
    }

    toJSON(): ItemPedidoJSON {
        return {
            livroId: this.#livroId,
            titulo: this.#titulo,
            quantidade: this.#quantidade,
            precoUnitario: this.#precoUnitario,
            subtotal: this.subtotal,
        };
    }
}
