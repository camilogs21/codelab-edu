/**
 * ai.js
 * Sprint 1: um motor de regras simples (regex), NÃO é IA de verdade.
 * Serve para o botão "Explicar código" já ter algo útil pra mostrar
 * enquanto o Sprint 8 não integra um modelo de linguagem de verdade
 * (provavelmente via API da Anthropic, com o código do aluno enviado
 * para análise contextual real).
 *
 * Contrato pensado para durar até lá: `analyzeCode(code)` retorna uma
 * lista de "findings" — o Sprint 8 troca a implementação interna por
 * uma chamada de API, mas o formato do retorno não muda, então
 * `ui.js` não precisa ser reescrito.
 *
 * @typedef {{ line: number, message: string, suggestion?: string }} Finding
 */

/**
 * Regras heurísticas do Sprint 1 — cobrem só o exemplo citado no
 * briefing (atribuir texto a uma variável inteira). Cada regra nova é
 * um item deste array; nenhuma lógica de execução muda.
 */
const RULES = [
  {
    // Ex.: int idade = "18";
    pattern: /\bint\s+(\w+)\s*=\s*"([^"]*)"\s*;/,
    build: (match) => ({
      message: `Você colocou texto em uma variável inteira ("${match[2]}" em "${match[1]}").`,
      suggestion: `int ${match[1]} = ${Number.isNaN(Number(match[2])) ? "0" : match[2]}; ou string ${match[1]} = "${match[2]}";`,
    }),
  },
  {
    // Ex.: uso de = em vez de == dentro de um if
    pattern: /\bif\s*\([^()]*[^=!<>]=[^=][^()]*\)/,
    build: () => ({
      message: "Dentro do if parece haver uma atribuição (=) onde provavelmente era uma comparação (==).",
      suggestion: "Troque = por == para comparar valores.",
    }),
  },
];

/**
 * Analisa o código linha por linha aplicando as regras acima.
 * @param {string} code
 * @returns {Finding[]}
 */
export function analyzeCode(code) {
  const findings = [];
  const lines = code.split("\n");

  lines.forEach((lineText, index) => {
    for (const rule of RULES) {
      const match = lineText.match(rule.pattern);
      if (match) {
        findings.push({ line: index + 1, ...rule.build(match) });
      }
    }
  });

  return findings;
}
