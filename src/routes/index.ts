import { Router } from "express";
import { CrudController } from "../controllers/CrudController";
import { CategoriaRepository } from "../repositories/CategoriaRepository";
import { CategoriaService } from "../services/CategoriaService";
import { rotasCrud } from "./crudRoutes";
import { usuarioRoutes } from "./usuarioRoutes";

const categoriaRepository = new CategoriaRepository();

export const rotas = Router();

rotas.use(usuarioRoutes);
rotas.use("/categorias", rotasCrud(new CrudController(new CategoriaService(categoriaRepository))));
