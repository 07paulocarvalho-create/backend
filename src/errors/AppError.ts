export type ErrosPorCampo = Record<string, string>;

export class AppError extends Error {
    readonly status: number;
    readonly erros?: ErrosPorCampo;

    constructor(mensagem: string, status = 400, erros?: ErrosPorCampo) {
        super(mensagem);
        this.name = "AppError";
        this.status = status;
        this.erros = erros;
    }
}
