import { AppError } from "./AppError";

export class ConflitoError extends AppError {
    readonly status = 409;
}
