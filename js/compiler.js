/**
 * compiler.js
 * Sprint 3: integração real com a API do JDoodle para compilar e
 * executar C/C++ — trocado do Judge0 (ver config.js e docs/api.md para
 * o motivo da troca: Judge0/RapidAPI exige cartão até no plano grátis).
 * O contrato público (`compileAndRun`) continua o mesmo definido no
 * Sprint 1 — só a implementação por dentro mudou.
 */

import { JDOODLE } from "./config.js";
import { get } from "./storage.js";

/** Lê as credenciais salvas pelo professor no painel de Configurações. */
function getCredentials() {
  const state = get("state", {});
  return {
    clientId: state?.settings?.jdoodleClientId || "",
    clientSecret: state?.settings?.jdoodleClientSecret || "",
  };
}

/**
 * Compila e executa um código-fonte via JDoodle.
 * @param {string} code       Código-fonte C/C++.
 * @param {string} stdin      Entrada padrão fornecida pelo aluno.
 * @param {"c"|"cpp"} language
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number, compileOutput: string}>}
 */
export async function compileAndRun(code, stdin = "", language = "cpp") {
  const { clientId, clientSecret } = getCredentials();

  if (!clientId || !clientSecret) {
    return {
      stdout: "",
      stderr:
        "Client ID/Secret do JDoodle não configurados. Abra Configurações (engrenagem na " +
        "barra lateral) e cole suas credenciais gratuitas para compilar de verdade.",
      exitCode: 1,
      compileOutput: "",
    };
  }

  const langConfig = JDOODLE.languages[language] ?? JDOODLE.languages.cpp;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), JDOODLE.timeoutMs);

  try {
    const response = await fetch(JDOODLE.executeUrl, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script: code,
        stdin,
        language: langConfig.language,
        versionIndex: langConfig.versionIndex,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        stdout: "",
        stderr: `Falha ao contactar o serviço de compilação (HTTP ${response.status}).`,
        exitCode: 1,
        compileOutput: "",
      };
    }

    // A API do JDoodle retorna HTTP 200 mesmo em vários casos de erro de
    // credenciais/limite — o campo `error` é quem realmente indica isso.
    if (data.error) {
      const message = String(data.error);
      if (/invalid/i.test(message) || data.statusCode === 401) {
        return {
          stdout: "",
          stderr: "Client ID/Secret inválidos. Confira em Configurações.",
          exitCode: 1,
          compileOutput: "",
        };
      }
      if (/limit/i.test(message)) {
        return {
          stdout: "",
          stderr: "Limite diário de 200 execuções do JDoodle atingido. Tente novamente amanhã.",
          exitCode: 1,
          compileOutput: "",
        };
      }
      return { stdout: "", stderr: message, exitCode: 1, compileOutput: "" };
    }

    const isSuccess = data.isExecutionSuccess !== false;
    return {
      stdout: data.output ?? "",
      stderr: isSuccess ? "" : data.output ?? "Erro na execução.",
      compileOutput: data.isCompiled === false ? data.output ?? "" : "",
      exitCode: isSuccess ? 0 : 1,
      statusDescription: isSuccess ? "OK" : "Erro",
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
