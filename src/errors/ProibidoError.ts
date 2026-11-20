import { AppError } from "./AppError";

export class ProibidoError extends AppError {
    readonly status = 403;
}
