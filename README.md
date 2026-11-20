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

| Método | Rota        | Acesso  | Descrição                              |
|--------|-------------|---------|----------------------------------------|
| POST   | `/usuarios` | público | Cadastra um cliente                    |
| POST   | `/login`    | público | Autentica e devolve o token JWT        |
| GET    | `/usuarios` | admin   | Lista os usuários                      |
| GET    | `/usuarios/me` | logado | Dados do usuário logado             |
| PUT    | `/usuarios/:id` | logado | Edita o próprio usuário (nome, CPF e senha) |

Na edição, nome, CPF e senha são obrigatórios. Editar outro usuário retorna `403` e tentar trocar o email retorna `400`.

Rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

### CRUDs

Todas as rotas exigem login. Consultar é liberado para qualquer usuário logado; criar, editar e excluir é só para admin.

| Método | Rota                 | Acesso | Descrição |
|--------|----------------------|--------|-----------|
| GET    | `/categorias`        | logado | Lista paginada (`?pagina=1&limite=10`, máximo 50) |
| GET    | `/categorias/:id`    | logado | Detalhe |
| POST   | `/categorias`        | admin  | Cria (`nome` obrigatório, `descricao` opcional) |
| PUT    | `/categorias/:id`    | admin  | Edita |
| DELETE | `/categorias/:id`    | admin  | Exclui (bloqueado se houver livros na categoria) |
| GET    | `/autores`           | logado | Lista paginada |
| GET    | `/autores/:id`       | logado | Detalhe |
| POST   | `/autores`           | admin  | Cria (`nome` obrigatório, `biografia` opcional) |
| PUT    | `/autores/:id`       | admin  | Edita |
| DELETE | `/autores/:id`       | admin  | Exclui (bloqueado se houver livros do autor) |
| GET    | `/livros`            | logado | Lista paginada, com filtros `?categoriaId=` e `?autorId=` |
| GET    | `/livros/:id`        | logado | Detalhe com nome do autor e da categoria |
| POST   | `/livros`            | admin  | Cria |
| PUT    | `/livros/:id`        | admin  | Edita |
| DELETE | `/livros/:id`        | admin  | Exclui (bloqueado se o livro estiver em pedidos) |

Livro: `titulo`, `isbn`, `preco`, `estoque`, `autorId` e `categoriaId` são obrigatórios; `descricao` e `capaUrl` são opcionais. O preço não pode ser negativo, o estoque é inteiro e não negativo, e o ISBN (10 ou 13 dígitos) é validado pelos dígitos verificadores e não pode se repetir.

As listagens retornam:

```json
{ "itens": [], "pagina": 1, "limite": 10, "total": 0, "totalPaginas": 0 }
```

### Administrador

O primeiro administrador é criado ao iniciar a API, com os dados de `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_SENHA` e `ADMIN_CPF` do `.env`. A senha passa pela mesma validação de nível do cadastro e é salva com hash. O cadastro público sempre cria usuários com perfil `cliente`.

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
- `401` login incorreto, token ausente ou expirado
- `403` usuário sem permissão
- `409` email ou CPF já cadastrado

## Estrutura

```
src/
  app.ts
  controllers/   CrudController genérico e UsuarioController
  database/      conexão, criação das tabelas e do administrador
  errors/        AppError (abstrata) e erros específicos (400, 401, 403, 404, 409)
  middlewares/   autenticação (JWT) e perfil
  models/        Entidade (abstrata), Usuario, Categoria, Autor, Livro, Cpf, Email, Senha
  repositories/  interface Repositorio<T>, RepositorioMySQL<T> (abstrata) e repositórios concretos
  routes/
  services/      CrudService<T> (abstrata) e services concretos
  types/         paginação
  utils/         token e leitura da entrada
```

### Como os CRUDs são organizados

- `Entidade` guarda `id` e `criadoEm`; cada entidade herda dela e define o próprio `toJSON()`.
- `Repositorio<T>` é o contrato que os services usam. `RepositorioMySQL<T>` implementa o SQL comum (inserir, atualizar, buscar, listar paginado e excluir), e cada repositório informa só a tabela e como converter linhas.
- `CrudService<T>` concentra buscar, listar e excluir com resposta 404 para registros inexistentes; cada service implementa `criar` e `atualizar`.
- `CrudController<T>` e `rotasCrud()` são os mesmos para todos os recursos.
```
