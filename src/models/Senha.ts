import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { AppError } from "../errors/AppError";

export type NivelSenha = "fraca" | "media" | "forte";

const TAMANHO_MINIMO = 8;

const CRITERIOS = [
    { regra: (s: string) => s.length >= TAMANHO_MINIMO, descricao: `ter no mínimo ${TAMANHO_MINIMO} caracteres` },
    { regra: (s: string) => /[a-z]/.test(s), descricao: "ter uma letra minúscula" },
    { regra: (s: string) => /[A-Z]/.test(s), descricao: "ter uma letra maiúscula" },
    { regra: (s: string) => /\d/.test(s), descricao: "ter um número" },
    { regra: (s: string) => /[^A-Za-z0-9]/.test(s), descricao: "ter um caractere especial" },
];

export class Senha {
    // Encapsulamento: o hash nunca é exposto, não existe getter para ele
    readonly #hash: string;
    readonly #salt: string;

    private constructor(hash: string, salt: string) {
        this.#hash = hash;
        this.#salt = salt;
    }

    static criar(texto: string): Senha {
        const erro = Senha.validar(texto);
        if (erro) {
            throw new AppError(erro, 400, { senha: erro });
        }
        const salt = randomBytes(16).toString("hex");
        return new Senha(Senha.gerarHash(texto, salt), salt);
    }

    // Validação de nível de senha
    static avaliarNivel(texto: string): { nivel: NivelSenha; pendencias: string[] } {
        const pendencias = CRITERIOS.filter((c) => !c.regra(texto)).map((c) => c.descricao);
        const atendidos = CRITERIOS.length - pendencias.length;

        let nivel: NivelSenha = "fraca";
        if (atendidos === CRITERIOS.length) {
            nivel = "forte";
        } else if (atendidos >= 3) {
            nivel = "media";
        }

        return { nivel, pendencias };
    }

    static validar(texto: string): string | null {
        if (!texto) {
            return "A senha é obrigatória";
        }

        const { nivel, pendencias } = Senha.avaliarNivel(texto);

        if (nivel !== "forte") {
            return `Senha ${nivel === "media" ? "média" : "fraca"}. A senha precisa ${pendencias.join(", ")}`;
        }

        return null;
    }

    private static gerarHash(texto: string, salt: string): string {
        return scryptSync(texto, salt, 64).toString("hex");
    }

    confere(texto: string): boolean {
        const hashInformado = Buffer.from(Senha.gerarHash(texto, this.#salt), "hex");
        const hashSalvo = Buffer.from(this.#hash, "hex");
        return timingSafeEqual(hashInformado, hashSalvo);
    }
}
