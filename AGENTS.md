# AGENTS.md - Livraria Entre Páginas (backend)

Instruções para agentes de IA que trabalham neste repositório.

## Projeto

API REST de uma livraria virtual: usuários, categorias, autores, livros e pedidos. Node.js 22+, Express 5, TypeScript, MySQL 8 (driver `mysql2`, SQL escrito à mão) e JWT. O frontend fica no repositório irmão `../frontend`.

## Comandos

| Comando | Para quê |
|---|---|
| `npm install` | Instala as dependências |
| `npm run db` | Sobe só o MySQL no Docker (porta liberada em `127.0.0.1`) |
| `npm run dev` | API em modo desenvolvimento (lê o `.env`) |
| `npm run build` | Compila com `tsc`; precisa passar sem erros antes de entregar qualquer mudança |
| `docker compose up -d --build` | Sobe tudo: MySQL, backend, frontend e Nginx |

## Estrutura

```
src/
  models/        entidades; todas herdam de Entidade
  repositories/  interface Repositorio<T> e RepositorioMySQL<T>
  services/      regras de negócio; CrudService<T> é a base dos CRUDs
  controllers/   CrudController<T> genérico e UsuarioController
  routes/        index.ts registra tudo; crudRoutes.ts cria as rotas de um CRUD
  errors/        AppError (abstrata) e erros por status HTTP
  middlewares/   autenticar e exigirPerfil
  database/      conexão, criação das tabelas e do administrador
```

## Convenções

- Código, nomes e mensagens em português. Classes em PascalCase, funções e variáveis em camelCase, tabelas e colunas em snake_case.
- Estado das entidades em campos privados nativos (`#campo`). Getter ou setter só quando houver validação, transformação ou regra de negócio.
- Erros sempre por uma subclasse de `AppError` (`ValidacaoError`, `NaoEncontradoError`, `ConflitoError`...). Nunca `throw new Error` para erro de regra de negócio.
- Sem `any`: dados de entrada chegam como `unknown` e passam por `texto()` e `numero()` de `src/utils/entrada.ts`.
- SQL sempre com parâmetros `?`. Nunca concatene valores vindos da requisição.
- Comentários apenas quando indicarem um item da rubrica ou uma regra de negócio que não é óbvia.
- Não adicione bibliotecas sem pedir autorização.

## Regras (guardrails)

1. **Nunca leia, exiba, copie ou resuma arquivos `.env`.** As variáveis necessárias estão documentadas em `.env.example`. Se precisar de um valor, peça para a pessoa responsável.
2. Nunca escreva senhas, tokens ou segredos no código, em logs, em commits ou em respostas.
3. **Não faça `git commit` nem `git push`.** Prepare as mudanças e entregue os comandos para a pessoa executar.
4. Não rode comandos destrutivos: `docker compose down -v` (apaga o banco), `DROP`, `TRUNCATE`, `DELETE` sem `WHERE` no banco real, `rm -rf`.
5. Não altere a pasta `../referencias-professores`; ela é só para consulta.
6. Não diga que uma tarefa está pronta sem ter testado.
7. Antes de terminar uma tarefa, rode `npm run build` e teste as rotas afetadas.

Essas regras também são aplicadas por `.claude/settings.json` e pelo hook `.claude/hooks/protegerEnv.ts`, que bloqueiam o acesso a `.env` e os comandos proibidos.

## Skills

| Skill | Quando usar |
|---|---|
| [`criar-crud`](.agents/skills/criar-crud/SKILL.md) | Adicionar um novo recurso com CRUD completo |
| [`testar-api`](.agents/skills/testar-api/SKILL.md) | Subir a API e testar rotas, permissões e validações |
| [`revisar-codigo`](.agents/skills/revisar-codigo/SKILL.md) | Revisar uma mudança antes de entregar |
