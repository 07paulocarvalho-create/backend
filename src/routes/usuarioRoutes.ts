import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";
import { autenticar, exigirPerfil } from "../middlewares/autenticacao";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { UsuarioService } from "../services/UsuarioService";

const repositorio = new UsuarioRepository();
const service = new UsuarioService(repositorio);
const controller = new UsuarioController(service);

export const usuarioRoutes = Router();

usuarioRoutes.post("/usuarios", controller.cadastrar);
usuarioRoutes.post("/login", controller.login);
usuarioRoutes.get("/usuarios", autenticar, exigirPerfil("admin"), controller.listar);
usuarioRoutes.get("/usuarios/me", autenticar, controller.buscarLogado);
// Edição de Usuário: rota autenticada
usuarioRoutes.put("/usuarios/:id", autenticar, controller.atualizar);
