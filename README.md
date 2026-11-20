# Livraria Entre Páginas - Backend

API em Node.js + Express + TypeScript.

## Proposta

A **Livraria Entre Páginas** é uma livraria virtual pensada para uma pequena empreendedora (persona fictícia) que vende livros e precisa sair das planilhas. O sistema permite:

- que clientes se cadastrem, façam login e consultem o catálogo de livros;
- que clientes façam pedidos com um ou mais livros;
- que a dona da livraria (administradora) gerencie livros, autores, categorias, pedidos e estoque.

O acompanhamento dos critérios de avaliação está em [RUBRICA_CHECKLIST.md](RUBRICA_CHECKLIST.md).

## Como rodar

Pré-requisitos: Docker Desktop. Os repositórios `backend` e `frontend` precisam estar lado a lado na mesma pasta.

1. Copie `.env.example` para `.env` e preencha as senhas do banco, o `JWT_SECRET` e os dados do administrador (`ADMIN_*`).
2. Dentro de `backend`, suba tudo:

```bash
docker compose up -d --build
```

Acesse `http://localhost:8080`. A porta pode ser trocada com `NGINX_PORTA` no `.env`.

### Serviços do Docker

| Serviço | Função | Exposto fora do Docker? |
|---|---|---|
| `nginx` | Proxy reverso: `/api/*` vai para o backend e o resto para o frontend | Sim, porta 8080 |
| `frontend` | React compilado servido por um Nginx interno | Não |
| `backend` | Esta API | Não |
| `mysql` | Banco de dados, com os dados no volume `mysql_dados` | Não |

MySQL, backend e frontend ficam na rede `rede_interna` (marcada como `internal`, sem acesso externo). Só o Nginx está também na `rede_publica` e tem porta publicada. Os dados continuam no volume mesmo com `docker compose down`; apenas `docker compose down -v` apaga o banco.

### Desenvolvimento sem Docker para a API

Pré-requisito: Node.js 22+.

```bash
npm install
npm run db
npm run dev
```

O `npm run db` sobe só o MySQL usando o `docker-compose.dev.yml`, que libera a porta 3306 apenas em `127.0.0.1`. A API sobe em `http://localhost:3000` e cria as tabelas automaticamente.

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

| GET    | `/pedidos`           | logado | Lista paginada; cliente vê só os próprios, admin vê todos (filtro `?status=`) |
| GET    | `/pedidos/:id`       | logado | Detalhe com itens; cliente só acessa os próprios |
| POST   | `/pedidos`           | logado | Cria um pedido para o usuário logado |
| PUT    | `/pedidos/:id`       | admin  | Altera o status |
| DELETE | `/pedidos/:id`       | admin  | Exclui e devolve o estoque, se o pedido não estava cancelado |

Livro: `titulo`, `isbn`, `preco`, `estoque`, `autorId` e `categoriaId` são obrigatórios; `descricao` e `capaUrl` são opcionais. O preço não pode ser negativo, o estoque é inteiro e não negativo, e o ISBN (10 ou 13 dígitos) é validado pelos dígitos verificadores e não pode se repetir.

Pedido: recebe `{ "itens": [{ "livroId": "...", "quantidade": 2 }] }`.

- Cada item guarda o preço do livro no momento da compra; o total é calculado a partir dos itens.
- Quantidade acima do estoque retorna `409`. A baixa do estoque acontece em uma transação que só desconta se ainda houver unidades, então dois pedidos simultâneos não vendem o mesmo exemplar.
- Status: `pendente`, `pago`, `enviado`, `entregue` e `cancelado`. Cancelar devolve os livros ao estoque; pedidos cancelados ou entregues não mudam mais de status.

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
  models/        Entidade (abstrata), Usuario, Categoria, Autor, Livro, Pedido, ItemPedido, Cpf, Email, Senha
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
- `PedidoRepository` herda o que é comum e sobrescreve só o que precisa de transação (salvar, cancelar e excluir).

## Agentes de IA

- [AGENTS.md](AGENTS.md): contexto do projeto, comandos, convenções e regras para agentes.
- [.agents/skills/](.agents/skills/): três skills (`criar-crud`, `testar-api` e `atualizar-checklist`).
- [.claude/settings.json](.claude/settings.json): guardrails. Bloqueia a leitura do `.env`, `git commit`, `git push`, `docker compose down -v` e `rm -rf`, e registra o hook [protegerEnv.ts](.claude/hooks/protegerEnv.ts), que barra qualquer ferramenta que tente acessar um arquivo `.env`.
