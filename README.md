# Livraria Entre Páginas - Backend

API em Node.js + Express + TypeScript.

## Proposta

A **Livraria Entre Páginas** é uma livraria virtual pensada para uma pequena empreendedora (persona fictícia) que vende livros e precisa sair das planilhas. O sistema permite:

- que clientes se cadastrem, façam login e consultem o catálogo de livros;
- que clientes façam pedidos com um ou mais livros;
- que a dona da livraria (administradora) gerencie livros, autores, categorias, pedidos e estoque.

O acompanhamento dos critérios de avaliação está em [RUBRICA_CHECKLIST.md](RUBRICA_CHECKLIST.md).

## Como rodar

Pré-requisitos: Node.js 22+ e Docker Desktop.

1. Copie `.env.example` para `.env` e defina as senhas do banco.
2. Suba o MySQL e a API:

```bash
npm install
npm run db
npm run dev
```

O servidor sobe em `http://localhost:3000` e cria as tabelas automaticamente.

O `npm run db` usa o `docker-compose.dev.yml`, que libera a porta do MySQL apenas em `127.0.0.1` para o desenvolvimento local.

## Rotas

| Método | Rota        | Descrição                  |
|--------|-------------|----------------------------|
| POST   | `/usuarios` | Cadastra um usuário        |
| GET    | `/usuarios` | Lista os usuários          |
| POST   | `/login`    | Autentica com email/senha  |

### Exemplo de cadastro

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "Senha@123",
  "cpf": "529.982.247-25"
}
```

### Regras

- Nome, email, senha e CPF são obrigatórios
- CPF validado pelos dígitos verificadores
- Senha precisa ser forte: 8+ caracteres, maiúscula, minúscula, número e caractere especial
- Email com formato válido e único
- A senha é salva com hash (scrypt) e nunca é retornada

### Erros

```json
{
  "mensagem": "Dados inválidos",
  "erros": { "cpf": "CPF inválido" }
}
```

- `400` dados inválidos
- `401` login incorreto
- `409` email ou CPF já cadastrado

## Estrutura

```
src/
  app.ts
  controllers/
  database/      conexão e criação das tabelas
  errors/
  models/        Usuario, Cpf, Email, Senha
  repositories/
  routes/
  services/
```
