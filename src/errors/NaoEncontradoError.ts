import { AppError } from "./AppError";

export class NaoEncontradoError extends AppError {
    readonly status = 404;
}
