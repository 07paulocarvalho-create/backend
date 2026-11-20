import { AppError } from "./AppError";

export class NaoAutorizadoError extends AppError {
    readonly status = 401;
}
