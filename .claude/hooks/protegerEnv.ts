// Guardrail: bloqueia qualquer ferramenta do agente que tente acessar arquivos .env
// O Claude Code envia o evento em JSON pela entrada padrão; sair com código 2 cancela a ação

type EventoFerramenta = {
    tool_name?: string;
    tool_input?: Record<string, unknown>;
};

const ARQUIVO_ENV = /(?:^|[\s/\\"'=<>(])(\.env[\w.-]*)/g;

function lerEntrada(): Promise<string> {
    return new Promise((resolve) => {
        let dados = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (parte) => (dados += parte));
        process.stdin.on("end", () => resolve(dados));
    });
}

function acessaEnv(texto: string): boolean {
    return [...texto.matchAll(ARQUIVO_ENV)].some(([, arquivo]) => arquivo !== ".env.example");
}

function bloquear(motivo: string): never {
    console.error(motivo);
    process.exit(2);
}

lerEntrada().then((dados) => {
    let evento: EventoFerramenta;
    try {
        evento = JSON.parse(dados || "{}") as EventoFerramenta;
    } catch {
        bloquear("Bloqueado: não foi possível verificar se a ação acessa arquivos .env.");
    }

    const valores = Object.values(evento.tool_input ?? {}).filter((valor): valor is string => typeof valor === "string");

    if (valores.some(acessaEnv)) {
        bloquear("Bloqueado: arquivos .env contêm credenciais e não podem ser acessados pelo agente. Consulte o .env.example.");
    }
});
