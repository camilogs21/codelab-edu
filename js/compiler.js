/**
 * compiler.js
 * Sprint 1: apenas define o contrato que será implementado de verdade
 * no Sprint 3.
 *
 * Decisão de arquitetura (confirmada com o professor): a linguagem
 * prioritária do MVP é C/C++, compilado via API externa (ex.: Judge0
 * ou JDoodle) — não há motor de compilação client-side para C/C++ como
 * existe para Python via Pyodide. Isso implica:
 *   - `compileAndRun` é assíncrona e depende de rede;
 *   - a plataforma precisa de um estado de "sem internet" tratado na UI
 *     (o PWA do Sprint 6 cacheia todo o resto, mas não a execução);
 *   - a chave de API NUNCA deve ficar hardcoded no front-end — no
 *     Sprint 3 isso será resolvido com um proxy leve (Cloudflare
 *     Worker / função serverless) para não expor a chave no cliente.
 *
 * Este módulo permanece com uma implementação simulada até lá, para que
 * o botão "Executar" já tenha um comportamento visível na demo do
 * Sprint 1.
 */

import { COMPILER_API } from "./config.js";

/**
 * Compila e executa um código-fonte.
 * @param {string} _code       Código-fonte C/C++.
 * @param {string} _stdin      Entrada padrão fornecida pelo aluno (Sprint 3).
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
export async function compileAndRun(_code, _stdin = "") {
  // Simulação apenas para o Sprint 1 — sem chamada de rede real ainda.
  // Sprint 3: fetch(COMPILER_API.baseUrl, { signal: AbortSignal.timeout(COMPILER_API.timeoutMs), ... })
  void COMPILER_API; // mantém o import "vivo" e visível como próximo passo
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    stdout: "[demonstração] Motor de compilação C/C++ chega no Sprint 3.",
    stderr: "",
    exitCode: 0,
  };
}
