import { Router } from "express";
import { CrudController } from "../controllers/CrudController";
import { autenticar, exigirPerfil } from "../middlewares/autenticacao";
import { Entidade } from "../models/Entidade";

export function rotasCrud<T extends Entidade>(controller: CrudController<T>, apenasAdminCria = true): Router {
    const rotas = Router();
    const admin = exigirPerfil("admin");

    // CRUDs com todas as rotas autenticadas
    rotas.use(autenticar);

    rotas.get("/", controller.listar);
    rotas.get("/:id", controller.buscar);
    rotas.post("/", ...(apenasAdminCria ? [admin] : []), controller.criar);
    rotas.put("/:id", admin, controller.atualizar);
    rotas.delete("/:id", admin, controller.excluir);

    return rotas;
}
