---
name: testar-api
description: Sobe o MySQL e a API da livraria e testa as rotas (autenticação, permissões, validações, paginação e regras de estoque) sem expor credenciais do .env.
---

# Testar a API

## Preparar

1. Confira se o Docker está rodando: `docker ps`.
2. Suba o banco: `npm run db`.
3. Compile e suba a API: `npm run build` e `npm run dev` (porta 3000).

Não leia o `.env`. Para testes, crie usuários pela própria API:

```bash
curl -X POST http://localhost:3000/usuarios -H "Content-Type: application/json" \
  -d '{"nome":"Cliente Teste","email":"cliente@teste.com","senha":"Senha@123","cpf":"529.982.247-25"}'
```

Para rotas de admin, peça para a pessoa responsável fazer login com o administrador e informar o token, ou suba uma instância de teste passando `ADMIN_*` fictícios como variáveis de ambiente do processo (elas têm prioridade sobre o `.env`).

## O que testar em cada rota

| Caso | Esperado |
|---|---|
| Sem `Authorization: Bearer <token>` | 401 |
| Cliente em rota só de admin | 403 |
| Corpo vazio ou inválido | 400 com `erros` por campo |
| Id inexistente em GET, PUT e DELETE | 404 |
| Valor único repetido ou exclusão com vínculo | 409 |
| `?pagina=2&limite=5` | `itens`, `total` e `totalPaginas` coerentes |

Para pedidos, confira também: estoque baixa ao criar, volta ao cancelar ou excluir, pedido acima do estoque retorna 409 e o cliente só enxerga os próprios pedidos.

## Limpar

Remova apenas os registros criados no teste, com `DELETE ... WHERE id = ?` ou pela própria API. Nunca rode `docker compose down -v`, `DROP` ou `TRUNCATE` sem autorização.
