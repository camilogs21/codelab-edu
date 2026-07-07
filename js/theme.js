/**
 * theme.js
 * Controla o tema visual (dark/light) da plataforma. O valor ativo é
 * refletido no atributo `data-theme` do <body>, que é o gancho que todo
 * o CSS de themes.css usa para trocar as variáveis de cor.
 */

import { get, set } from "./storage.js";

const STORAGE_KEY = "theme";

/** Aplica um tema no documento e persiste a escolha. */
export function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  set(STORAGE_KEY, theme);
}

/** Alterna entre dark e light. Retorna o novo tema aplicado. */
export function toggleTheme() {
  const current = document.body.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/** Restaura o tema salvo (ou "dark" como padrão) ao iniciar a aplicação. */
export function initTheme() {
  const saved = get(STORAGE_KEY, "dark");
  applyTheme(saved);
}
