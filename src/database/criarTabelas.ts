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
    `CREATE TABLE IF NOT EXISTS categorias (
        id CHAR(36) PRIMARY KEY,
        nome VARCHAR(60) NOT NULL UNIQUE,
        descricao VARCHAR(255) NULL,
        criado_em DATETIME(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS autores (
        id CHAR(36) PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        biografia TEXT NULL,
        criado_em DATETIME(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS livros (
        id CHAR(36) PRIMARY KEY,
        titulo VARCHAR(150) NOT NULL,
        descricao TEXT NULL,
        preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
        isbn VARCHAR(13) NOT NULL UNIQUE,
        estoque INT UNSIGNED NOT NULL,
        capa_url VARCHAR(500) NULL,
        autor_id CHAR(36) NOT NULL,
        categoria_id CHAR(36) NOT NULL,
        criado_em DATETIME(3) NOT NULL,
        FOREIGN KEY (autor_id) REFERENCES autores(id),
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )`,
];

export async function criarTabelas(): Promise<void> {
    for (const sql of TABELAS) {
        await conexao.query(sql);
    }
}
