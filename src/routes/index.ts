import { Router } from "express";
import { CrudController } from "../controllers/CrudController";
import { AutorRepository } from "../repositories/AutorRepository";
import { CategoriaRepository } from "../repositories/CategoriaRepository";
import { LivroRepository } from "../repositories/LivroRepository";
import { AutorService } from "../services/AutorService";
import { CategoriaService } from "../services/CategoriaService";
import { LivroService } from "../services/LivroService";
import { rotasCrud } from "./crudRoutes";
import { usuarioRoutes } from "./usuarioRoutes";

const categoriaRepository = new CategoriaRepository();
const autorRepository = new AutorRepository();
const livroRepository = new LivroRepository();

export const rotas = Router();

rotas.use(usuarioRoutes);
rotas.use("/categorias", rotasCrud(new CrudController(new CategoriaService(categoriaRepository))));
rotas.use("/autores", rotasCrud(new CrudController(new AutorService(autorRepository))));
rotas.use("/livros", rotasCrud(new CrudController(new LivroService(livroRepository, autorRepository, categoriaRepository))));
