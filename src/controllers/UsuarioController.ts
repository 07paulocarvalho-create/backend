import { Request, Response } from "express";
import { UsuarioService } from "../services/UsuarioService";

export class UsuarioController {
    constructor(private readonly service: UsuarioService) {}

    cadastrar = async (req: Request, res: Response) => {
        const usuario = await this.service.cadastrar(req.body ?? {});
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso", usuario });
    };

    login = async (req: Request, res: Response) => {
        const { token, usuario } = await this.service.autenticar(req.body ?? {});
        res.json({ mensagem: "Login realizado com sucesso", token, usuario });
    };

    listar = async (_req: Request, res: Response) => {
        res.json(await this.service.listar());
    };
}
