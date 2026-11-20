import { Request, Response } from "express";
import { Entidade } from "../models/Entidade";
import { ServicoCrud } from "../services/CrudService";
import { lerPaginacao } from "../types/paginacao";

type RequisicaoComId = Request<{ id: string }>;

// Controller genérico: o mesmo código atende categorias, autores, livros e pedidos
export class CrudController<T extends Entidade> {
    constructor(private readonly service: ServicoCrud<T>) {}

    listar = async (req: Request, res: Response) => {
        res.json(await this.service.listar(lerPaginacao(req.query), req.query, req.usuario!));
    };

    buscar = async (req: RequisicaoComId, res: Response) => {
        res.json(await this.service.buscar(req.params.id, req.usuario!));
    };

    criar = async (req: Request, res: Response) => {
        res.status(201).json(await this.service.criar(req.body ?? {}, req.usuario!));
    };

    atualizar = async (req: RequisicaoComId, res: Response) => {
        res.json(await this.service.atualizar(req.params.id, req.body ?? {}, req.usuario!));
    };

    excluir = async (req: RequisicaoComId, res: Response) => {
        await this.service.excluir(req.params.id, req.usuario!);
        res.status(204).send();
    };
}
