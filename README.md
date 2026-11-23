# Livraria Entre Páginas

Livraria virtual feita para uma pequena empreendedora que vende livros e quer sair das planilhas.

- Clientes se cadastram, consultam o catálogo por categoria e fazem pedidos.
- A administradora cuida de livros, autores, categorias, estoque e status dos pedidos.

Este repositório é a API (Node.js, Express, TypeScript e MySQL). A interface fica no repositório `frontend`.

## Como rodar

Com o Docker Desktop aberto e as pastas `backend` e `frontend` lado a lado:

1. Copie `.env.example` para `.env` e preencha as senhas, o `JWT_SECRET` e os dados do administrador.
2. Rode `docker compose up -d --build` nesta pasta.
3. Acesse `http://localhost:8080`.
