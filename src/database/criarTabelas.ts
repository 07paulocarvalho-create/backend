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
    `CREATE TABLE IF NOT EXISTS pedidos (
        id CHAR(36) PRIMARY KEY,
        usuario_id CHAR(36) NOT NULL,
        status ENUM('pendente', 'pago', 'enviado', 'entregue', 'cancelado') NOT NULL DEFAULT 'pendente',
        total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
        criado_em DATETIME(3) NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`,
    `CREATE TABLE IF NOT EXISTS pedido_itens (
        pedido_id CHAR(36) NOT NULL,
        livro_id CHAR(36) NOT NULL,
        quantidade INT UNSIGNED NOT NULL CHECK (quantidade > 0),
        preco_unitario DECIMAL(10, 2) NOT NULL,
        PRIMARY KEY (pedido_id, livro_id),
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        FOREIGN KEY (livro_id) REFERENCES livros(id)
    )`,
];

export async function criarTabelas(): Promise<void> {
    for (const sql of TABELAS) {
        await conexao.query(sql);
    }
}
