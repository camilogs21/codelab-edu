/**
 * terminal.js
 * Sprint 1: escreve linhas de texto simples no painel de terminal
 * (placeholder). Sprint 3 substitui a renderização interna por xterm.js
 * (cores ANSI, scroll real, atalhos de teclado) mantendo esta mesma
 * interface pública (writeLine/clear/writeError).
 */

import { qs } from "./utils.js";

let body = null;

export function initTerminal() {
  body = qs("#terminal-body");

  qs("#btn-clear-terminal")?.addEventListener("click", clear);
}

/** Escreve uma linha comum no terminal. */
export function writeLine(text) {
  if (!body) return;
  const p = document.createElement("p");
  p.className = "terminal-line";
  p.textContent = text;
  body.appendChild(p);
  body.scrollTop = body.scrollHeight;
}

/** Escreve uma linha de erro (cor de destaque semântica). */
export function writeError(text) {
  if (!body) return;
  const p = document.createElement("p");
  p.className = "terminal-line";
  p.style.color = "var(--accent-danger)";
  p.textContent = text;
  body.appendChild(p);
  body.scrollTop = body.scrollHeight;
}

/** Limpa todo o conteúdo do terminal. */
export function clear() {
  if (!body) return;
  body.replaceChildren();
}
