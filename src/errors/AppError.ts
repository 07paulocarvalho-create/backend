export type ErrosPorCampo = Record<string, string>;

// Tratamento de exceções: classe base abstrata, cada erro concreto define o seu status HTTP
export abstract class AppError extends Error {
    abstract readonly status: number;
    readonly erros?: ErrosPorCampo;

    constructor(mensagem: string, erros?: ErrosPorCampo) {
        super(mensagem);
        this.name = new.target.name;
        this.erros = erros;
    }
}
