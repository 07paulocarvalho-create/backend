export type Paginacao = {
    pagina: number;
    limite: number;
};

// Tipagem avançada: tipo genérico reaproveitado por todas as listagens
export type Pagina<T> = {
    itens: T[];
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
};

export type Filtros = Record<string, string>;

const LIMITE_PADRAO = 10;
const LIMITE_MAXIMO = 50;

export function lerPaginacao(query: Record<string, unknown>): Paginacao {
    const pagina = Math.max(1, Math.floor(Number(query.pagina)) || 1);
    const limite = Math.min(LIMITE_MAXIMO, Math.max(1, Math.floor(Number(query.limite)) || LIMITE_PADRAO));
    return { pagina, limite };
}
