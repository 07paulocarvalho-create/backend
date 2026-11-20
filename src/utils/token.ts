import jwt, { SignOptions } from "jsonwebtoken";
import { Perfil } from "../models/Usuario";

export type UsuarioAutenticado = {
    id: string;
    perfil: Perfil;
};

function segredo(): string {
    const valor = process.env.JWT_SECRET;
    if (!valor) {
        throw new Error("JWT_SECRET não foi definido no .env");
    }
    return valor;
}

// Retorno JWT
export function gerarToken({ id, perfil }: UsuarioAutenticado): string {
    const expiresIn = (process.env.JWT_EXPIRA_EM ?? "8h") as SignOptions["expiresIn"];
    return jwt.sign({ perfil }, segredo(), { subject: id, expiresIn });
}

export function verificarToken(token: string): UsuarioAutenticado {
    const payload = jwt.verify(token, segredo()) as jwt.JwtPayload;
    return { id: String(payload.sub), perfil: payload.perfil as Perfil };
}
