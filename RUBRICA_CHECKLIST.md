# Checklist da Rubrica - Livraria Entre Páginas

Legenda: `[x]` concluído e testado · `[~]` parcial · `[ ]` não implementado · `[?]` depende de ação externa

Repositórios: `backend/` (API, Docker, Nginx, agentes) e `frontend/` (React).

## Back-end com IA Generativa

### Autenticação - [x]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Login com email e senha | [x] | `src/services/UsuarioService.ts` (`autenticar`), `POST /login` | Testado via requisições HTTP |
| Senha criptografada no banco | [x] | `src/models/Senha.ts`, `src/repositories/UsuarioRepository.ts` | Coluna `senha` guarda `salt:hash` (scrypt). Conferido direto no MySQL: o texto da senha não aparece |
| Validação de email (regex) | [x] | `src/models/Email.ts` | |
| Retorno JWT | [x] | `src/utils/token.ts`, `src/middlewares/autenticacao.ts` | Token com `sub` (id) e `perfil`, validade de 8h. Testado: sem token e token falso retornam 401; cliente em rota de admin retorna 403 |
| Logar apenas usuário existente | [x] | `src/services/UsuarioService.ts` | Usuário inexistente ou senha errada retorna 401; email fora do padrão retorna 400 |
| Perfis e primeiro administrador | [x] | `src/database/criarAdmin.ts` | Admin criado a partir do `.env` sem duplicar ao reiniciar; cadastro público não aceita `perfil: admin` |

### Cadastro de Usuário - [x]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Campos obrigatórios: nome, email, senha, CPF | [x] | `src/services/UsuarioService.ts` | Testado: corpo vazio retorna 400 com erro por campo |
| Validação de CPF | [x] | `src/models/Cpf.ts` | Dígitos verificadores e sequências repetidas |
| Validação de nível de senha | [x] | `src/models/Senha.ts` | Só aceita senha forte |
| Validação de email | [x] | `src/models/Email.ts` | Formato e unicidade (409) |
| Persistência no banco | [x] | `src/database/`, `src/repositories/UsuarioRepository.ts` | Testado: usuário cadastrado continua no banco e consegue logar após reiniciar a API |

### Edição de Usuário - [x]

Rotas: `PUT /usuarios/:id` e `GET /usuarios/me`. Lógica em `src/services/UsuarioService.ts` (`atualizar`).

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Rota autenticada | [x] | `src/routes/usuarioRoutes.ts` | Sem token retorna 401 |
| Só pode editar o próprio usuário | [x] | `UsuarioService.atualizar` | Id da rota diferente do id do token retorna 403 |
| Todos os campos obrigatórios | [x] | `UsuarioService.atualizar` | Nome, CPF e senha; corpo vazio retorna 400 com erro por campo |
| Validação de CPF | [x] | `src/models/Cpf.ts` | Inválido retorna 400; CPF de outro usuário retorna 409 |
| Validação de nível de senha | [x] | `src/models/Senha.ts` | Senha fraca retorna 400; testado login com a senha nova |
| Não permitir alterar o email | [x] | `UsuarioService.atualizar`, `src/models/Usuario.ts` | Email diferente retorna 400; no modelo o `#email` é `readonly` e não tem setter |

### CRUDs Completos - [ ]

CRUDs planejados: Categorias, Autores, Livros e Pedidos (com itens do pedido).

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| 4 CRUDs completos | [~] | `src/services/CategoriaService.ts`, `AutorService.ts`, `LivroService.ts` | 3 de 4: Categorias, Autores e Livros concluídos e testados; falta Pedidos |
| Todas as rotas autenticadas | [x] | `src/routes/crudRoutes.ts` | `autenticar` em todas as rotas; escrita só para admin. Testado: sem token 401, cliente escrevendo 403 |
| Paginação das listagens | [x] | `src/repositories/RepositorioMySQL.ts`, `src/types/paginacao.ts` | `?pagina` e `?limite` (máx. 50), com `total` e `totalPaginas`. Testado com 12 categorias |
| Não editar/deletar recursos inexistentes | [x] | `src/services/CrudService.ts` | PUT e DELETE de id inexistente retornam 404 |
| Ao menos 1 relacionamento | [x] | `src/database/criarTabelas.ts`, `src/repositories/LivroRepository.ts` | Livro → Autor e Livro → Categoria com chave estrangeira. Testado: autor/categoria inexistentes retornam 400, excluir categoria ou autor com livros retorna 409, listagem traz os nomes via JOIN e filtra por categoria. Pedido → Usuário e Item → Livro virão com Pedidos |

### Configuração de Agentes - [ ]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Arquivo AGENTS.md | [ ] | | |
| 3 skills específicas | [ ] | | Em `.agents/skills/` |
| Guardrails | [ ] | | `.claude/settings.json` dentro do backend |
| Proteção do `.env` | [ ] | | |

## Front-end

### Autenticação - [~]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Campos para email e senha | [x] | `src/pages/LoginPage.tsx` | |
| Validação de email (regex) | [ ] | | Hoje só verifica se está preenchido |
| Token no localStorage | [ ] | | |
| Erros da API de forma amigável | [x] | `src/api/erros.ts` | |
| Redirecionar para a área logada | [ ] | | |

### Cadastro de Usuário - [x]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Campos obrigatórios | [x] | `src/schemas/cadastroSchema.ts` | |
| Verificação dupla de senha | [x] | `src/schemas/cadastroSchema.ts` | |
| Validação de CPF | [x] | `src/utils/validacoes.ts` | Com máscara |
| Validação de email | [x] | `src/utils/validacoes.ts` | |
| Redirecionar para o login | [x] | `src/pages/CadastroPage.tsx` | |
| Mensagens de erro da API | [x] | `src/api/erros.ts` | Geral e por campo |

### Edição de Usuário - [ ]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Contexto com o usuário global | [ ] | | |
| Validação de CPF | [ ] | | |
| Validação de nível de senha | [ ] | | |
| Confirmação da senha | [ ] | | |
| Não permitir alterar o email | [ ] | | |

### CRUDs Completos - [ ]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| 4 CRUDs completos | [ ] | | |
| Paginação das listagens | [ ] | | |
| Validação dos campos obrigatórios | [ ] | | |
| Listagem e cadastro/edição em telas separadas | [ ] | | |

### Componentização - [~]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Componentes genéricos e reutilizáveis | [~] | `src/componentes/Campo.tsx` | Faltam tabela, paginação, layout |
| Telas compostas por vários componentes | [~] | | |
| Componentes e páginas em pastas separadas | [x] | `src/componentes/`, `src/pages/` | |
| Componentes exclusivos da página em funções separadas | [ ] | | |

## Ferramentas DevOps - [~]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Organização do docker-compose.yml | [~] | `docker-compose.yml` | Serviço `mysql` com volume, rede e variáveis; faltam backend, frontend e Nginx |
| Integração entre serviços | [ ] | | |
| Persistência no MySQL com volume | [~] | `docker-compose.yml` (volume `mysql_dados`) | Falta testar reiniciando os containers |
| Nginx como proxy reverso | [ ] | | |
| Isolamento por Docker Network | [ ] | | Só o Nginx exposto |

## Tech Forge

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Encapsulamento e proteção do estado | [x] | `src/models/*.ts` | Campos `#privados` e `readonly`, construtores só inicializam |
| Acesso controlado e propriedades | [x] | `src/models/Usuario.ts`, `src/models/Cpf.ts` | `set nome` valida; `cpf.formatado` transforma; senha sem getter |
| Modelagem do domínio e pilares da POO | [~] | `src/models/Entidade.ts`, `src/errors/AppError.ts` | Classes abstratas `Entidade`, `AppError`, `RepositorioMySQL<T>` e `CrudService<T>` com herança; polimorfismo em `toJSON()` e no `status` dos erros. Faltam as demais entidades do domínio |
| Tipagem avançada | [x] | `src/repositories/Repositorio.ts`, `src/types/paginacao.ts` | Interfaces `Repositorio<T>` e `ServicoCrud<T>`, tipo genérico `Pagina<T>`, union `Perfil`, entradas tratadas como `unknown` (sem `any`) |
| Princípios SOLID | [~] | `src/services/CrudService.ts`, `src/controllers/CrudController.ts` | S: camadas separadas. O: um CRUD novo não muda a base. L: qualquer `CrudService` cumpre o contrato `ServicoCrud`. D: services dependem da interface `Repositorio<T>`. Revisar ao final |
| Exceções e organização | [x] | `src/errors/` | `ValidacaoError`, `NaoAutorizadoError`, `ProibidoError`, `NaoEncontradoError` e `ConflitoError` herdam de `AppError`; pastas por responsabilidade |

## Evolução do Projeto

| Requisito | Estado | Observação |
|---|---|---|
| Conexão com persona/cliente | [x] | Persona descrita no `README.md` (fictícia) |
| Uso de TypeScript sem JS injetado | [x] | Todo o código-fonte é `.ts`/`.tsx` |
