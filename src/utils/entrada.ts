export type Entrada = Record<string, unknown>;

export function texto(valor: unknown): string {
    return typeof valor === "string" ? valor : "";
}

export function erroTexto(valor: string, maximo: number, obrigatorio = true): string | null {
    if (!valor) {
        return obrigatorio ? "Campo obrigatório" : null;
    }
    if (valor.length > maximo) {
        return `Máximo de ${maximo} caracteres`;
    }
    return null;
}

export function numero(valor: unknown): number {
    if (typeof valor === "number") {
        return valor;
    }
    if (typeof valor === "string" && valor.trim() !== "") {
        return Number(valor.replace(",", "."));
    }
    return NaN;
}
