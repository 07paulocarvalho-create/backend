import { ConflitoError } from "../errors/ConflitoError";
import { Entidade } from "./Entidade";
import { ItemPedido, ItemPedidoJSON } from "./ItemPedido";
import { Referencia } from "./Livro";

export const STATUS_PEDIDO = ["pendente", "pago", "enviado", "entregue", "cancelado"] as const;

export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export type PedidoDados = {
    cliente: Referencia;
    itens: ItemPedido[];
    status: StatusPedido;
};

export type PedidoJSON = {
    id: string;
    cliente: Referencia;
    itens: ItemPedidoJSON[];
    status: StatusPedido;
    total: number;
    criadoEm: string;
};

export class Pedido extends Entidade {
    readonly #cliente: Referencia;
    readonly #itens: ItemPedido[];
    #status: StatusPedido;

    constructor(dados: PedidoDados, id?: string, criadoEm?: Date) {
        super(id, criadoEm);
        this.#cliente = dados.cliente;
        this.#itens = [...dados.itens];
        this.#status = dados.status;
    }

    // Acesso controlado: cópia da lista para que os itens não sejam alterados por fora
    get itens(): ItemPedido[] {
        return [...this.#itens];
    }

    get status(): StatusPedido {
        return this.#status;
    }

    // Regra de negócio: o total é sempre calculado a partir dos itens
    get total(): number {
        const soma = this.#itens.reduce((total, item) => total + item.subtotal, 0);
        return Math.round(soma * 100) / 100;
    }

    pertenceA(usuarioId: string): boolean {
        return this.#cliente.id === usuarioId;
    }

    alterarStatus(novo: StatusPedido): void {
        if (this.#status === "cancelado" || this.#status === "entregue") {
            throw new ConflitoError(`Pedido ${this.#status} não pode mais ser alterado`);
        }
        this.#status = novo;
    }

    toJSON(): PedidoJSON {
        return {
            id: this.id,
            cliente: { ...this.#cliente },
            itens: this.#itens.map((item) => item.toJSON()),
            status: this.#status,
            total: this.total,
            criadoEm: this.criadoEm.toISOString(),
        };
    }
}
