import { randomUUID } from "crypto";

// Modelagem do domínio: classe abstrata com o que toda entidade tem em comum
export abstract class Entidade {
    readonly #id: string;
    readonly #criadoEm: Date;

    protected constructor(id: string = randomUUID(), criadoEm: Date = new Date()) {
        this.#id = id;
        this.#criadoEm = criadoEm;
    }

    get id(): string {
        return this.#id;
    }

    // Devolve uma cópia para que a data original não seja alterada por fora
    get criadoEm(): Date {
        return new Date(this.#criadoEm);
    }

    // Polimorfismo: cada entidade define como é apresentada na API
    abstract toJSON(): object;
}
