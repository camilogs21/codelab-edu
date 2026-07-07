/**
 * config.js
 * Única fonte de constantes de configuração da plataforma. Nenhum outro
 * módulo deve ter "números mágicos" soltos — se um valor pode mudar por
 * decisão de produto (não de lógica), ele mora aqui.
 */

/** Prefixo de todas as chaves gravadas no localStorage (storage.js). */
export const STORAGE_NAMESPACE = "codelab-edu";

/** XP necessário para completar um nível. Curva simples e linear por
 *  enquanto — o Sprint 5 pode substituir por uma curva progressiva. */
export const XP_PER_LEVEL = 100;

/**
 * Linguagens suportadas e seu estado. Decisão do Sprint 1: C/C++ é a
 * prioridade do MVP, compilada via API externa. As demais entram
 * progressivamente (ver spec "FUTURAS LINGUAGENS").
 */
export const LANGUAGES = {
  cpp: { label: "C++", enabled: true, engine: "external-api" },
  c: { label: "C", enabled: true, engine: "external-api" },
  python: { label: "Python", enabled: false, engine: "pyodide" },
  csharp: { label: "C#", enabled: false, engine: "external-api" },
  java: { label: "Java", enabled: false, engine: "external-api" },
  javascript: { label: "JavaScript", enabled: false, engine: "native" },
  php: { label: "PHP", enabled: false, engine: "external-api" },
  sql: { label: "SQL", enabled: false, engine: "external-api" },
};

/**
 * Configuração da API externa de compilação (Sprint 3). A URL fica vazia
 * de propósito — no Sprint 3 ela aponta para um proxy próprio (função
 * serverless), nunca diretamente para o provedor com a chave exposta.
 */
export const COMPILER_API = {
  baseUrl: "", // preenchido no Sprint 3
  timeoutMs: 10000,
};

/**
 * Configuração do Monaco Editor (Sprint 2). `cdnVersion` precisa ficar em
 * sincronia com a tag <script> do loader em index.html — se atualizar
 * uma, atualize a outra.
 */
export const EDITOR_DEFAULTS = {
  cdnVersion: "0.55.1",
  defaultLanguage: "cpp",
  fontSize: 14,
  minFontSize: 10,
  maxFontSize: 24,
  minimapEnabled: true,
};
