import { Request, Response } from "express";
import { UsuarioService } from "../services/UsuarioService";

export class UsuarioController {
    constructor(private readonly service: UsuarioService) {}

    cadastrar = (req: Request, res: Response) => {
        const usuario = this.service.cadastrar(req.body ?? {});
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso", usuario });
    };

    login = (req: Request, res: Response) => {
        const usuario = this.service.autenticar(req.body ?? {});
        res.json({ mensagem: "Login realizado com sucesso", usuario });
    };

    listar = (_req: Request, res: Response) => {
        res.json(this.service.listar());
    };
}
