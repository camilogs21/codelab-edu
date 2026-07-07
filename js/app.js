/**
 * app.js
 * Ponto de entrada da aplicação. Não contém lógica de domínio própria —
 * apenas inicializa, na ordem correta, os módulos que compõem a IDE.
 *
 * Sprint 2: o Monaco Editor carrega de forma assíncrona (via CDN), então
 * o bootstrap agora é async e aguarda `initEditor()` antes de montar o
 * workbench (explorer + abas), que depende do editor já existir.
 * Sprint 3: terminal real (xterm.js) e compilação real (Judge0) entram
 * na mesma ordem de sempre — nenhuma mudança estrutural aqui.
 */

import { initTheme, getCurrentTheme } from "./theme.js";
import { initGamification } from "./gamification.js";
import { initEditor } from "./editor.js";
import { initTerminal } from "./terminal.js";
import { initUI, initWorkbench } from "./ui.js";

async function bootstrap() {
  initTheme();
  initGamification();

  await initEditor(getCurrentTheme());
  initWorkbench();

  initTerminal();
  initUI();

  console.info(
    "%cCodeLab EDU%c — Sprint 3: terminal real + compilação Judge0 ✅",
    "color:#e2965a;font-weight:700",
    "color:inherit"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((err) => {
    console.error("[app] Falha ao iniciar a plataforma:", err);
  });
});
