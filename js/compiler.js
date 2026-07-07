/**
 * compiler.js
 * Sprint 3: integração real com Judge0 CE (via RapidAPI) para compilar e
 * executar C/C++. O contrato público (`compileAndRun`) é o mesmo definido
 * no Sprint 1 — só a implementação por dentro mudou, exatamente como o
 * README prometeu.
 *
 * Ver o aviso de segurança completo em config.js (JUDGE0) e em
 * docs/api.md: a chave de API vem do professor via Configurações e fica
 * só no localStorage do navegador dele, nunca commitada no repositório.
 */

import { JUDGE0 } from "./config.js";
import { get } from "./storage.js";

/** Codifica texto em base64 (Judge0 exige base64 quando base64_encoded=true). */
function toBase64(text) {
  return btoa(unescape(encodeURIComponent(text ?? "")));
}

/** Decodifica um campo base64 vindo do Judge0. Retorna string vazia se nulo. */
function fromBase64(value) {
  if (!value) return "";
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return value;
  }
}

/** Lê a chave de API salva pelo professor no painel de Configurações. */
function getApiKey() {
  const state = get("state", {});
  return state?.settings?.judge0ApiKey || "";
}

/**
 * Compila e executa um código-fonte via Judge0 CE.
 * @param {string} code       Código-fonte C/C++.
 * @param {string} stdin      Entrada padrão fornecida pelo aluno.
 * @param {"c"|"cpp"} language
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number, compileOutput: string}>}
 */
export async function compileAndRun(code, stdin = "", language = "cpp") {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      stdout: "",
      stderr:
        "Nenhuma chave de API configurada. Abra Configurações (engrenagem na barra lateral) " +
        "e cole sua chave do Judge0 (RapidAPI) para compilar de verdade.",
      exitCode: 1,
      compileOutput: "",
    };
  }

  const languageId = JUDGE0.languageIds[language] ?? JUDGE0.languageIds.cpp;
  const url = `${JUDGE0.baseUrl}/submissions?base64_encoded=true&wait=true&fields=*`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), JUDGE0.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": JUDGE0.host,
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: toBase64(code),
        stdin: toBase64(stdin),
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          stdout: "",
          stderr: "Chave de API inválida ou expirada. Confira em Configurações.",
          exitCode: 1,
          compileOutput: "",
        };
      }
      if (response.status === 429) {
        return {
          stdout: "",
          stderr: "Limite de requisições da API atingido por hoje. Tente novamente mais tarde.",
          exitCode: 1,
          compileOutput: "",
        };
      }
      return {
        stdout: "",
        stderr: `Falha ao contactar o serviço de compilação (HTTP ${response.status}).`,
        exitCode: 1,
        compileOutput: "",
      };
    }

    const data = await response.json();
    return {
      stdout: fromBase64(data.stdout),
      stderr: fromBase64(data.stderr),
      compileOutput: fromBase64(data.compile_output),
      exitCode: data.status?.id === 3 ? 0 : 1, // status.id 3 = "Accepted" no Judge0
      statusDescription: data.status?.description ?? "",
    };
  } catch (err) {
    const timedOut = err.name === "AbortError";
    return {
      stdout: "",
      stderr: timedOut
        ? "Tempo de compilação esgotado. O serviço pode estar indisponível — verifique sua internet."
        : `Não foi possível conectar ao serviço de compilação: ${err.message}`,
      exitCode: 1,
      compileOutput: "",
    };
  } finally {
    clearTimeout(timeout);
  }
}
