/**
 * editor.js
 * Sprint 1: controla o placeholder (<textarea> + gutter) que simula o
 * editor real — sincroniza números de linha e posição do cursor na
 * status bar, e persiste o último código digitado.
 *
 * Sprint 2: este módulo passa a inicializar o Monaco Editor de verdade.
 * A interface pública abaixo (getValue/setValue/onChange/focus) é o
 * contrato que o resto da plataforma (compiler.js, achievements.js,
 * lessons.js) já usa — trocar o motor de renderização não deve exigir
 * mudanças em quem consome este módulo.
 */

import { qs, countLines, debounce } from "./utils.js";
import { get, set } from "./storage.js";

let textarea = null;
let gutter = null;
let cursorStatusEl = null;
const changeListeners = [];

/** Reconstrói os números de linha do gutter a partir do conteúdo atual. */
function renderGutter() {
  const total = countLines(textarea.value);
  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= total; i += 1) {
    const line = document.createElement("span");
    line.textContent = String(i);
    fragment.appendChild(line);
  }
  gutter.replaceChildren(fragment);
}

/** Calcula linha/coluna do cursor e atualiza a status bar. */
function updateCursorStatus() {
  if (!cursorStatusEl) return;
  const pos = textarea.selectionStart;
  const before = textarea.value.slice(0, pos);
  const lines = before.split("\n");
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  cursorStatusEl.textContent = `Ln ${line}, Col ${col}`;
}

const persistCode = debounce((code) => set("lastCode", code), 400);

/** Inicializa o placeholder do editor. Chamado uma única vez pelo app.js. */
export function initEditor() {
  textarea = qs("#code-input");
  gutter = qs("#editor-gutter");
  cursorStatusEl = qs("#status-cursor");
  if (!textarea || !gutter) return;

  const savedCode = get("lastCode", null);
  if (savedCode) textarea.value = savedCode;

  renderGutter();
  updateCursorStatus();

  textarea.addEventListener("input", () => {
    renderGutter();
    updateCursorStatus();
    persistCode(textarea.value);
    changeListeners.forEach((fn) => fn(textarea.value));
  });
  textarea.addEventListener("keyup", updateCursorStatus);
  textarea.addEventListener("click", updateCursorStatus);
  textarea.addEventListener("scroll", () => {
    gutter.scrollTop = textarea.scrollTop;
  });
}

/* ---------------------------------------------------------------------
 * Interface pública estável — mantida idêntica após a migração para
 * Monaco no Sprint 2.
 * ------------------------------------------------------------------- */

/** Retorna o código atual do editor. */
export function getValue() {
  return textarea ? textarea.value : "";
}

/** Define o código do editor programaticamente (ex.: ao abrir uma aula). */
export function setValue(code) {
  if (!textarea) return;
  textarea.value = code;
  renderGutter();
  updateCursorStatus();
}

/** Registra um callback chamado a cada alteração do código. */
export function onChange(fn) {
  changeListeners.push(fn);
}

/** Devolve o foco ao editor (usado após fechar painéis/modais). */
export function focus() {
  textarea?.focus();
}
