# Backend - Cadastro de Usuário

API em Node.js + Express + TypeScript.

## Como rodar

```bash
npm install
npm run dev
```

O servidor sobe em `http://localhost:3000`.

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
  errors/
  models/        Usuario, Cpf, Email, Senha
  repositories/
  routes/
  services/
```
