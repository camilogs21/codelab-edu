/**
 * ui.js
 * Amarra interações de "chrome" da IDE que não pertencem a um módulo de
 * domínio específico: abrir/fechar o drawer de missões, alternar tema,
 * trocar de aba no tabbar, e o botão "Executar" (que hoje só chama o
 * compiler.js simulado — Sprint 3 troca a implementação por trás dele).
 */

import { qs, qsa } from "./utils.js";
import { toggleTheme } from "./theme.js";
import { compileAndRun } from "./compiler.js";
import { writeLine, writeError, clear as clearTerminal } from "./terminal.js";
import { getValue } from "./editor.js";
import { analyzeCode } from "./ai.js";

function initThemeToggle() {
  qs("#btn-theme-toggle")?.addEventListener("click", toggleTheme);
}

function initMissionsDrawer() {
  const drawer = qs("#missions-drawer");
  const overlay = qs("#drawer-overlay");
  if (!drawer || !overlay) return;

  const open = () => {
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  };

  qs("#btn-missions")?.addEventListener("click", open);
  qs("#btn-close-missions")?.addEventListener("click", close);
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function renderFindings(panel, findings) {
  const body = qs(".helppanel__body", panel);
  if (!body) return;

  if (findings.length === 0) {
    body.innerHTML = `<p class="helppanel__hint">Nenhum problema encontrado pelas regras atuais. <em>(Análise completa com IA chega no Sprint 8)</em></p>`;
    return;
  }

  body.replaceChildren(
    ...findings.map((finding) => {
      const card = document.createElement("div");
      card.className = "code-finding";
      card.innerHTML = `
        <div class="code-finding__line">Linha ${finding.line}</div>
        <p class="code-finding__message">${finding.message}</p>
        ${finding.suggestion ? `<div class="code-finding__suggestion">${finding.suggestion}</div>` : ""}
      `;
      return card;
    })
  );
}

function initHelpPanel() {
  const panel = qs("#helppanel");
  if (!panel) return;

  qs("#btn-explain")?.addEventListener("click", () => {
    panel.hidden = false;
    renderFindings(panel, analyzeCode(getValue()));
  });
  qs("#btn-close-help")?.addEventListener("click", () => {
    panel.hidden = true;
  });
}

function initTabbar() {
  const tabs = qsa(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
      // Fechar aba não deve também ativá-la.
      if (event.target.closest(".tab__close")) return;
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
    });
  });
}

function initRunButton() {
  const btn = qs("#btn-run");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    clearTerminal();
    writeLine("$ Compilando…");
    const result = await compileAndRun(getValue());
    if (result.stdout) writeLine(result.stdout);
    if (result.stderr) writeError(result.stderr);
    writeLine(`$ processo finalizado com código ${result.exitCode}`);
    btn.disabled = false;
  });
}

/** Ponto único de inicialização de todo o "chrome" do shell. */
export function initUI() {
  initThemeToggle();
  initMissionsDrawer();
  initHelpPanel();
  initTabbar();
  initRunButton();
}
