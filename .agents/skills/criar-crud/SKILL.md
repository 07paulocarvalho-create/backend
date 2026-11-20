---
name: criar-crud
description: Adiciona um novo recurso com CRUD completo na API da livraria (entidade, tabela, repositório, service e rotas autenticadas com paginação), reaproveitando a base genérica existente.
---

# Criar um CRUD

Use a base genérica. Um CRUD novo não deve alterar `RepositorioMySQL`, `CrudService`, `CrudController` nem `rotasCrud`.

## Passos

1. **Tabela** em `src/database/criarTabelas.ts`
   - `id CHAR(36) PRIMARY KEY` e `criado_em DATETIME(3) NOT NULL` são obrigatórios.
   - Relacionamentos com `FOREIGN KEY`; use `CHECK` para regras como valores não negativos.
   - Coloque a tabela depois das tabelas que ela referencia.

2. **Entidade** em `src/models/<Nome>.ts`
   - `class <Nome> extends Entidade`, com os campos em `#privados`.
   - Construtor só atribui: `constructor(dados, id?, criadoEm?) { super(id, criadoEm); ... }`.
   - `static validar(entrada: Entrada)` lê com `texto()`/`numero()` e chama `ValidacaoError.verificar({ campo: erro | null })`.
   - `atualizar(dados)` e `toJSON()` tipado. Getters só se outra classe precisar do valor.

3. **Repositório** em `src/repositories/<Nome>Repository.ts`
   - `extends RepositorioMySQL<<Nome>>` com `tabela`, `ordenacao`, `paraLinha()` e `deLinha()`.
   - `camposUnicos` para mensagens de duplicidade e `mensagemVinculo` para exclusões bloqueadas por chave estrangeira.
   - Sobrescreva `selecao()` se precisar de `JOIN`.

4. **Service** em `src/services/<Nome>Service.ts`
   - `extends CrudService<<Nome>>`, recebendo `Repositorio<<Nome>>` (a interface, não a classe concreta).
   - Implemente `criar` e `atualizar`. Em `atualizar`, chame `this.buscar(id)` antes de validar, para retornar 404 quando o registro não existe.

5. **Rotas** em `src/routes/index.ts`
   - `rotas.use("/<recurso>", rotasCrud(new CrudController(new <Nome>Service(repositorio))))`.
   - Todas as rotas exigem login. O segundo argumento `false` libera a criação para qualquer usuário logado; o padrão é só admin.

## Antes de entregar

- `npm run build` sem erros.
- Teste com a skill `testar-api`: 401 sem token, 403 para cliente onde for só admin, 400 com dados inválidos, 404 para id inexistente, paginação e 409 em vínculos.
- Atualize o `RUBRICA_CHECKLIST.md` com o novo recurso e os testes feitos.
