/**
 * storage.js
 * Única porta de entrada para o localStorage em toda a plataforma.
 * Nenhum outro módulo deve chamar `localStorage` diretamente — isso
 * mantém o formato das chaves consistente e facilita trocar o backend
 * de armazenamento no futuro (ex.: sincronizar com um servidor).
 */

import { safeJsonParse } from "./utils.js";
import { STORAGE_NAMESPACE, EDITOR_DEFAULTS } from "./config.js";

/** Monta a chave final prefixada pelo namespace da plataforma. */
function key(name) {
  return `${STORAGE_NAMESPACE}:${name}`;
}

/** Lê um valor. Retorna `fallback` se a chave não existir ou o JSON for inválido. */
export function get(name, fallback = null) {
  const raw = localStorage.getItem(key(name));
  if (raw === null) return fallback;
  return safeJsonParse(raw, fallback);
}

/** Grava um valor, serializando como JSON. */
export function set(name, value) {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("[storage] Falha ao salvar", name, err);
    return false;
  }
}

/** Remove uma chave específica. */
export function remove(name) {
  localStorage.removeItem(key(name));
}

/**
 * Estado padrão salvo automaticamente: tema, progresso, XP, última aula,
 * último código digitado e configurações gerais (spec: "LOCAL STORAGE").
 */
export const DEFAULT_STATE = {
  theme: "dark",
  xp: 0,
  level: 1,
  streakDays: 0,
  lastLessonId: null,
  lastCode: "",
  settings: {
    fontSize: EDITOR_DEFAULTS.fontSize,
    // Credenciais pessoais do professor para a API JDoodle. Nunca vêm
    // hardcoded no código-fonte — só existem depois que o próprio
    // professor as digita no painel de Configurações. Ver aviso de
    // segurança completo em config.js (JDOODLE) e docs/api.md.
    jdoodleClientId: "",
    jdoodleClientSecret: "",
  },
};

/** Carrega o estado persistido, preenchendo qualquer campo ausente com o padrão. */
export function loadState() {
  const saved = get("state", {});
  return { ...DEFAULT_STATE, ...saved };
}

/** Salva o estado completo (chamado com debounce pelos módulos que o alteram). */
export function saveState(state) {
  set("state", state);
}
