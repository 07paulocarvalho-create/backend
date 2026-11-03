import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { UsuarioService } from "../services/UsuarioService";

const repositorio = new UsuarioRepository();
const service = new UsuarioService(repositorio);
const controller = new UsuarioController(service);

export const usuarioRoutes = Router();

usuarioRoutes.post("/usuarios", controller.cadastrar);
usuarioRoutes.get("/usuarios", controller.listar);
usuarioRoutes.post("/login", controller.login);
