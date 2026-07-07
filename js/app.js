/**
 * app.js
 * Ponto de entrada da aplicação. Não contém lógica de domínio própria —
 * apenas inicializa, na ordem correta, os módulos que compõem a IDE.
 *
 * Ordem importa: o tema é aplicado antes de qualquer pintura visível,
 * o storage/gamificação carrega o estado do aluno antes da UI depender
 * dele, e os módulos de interação (ui.js, explorer.js) entram por último.
 */

import { initTheme } from "./theme.js";
import { initGamification } from "./gamification.js";
import { initExplorer } from "./explorer.js";
import { initEditor } from "./editor.js";
import { initTerminal } from "./terminal.js";
import { initUI } from "./ui.js";

function bootstrap() {
  initTheme();
  initGamification();
  initExplorer();
  initEditor();
  initTerminal();
  initUI();

  console.info(
    "%cCodeLab EDU%c — Sprint 1: arquitetura e layout ✅",
    "color:#e2965a;font-weight:700",
    "color:inherit"
  );
}

document.addEventListener("DOMContentLoaded", bootstrap);
