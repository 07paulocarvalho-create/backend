---
name: revisar-codigo
description: Revisa uma mudança na API da livraria antes da entrega, conferindo encapsulamento, tratamento de erros, tipagem, segurança do SQL e testes.
---

# Revisar código

Use antes de entregar qualquer mudança.

## O que conferir

1. **Encapsulamento**: estado das entidades em campos `#privados`; construtor só atribui valores; getter ou setter apenas quando houver validação, transformação ou regra de negócio.
2. **Erros**: regras de negócio lançam uma subclasse de `AppError` (`ValidacaoError`, `NaoEncontradoError`, `ConflitoError`, `ProibidoError`, `NaoAutorizadoError`), nunca `Error` genérico.
3. **Tipagem**: nada de `any`; entrada da requisição tratada como `unknown` com `texto()` e `numero()`.
4. **SQL**: sempre com parâmetros `?`; nomes de tabela e coluna só vindos do código.
5. **Permissões**: rotas novas passam por `autenticar`; escrita no catálogo exige `exigirPerfil("admin")`.
6. **Dependências**: services recebem interfaces (`Repositorio<T>`), não classes concretas.
7. **Segredos**: nenhum valor do `.env` no código, em logs ou na resposta.

## Antes de terminar

- `npm run build` sem erros.
- Rotas afetadas testadas com a skill `testar-api`.
