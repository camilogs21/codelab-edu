/**
 * compiler.js
 * Sprint 3: integração real com a API do JDoodle para compilar e
 * executar C/C++. O contrato público (`compileAndRun`) continua o mesmo
 * definido no Sprint 1 — só a implementação por dentro mudou.
 *
 * Correção importante: o JDoodle bloqueia chamadas diretas do navegador
 * (CORS) — a API dele é feita para ser chamada de servidor pra servidor.
 * Por isso esta função não chama `api.jdoodle.com` diretamente; ela
 * chama `/api/compile`, uma rota do próprio servidor local (ver
 * `server.py` na raiz do projeto), que repassa a requisição pro JDoodle
 * do lado do servidor, onde CORS não existe. Rodar `python3 server.py`
 * em vez do `python3 -m http.server` simples é o que ativa essa rota.
 */

import { JDOODLE } from "./config.js";
import { get } from "./storage.js";

const LOCAL_PROXY_URL = "/api/compile";

/** Lê as credenciais salvas pelo professor no painel de Configurações. */
function getCredentials() {
  const state = get("state", {});
  return {
    clientId: state?.settings?.jdoodleClientId || "",
    clientSecret: state?.settings?.jdoodleClientSecret || "",
  };
}

/**
 * Compila e executa um código-fonte via JDoodle (através do proxy local
 * em server.py).
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
    const response = await fetch(LOCAL_PROXY_URL, {
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

    if (response.status === 404) {
      return {
        stdout: "",
        stderr:
          "Rota /api/compile não encontrada. Você está rodando 'python3 -m http.server'? " +
          "Use 'python3 server.py' no lugar dele — é ele que sabe conversar com o JDoodle.",
        exitCode: 1,
        compileOutput: "",
      };
    }

    const data = await response.json();

    if (!response.ok) {
      const message = String(data.error || "");
      if (/limit/i.test(message)) {
        return {
          stdout: "",
          stderr: "Limite diário de 200 execuções do JDoodle atingido. Tente novamente amanhã.",
          exitCode: 1,
          compileOutput: "",
        };
      }
      if (/invalid/i.test(message) || response.status === 401) {
        return {
          stdout: "",
          stderr: "Client ID/Secret inválidos. Confira em Configurações.",
          exitCode: 1,
          compileOutput: "",
        };
      }
      return {
        stdout: "",
        stderr: message || `Falha ao contactar o serviço de compilação (HTTP ${response.status}).`,
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
        : `Não foi possível conectar ao servidor local: ${err.message}`,
      exitCode: 1,
      compileOutput: "",
    };
  } finally {
    clearTimeout(timeout);
  }
}
