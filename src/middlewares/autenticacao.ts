import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { Perfil } from "../models/Usuario";
import { verificarToken } from "../utils/token";

export function autenticar(req: Request, _res: Response, next: NextFunction) {
    const [tipo, token] = (req.headers.authorization ?? "").split(" ");

    if (tipo !== "Bearer" || !token) {
        throw new AppError("Faça login para continuar", 401);
    }

    try {
        req.usuario = verificarToken(token);
    } catch {
        throw new AppError("Sessão inválida ou expirada. Faça login novamente", 401);
    }

    next();
}

export function exigirPerfil(perfil: Perfil) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (req.usuario?.perfil !== perfil) {
            throw new AppError("Você não tem permissão para esta ação", 403);
        }
        next();
    };
}
