import { AppError } from "../errors/AppError";

const FORMATO_EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;

export class Email {
    // Encapsulamento: endereço imutável após a criação
    readonly #endereco: string;

    private constructor(endereco: string) {
        this.#endereco = endereco;
    }

    static criar(valor: string): Email {
        const erro = Email.validar(valor);
        if (erro) {
            throw new AppError(erro, 400, { email: erro });
        }
        return new Email(Email.normalizar(valor));
    }

    // Validação de email
    static validar(valor: string): string | null {
        if (!valor || !valor.trim()) {
            return "O email é obrigatório";
        }

        const endereco = Email.normalizar(valor);

        if (endereco.length > 254 || !FORMATO_EMAIL.test(endereco) || endereco.includes("..")) {
            return "Email inválido";
        }

        return null;
    }

    private static normalizar(valor: string): string {
        return valor.trim().toLowerCase();
    }

    // Acesso controlado: somente leitura, já normalizado
    get endereco(): string {
        return this.#endereco;
    }

    igual(outro: Email): boolean {
        return this.#endereco === outro.#endereco;
    }
}
