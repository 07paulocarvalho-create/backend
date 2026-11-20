import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { criarAdmin } from "./database/criarAdmin";
import { criarTabelas } from "./database/criarTabelas";
import { AppError } from "./errors/AppError";
import { UsuarioRepository } from "./repositories/UsuarioRepository";
import { rotas } from "./routes";

const app = express();
const PORTA = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({ mensagem: "API da Livraria Entre Páginas" });
});

app.use(rotas);

app.use((_req, res) => {
    res.status(404).json({ mensagem: "Rota não encontrada" });
});

app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (erro instanceof AppError) {
        res.status(erro.status).json({ mensagem: erro.message, erros: erro.erros });
        return;
    }

    if (erro instanceof SyntaxError) {
        res.status(400).json({ mensagem: "JSON inválido no corpo da requisição" });
        return;
    }

    if ((erro as { code?: string }).code === "ER_DUP_ENTRY") {
        res.status(409).json({ mensagem: "Registro já cadastrado" });
        return;
    }

    console.error(erro);
    res.status(500).json({ mensagem: "Erro interno no servidor" });
});

async function iniciar() {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET não foi definido no .env");
    }

    await criarTabelas();
    await criarAdmin(new UsuarioRepository());

    app.listen(PORTA, () => {
        console.log(`Servidor rodando na porta ${PORTA}`);
    });
}

iniciar().catch((erro) => {
    console.error("Não foi possível iniciar o servidor:", erro.message);
    process.exit(1);
});
