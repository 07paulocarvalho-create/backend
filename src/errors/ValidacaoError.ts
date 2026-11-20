import { AppError, ErrosPorCampo } from "./AppError";

export class ValidacaoError extends AppError {
    readonly status = 400;

    constructor(erros: ErrosPorCampo, mensagem = "Dados inválidos") {
        super(mensagem, erros);
    }

    static verificar(regras: Record<string, string | null>): void {
        const erros: ErrosPorCampo = {};

        for (const [campo, erro] of Object.entries(regras)) {
            if (erro) {
                erros[campo] = erro;
            }
        }

        if (Object.keys(erros).length > 0) {
            throw new ValidacaoError(erros);
        }
    }
}
