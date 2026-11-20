import { conexao } from "./conexao";

const TABELAS = [
    `CREATE TABLE IF NOT EXISTS usuarios (
        id CHAR(36) PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(254) NOT NULL UNIQUE,
        cpf CHAR(14) NOT NULL UNIQUE,
        senha VARCHAR(161) NOT NULL,
        perfil ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
        criado_em DATETIME(3) NOT NULL
    )`,
];

export async function criarTabelas(): Promise<void> {
    for (const sql of TABELAS) {
        await conexao.query(sql);
    }
}
