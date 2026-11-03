import { AppError } from "../errors/AppError";

export class Cpf {
    // Encapsulamento: valor guardado em campo privado nativo, sem setter
    readonly #numero: string;

    private constructor(numero: string) {
        this.#numero = numero;
    }

    static criar(valor: string): Cpf {
        const erro = Cpf.validar(valor);
        if (erro) {
            throw new AppError(erro, 400, { cpf: erro });
        }
        return new Cpf(Cpf.somenteNumeros(valor));
    }

    // Validação de CPF
    static validar(valor: string): string | null {
        if (!valor || !valor.trim()) {
            return "O CPF é obrigatório";
        }

        const numero = Cpf.somenteNumeros(valor);

        if (numero.length !== 11) {
            return "O CPF deve ter 11 dígitos";
        }

        if (/^(\d)\1{10}$/.test(numero)) {
            return "CPF inválido";
        }

        const primeiroDigito = Cpf.calcularDigito(numero.slice(0, 9), 10);
        const segundoDigito = Cpf.calcularDigito(numero.slice(0, 10), 11);

        if (primeiroDigito !== Number(numero[9]) || segundoDigito !== Number(numero[10])) {
            return "CPF inválido";
        }

        return null;
    }

    private static calcularDigito(base: string, pesoInicial: number): number {
        let soma = 0;
        for (let i = 0; i < base.length; i++) {
            soma += Number(base[i]) * (pesoInicial - i);
        }
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    }

    private static somenteNumeros(valor: string): string {
        return valor.replace(/\D/g, "");
    }

    // Acesso controlado: getter com transformação (máscara 000.000.000-00)
    get formatado(): string {
        return this.#numero.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    igual(outro: Cpf): boolean {
        return this.#numero === outro.#numero;
    }
}
