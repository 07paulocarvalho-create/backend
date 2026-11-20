import { NextFunction, Request, Response } from "express";
import { NaoAutorizadoError } from "../errors/NaoAutorizadoError";
import { ProibidoError } from "../errors/ProibidoError";
import { Perfil } from "../models/Usuario";
import { verificarToken } from "../utils/token";

export function autenticar(req: Request, _res: Response, next: NextFunction) {
    const [tipo, token] = (req.headers.authorization ?? "").split(" ");

    if (tipo !== "Bearer" || !token) {
        throw new NaoAutorizadoError("Faça login para continuar");
    }

    try {
        req.usuario = verificarToken(token);
    } catch {
        throw new NaoAutorizadoError("Sessão inválida ou expirada. Faça login novamente");
    }

    next();
}

export function exigirPerfil(perfil: Perfil) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (req.usuario?.perfil !== perfil) {
            throw new ProibidoError("Você não tem permissão para esta ação");
        }
        next();
    };
}
