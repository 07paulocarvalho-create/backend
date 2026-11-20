# Checklist da Rubrica - Livraria Entre Páginas

Legenda: `[x]` concluído e testado · `[~]` parcial ou falta testar na tela · `[ ]` não implementado · `[?]` depende de ação externa

Repositórios: `backend/` (API, Docker, Nginx, agentes) e `frontend/` (React).

## Back-end com IA Generativa

### Autenticação - [x]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Login com email e senha | [x] | `src/services/UsuarioService.ts` (`autenticar`), `POST /login` | Testado via requisições HTTP |
| Senha criptografada no banco | [x] | `src/models/Senha.ts`, `src/repositories/UsuarioRepository.ts` | Coluna `senha` guarda `salt:hash` (scrypt). Conferido direto no MySQL: o texto da senha não aparece |
| Validação de email (regex) | [x] | `src/models/Email.ts` | Email fora do padrão retorna 400 |
| Retorno JWT | [x] | `src/utils/token.ts`, `src/middlewares/autenticacao.ts` | Token com `sub` (id) e `perfil`, validade de 8h. Testado: sem token e token falso retornam 401; cliente em rota de admin retorna 403 |
| Logar apenas usuário existente | [x] | `src/services/UsuarioService.ts` | Usuário inexistente ou senha errada retorna 401 |
| Perfis e primeiro administrador | [x] | `src/database/criarAdmin.ts` | Admin criado a partir do `.env` sem duplicar ao reiniciar; cadastro público não aceita `perfil: admin` |

### Cadastro de Usuário - [x]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Campos obrigatórios: nome, email, senha, CPF | [x] | `src/services/UsuarioService.ts` | Corpo vazio retorna 400 com erro por campo |
| Validação de CPF | [x] | `src/models/Cpf.ts` | Dígitos verificadores e sequências repetidas |
| Validação de nível de senha | [x] | `src/models/Senha.ts` | Só aceita senha forte |
| Validação de email | [x] | `src/models/Email.ts` | Formato e unicidade (409) |
| Persistência no banco | [x] | `src/database/`, `src/repositories/UsuarioRepository.ts` | Usuário continua no banco e loga após reiniciar a API e os containers |

### Edição de Usuário - [x]

Rotas: `PUT /usuarios/:id` e `GET /usuarios/me`. Lógica em `src/services/UsuarioService.ts` (`atualizar`).

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Rota autenticada | [x] | `src/routes/usuarioRoutes.ts` | Sem token retorna 401 |
| Só pode editar o próprio usuário | [x] | `UsuarioService.atualizar` | Id da rota diferente do id do token retorna 403 |
| Todos os campos obrigatórios | [x] | `UsuarioService.atualizar` | Nome, CPF e senha; corpo vazio retorna 400 com erro por campo |
| Validação de CPF | [x] | `src/models/Cpf.ts` | Inválido retorna 400; CPF de outro usuário retorna 409 |
| Validação de nível de senha | [x] | `src/models/Senha.ts` | Senha fraca retorna 400; login com a senha nova funciona e com a antiga não |
| Não permitir alterar o email | [x] | `UsuarioService.atualizar`, `src/models/Usuario.ts` | Email diferente retorna 400; no modelo o `#email` é `readonly` e não tem setter |

### CRUDs Completos - [x]

CRUDs: Categorias, Autores, Livros e Pedidos (com itens do pedido).

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| 4 CRUDs completos | [x] | `src/services/CategoriaService.ts`, `AutorService.ts`, `LivroService.ts`, `PedidoService.ts` | Criar, listar, detalhar, editar e excluir testados nos quatro. Em pedidos, a edição é a mudança de status |
| Todas as rotas autenticadas | [x] | `src/routes/crudRoutes.ts` | `autenticar` em todas as rotas. Testado: sem token 401, cliente criando/editando/excluindo catálogo 403 |
| Paginação das listagens | [x] | `src/repositories/RepositorioMySQL.ts`, `src/types/paginacao.ts` | `?pagina` e `?limite` (máx. 50), com `total` e `totalPaginas`. Testado com 12 categorias e com livros |
| Não editar/deletar recursos inexistentes | [x] | `src/services/CrudService.ts` | PUT e DELETE de id inexistente retornam 404 nos quatro CRUDs |
| Ao menos 1 relacionamento | [x] | `src/database/criarTabelas.ts` | Livro → Autor, Livro → Categoria, Pedido → Usuário, Item → Pedido e Item → Livro, todos com chave estrangeira. Excluir autor, categoria ou livro com vínculos retorna 409 |
| Regras de negócio da livraria | [x] | `src/models/Livro.ts`, `src/models/Pedido.ts`, `src/repositories/PedidoRepository.ts` | Preço e estoque não negativos, ISBN validado, pedido acima do estoque retorna 409, total calculado, estoque baixa ao comprar e volta ao cancelar/excluir. Dois pedidos simultâneos pelo último exemplar: um 201 e um 409, estoque nunca negativo |

### Configuração de Agentes - [x]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Arquivo AGENTS.md | [x] | `AGENTS.md` | Projeto, comandos, estrutura, convenções e regras |
| 3 skills específicas | [x] | `.agents/skills/criar-crud`, `testar-api`, `atualizar-checklist` | Cada uma com `SKILL.md` e frontmatter `name`/`description` |
| Guardrails | [x] | `.claude/settings.json`, `AGENTS.md` | Bloqueia `git commit`, `git push`, `docker compose down -v`, `docker volume rm` e `rm -rf` |
| Proteção do `.env` | [x] | `.claude/settings.json`, `.claude/hooks/protegerEnv.ts` | Regras de bloqueio de leitura e hook `PreToolUse`. Hook testado com eventos simulados: bloqueia Read, Grep, Glob, Bash e PowerShell em `.env`, libera `.env.example` e `process.env` no código, e bloqueia quando não consegue ler o evento |

## Front-end

Itens com `[~]` têm a lógica testada (schemas e chamadas à API pelo Nginx), mas falta conferir na tela.

### Autenticação - [~]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Campos para email e senha | [~] | `src/pages/LoginPage.tsx` | |
| Validação de email (regex) | [~] | `src/pages/LoginPage.tsx`, `src/utils/validacoes.ts` | `emailValido` testado com casos válidos e inválidos |
| Token no localStorage | [~] | `src/api/token.ts`, `src/contexts/AuthProvider.tsx` | Interceptor do axios envia o token; 401 com token limpa e volta ao login |
| Erros da API de forma amigável | [~] | `src/api/erros.ts`, `src/componentes/Alerta.tsx` | Mensagem geral e por campo; servidor fora do ar tem mensagem própria |
| Redirecionar para a área logada | [~] | `src/pages/LoginPage.tsx`, `src/componentes/RotaPrivada.tsx` | Volta para a página que a pessoa tentou abrir |

### Cadastro de Usuário - [x]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Campos obrigatórios | [x] | `src/schemas/cadastroSchema.ts` | |
| Verificação dupla de senha | [x] | `src/schemas/campos.ts` | |
| Validação de CPF | [x] | `src/utils/validacoes.ts` | Com máscara |
| Validação de email | [x] | `src/utils/validacoes.ts` | |
| Redirecionar para o login | [x] | `src/pages/CadastroPage.tsx` | Testado no navegador na sprint anterior |
| Mensagens de erro da API | [x] | `src/api/erros.ts` | Geral e por campo |

### Edição de Usuário - [~]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Contexto com o usuário global | [~] | `src/contexts/AuthProvider.tsx`, `src/hooks/useAuth.ts` | Nome no cabeçalho, início e perfil; atualizado após editar |
| Validação de CPF | [~] | `src/schemas/perfilSchema.ts` | Schema testado |
| Validação de nível de senha | [~] | `src/schemas/campos.ts`, `src/componentes/ForcaSenha.tsx` | Indicador fraca/média/forte com o que falta |
| Confirmação da senha | [~] | `src/schemas/campos.ts` | Schema testado |
| Não permitir alterar o email | [~] | `src/pages/PerfilPage.tsx` | Email só aparece para leitura e não é enviado |

### CRUDs Completos - [ ]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| 4 CRUDs completos | [ ] | | Próxima etapa |
| Paginação das listagens | [ ] | | |
| Validação dos campos obrigatórios | [ ] | | |
| Listagem e cadastro/edição em telas separadas | [ ] | | |

### Componentização - [~]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Componentes genéricos e reutilizáveis | [~] | `src/componentes/` | `Campo`, `Alerta`, `ForcaSenha`, `Layout`, `RotaPrivada`; faltam tabela e paginação |
| Telas compostas por vários componentes | [~] | `src/pages/PerfilPage.tsx`, `CadastroPage.tsx` | |
| Componentes e páginas em pastas separadas | [x] | `src/componentes/`, `src/pages/` | |
| Componentes exclusivos da página em funções separadas | [~] | `src/pages/PerfilPage.tsx` (`DadosConta`), `src/pages/InicioPage.tsx` (`Atalho`) | |

## Ferramentas DevOps - [x]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Organização do docker-compose.yml | [x] | `docker-compose.yml` | Quatro serviços, volume, duas redes, variáveis vindas do `.env`, healthcheck do MySQL e `depends_on` |
| Integração entre serviços | [x] | `docker-compose.yml`, `nginx/default.conf` | Backend usa `DB_HOST=mysql`; frontend compilado com `VITE_API_URL=/api`; cadastro, login e edição testados via `localhost:8080/api` |
| Persistência no MySQL com volume | [x] | volume `mysql_dados` | Testado: cadastro, `docker compose down`, `up` e login com o mesmo usuário |
| Nginx como proxy reverso | [x] | `nginx/default.conf` | `/api/*` para o backend e o resto para o frontend (inclusive rotas do React como `/perfil`) |
| Isolamento por Docker Network | [x] | `docker-compose.yml` | Só o Nginx publica porta (8080). `rede_interna` é `internal`: portas 3000 e 3306 inacessíveis do host e o backend não acessa a internet |

## Tech Forge

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Encapsulamento e proteção do estado | [x] | `src/models/*.ts` | Campos `#privados` e `readonly`, construtores só inicializam, listas devolvidas como cópia |
| Acesso controlado e propriedades | [x] | `src/models/` | `set nome` valida; `cpf.formatado` transforma; `pedido.total` e `item.subtotal` são calculados; senha sem getter |
| Modelagem do domínio e pilares da POO | [x] | `src/models/Entidade.ts`, `src/errors/AppError.ts` | Entidades Usuario, Categoria, Autor, Livro e Pedido herdam de `Entidade`; classes abstratas `Entidade`, `AppError`, `RepositorioMySQL<T>` e `CrudService<T>`; polimorfismo em `toJSON()`, no `status` dos erros e nos services usados pelo mesmo controller |
| Tipagem avançada | [x] | `src/repositories/Repositorio.ts`, `src/types/paginacao.ts` | Interfaces genéricas `Repositorio<T>` e `ServicoCrud<T>`, `Pagina<T>`, unions `Perfil` e `StatusPedido` (derivado de array `as const`), `Pick` e `Omit`, entradas como `unknown` (sem `any`) |
| Princípios SOLID | [x] | `src/services/`, `src/repositories/` | S: camadas separadas. O: um CRUD novo não muda a base. L: os quatro services funcionam no mesmo `CrudController`. I: `RepositorioPedidos` acrescenta só `cancelar`; `PedidoService` depende só de `buscarPorId` do usuário. D: services dependem de interfaces |
| Exceções e organização | [x] | `src/errors/` | `ValidacaoError`, `NaoAutorizadoError`, `ProibidoError`, `NaoEncontradoError` e `ConflitoError` herdam de `AppError`; pastas por responsabilidade |

## Evolução do Projeto

| Requisito | Estado | Observação |
|---|---|---|
| Conexão com persona/cliente | [x] | Persona descrita no `README.md` (fictícia) |
| Uso de TypeScript sem JS injetado | [x] | Todo o código-fonte é `.ts`/`.tsx`, inclusive o hook dos agentes |
