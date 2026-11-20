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

### Edição de Usuário - [ ]

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| Rota autenticada | [ ] | | |
| Só pode editar o próprio usuário | [ ] | | |
| Todos os campos obrigatórios | [ ] | | |
| Validação de CPF | [ ] | | |
| Validação de nível de senha | [ ] | | |
| Não permitir alterar o email | [ ] | | |

### CRUDs Completos - [ ]

CRUDs planejados: Categorias, Autores, Livros e Pedidos (com itens do pedido).

| Requisito | Estado | Onde | Observação |
|---|---|---|---|
| 4 CRUDs completos | [ ] | | |
| Todas as rotas autenticadas | [ ] | | |
| Paginação das listagens | [ ] | | |
| Não editar/deletar recursos inexistentes | [ ] | | |
| Ao menos 1 relacionamento | [ ] | | Livro → Autor/Categoria, Pedido → Usuário, Item → Livro |

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
| Modelagem do domínio e pilares da POO | [~] | | Faltam herança, classe abstrata e polimorfismo |
| Tipagem avançada | [~] | | Faltam interfaces e generics |
| Princípios SOLID | [~] | | Camadas separadas; falta inversão de dependência |
| Exceções e organização | [~] | `src/errors/AppError.ts` | Falta hierarquia de erros |

## Evolução do Projeto

| Requisito | Estado | Observação |
|---|---|---|
| Conexão com persona/cliente | [x] | Persona descrita no `README.md` (fictícia) |
| Uso de TypeScript sem JS injetado | [x] | Todo o código-fonte é `.ts`/`.tsx` |
