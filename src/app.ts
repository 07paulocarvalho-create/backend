import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { AppError } from "./errors/AppError";
import { usuarioRoutes } from "./routes/usuarioRoutes";

const app = express();
const PORTA = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({ mensagem: "API de cadastro de usuários" });
});

app.use(usuarioRoutes);

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

    console.error(erro);
    res.status(500).json({ mensagem: "Erro interno no servidor" });
});

app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});
