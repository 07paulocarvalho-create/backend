---
name: atualizar-checklist
description: Confere o RUBRICA_CHECKLIST.md contra o código e os testes, atualizando o estado de cada critério da rubrica com evidências.
---

# Atualizar o checklist da rubrica

O arquivo `RUBRICA_CHECKLIST.md` é a fonte de verdade sobre o que está pronto.

## Estados

- `[x]` concluído **e testado**
- `[~]` parcial
- `[ ]` não implementado
- `[?]` depende de ação ou informação externa

## Passos

1. Para cada critério, localize no código onde ele é atendido (arquivo e, se possível, função).
2. Confirme que existe um teste executado: requisição feita, resultado observado. Sem teste, o máximo é `[~]`.
3. Preencha as colunas **Onde** (arquivos) e **Observação** (o que foi feito e como foi testado, com os status HTTP obtidos).
4. Se algo deixou de funcionar, volte o estado e explique o motivo.
5. Atualize o resumo da seção (`- [x]`, `- [~]`...) de acordo com os itens.

## Regras

- Não invente evidências nem marque como concluído o que não foi testado.
- Não copie valores do `.env` para o checklist.
- Itens "NSA" da rubrica não recebem critérios inventados.
