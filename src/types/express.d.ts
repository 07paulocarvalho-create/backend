import { UsuarioAutenticado } from "../utils/token";

declare global {
    namespace Express {
        interface Request {
            usuario?: UsuarioAutenticado;
        }
    }
}
