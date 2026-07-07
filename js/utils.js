/**
 * utils.js
 * Funções puras e pequenas, sem estado e sem efeitos colaterais,
 * reutilizadas por qualquer outro módulo da plataforma.
 */

/** Atalho para querySelector. */
export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

/** Atalho para querySelectorAll já convertido em array. */
export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/** Restringe um valor numérico entre min e max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Atrasa a execução de `fn` até que `wait` ms tenham se passado sem
 * novas chamadas. Usado em busca, redimensionamento e digitação no editor.
 */
export function debounce(fn, wait = 200) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}

/** Parse seguro de JSON, retornando `fallback` em caso de erro. */
export function safeJsonParse(raw, fallback = null) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Gera um id curto o suficiente para uso em listas (aulas, missões, etc). */
export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Conta linhas de um texto — usado pelo gutter do editor. */
export function countLines(text) {
  return text.length === 0 ? 1 : text.split("\n").length;
}
