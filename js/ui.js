/**
 * ui.js
 * Amarra interações de "chrome" da IDE que não pertencem a um módulo de
 * domínio específico. Sprint 2 adiciona o "workbench": a orquestração
 * entre explorer.js (quais arquivos existem) e editor.js (o que está
 * aberto no Monaco agora), incluindo o tabbar dinâmico.
 */

import { qs, qsa } from "./utils.js";
import { toggleTheme } from "./theme.js";
import { compileAndRun } from "./compiler.js";
import { writeLine, writeError, writeSuccess, clear as clearTerminal, refit as refitTerminal } from "./terminal.js";
import { get, set } from "./storage.js";
import {
  getValue,
  openFile,
  closeFile,
  setTheme as setEditorTheme,
  zoomIn,
  zoomOut,
  toggleMinimap,
  onKeywordClick,
} from "./editor.js";
import { initExplorer, getFileById, highlightFile } from "./explorer.js";
import { analyzeCode } from "./ai.js";

/* ---------------------------------------------------------------------
 * Workbench: abas de arquivos abertos
 * ------------------------------------------------------------------- */

let openFileIds = [];
let activeFileId = null;

function renderTabs() {
  const tabbar = qs("#tabbar");
  if (!tabbar) return;

  tabbar.replaceChildren(
    ...openFileIds.map((fileId) => {
      const file = getFileById(fileId);
      const tab = document.createElement("div");
      tab.className = `tab${fileId === activeFileId ? " is-active" : ""}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(fileId === activeFileId));
      tab.dataset.fileId = fileId;
      tab.innerHTML = `
        <span class="tab__icon">📄</span> ${file ? file.name : fileId}
        <button class="tab__close" aria-label="Fechar aba ${file ? file.name : ""}">×</button>
      `;
      return tab;
    })
  );
}

/** Abre um arquivo no workbench: adiciona aba se necessário, ativa,
 *  sincroniza o editor e o destaque no explorer. */
function openInWorkbench(file) {
  if (!openFileIds.includes(file.id)) {
    openFileIds.push(file.id);
  }
  activeFileId = file.id;
  openFile(file);
  highlightFile(file.id);
  renderTabs();
}

function closeTab(fileId) {
  openFileIds = openFileIds.filter((id) => id !== fileId);
  closeFile(fileId);

  if (activeFileId === fileId) {
    const nextId = openFileIds[openFileIds.length - 1] || null;
    activeFileId = nextId;
    if (nextId) {
      const nextFile = getFileById(nextId);
      if (nextFile) {
        openFile(nextFile);
        highlightFile(nextId);
      }
    }
  }
  renderTabs();
}

function initTabbarInteractions() {
  const tabbar = qs("#tabbar");
  if (!tabbar) return;

  tabbar.addEventListener("click", (event) => {
    const closeBtn = event.target.closest(".tab__close");
    const tab = event.target.closest(".tab");
    if (!tab) return;

    if (closeBtn) {
      closeTab(tab.dataset.fileId);
      return;
    }
    const file = getFileById(tab.dataset.fileId);
    if (file) openInWorkbench(file);
  });
}

/** Ponto de entrada do workbench — chamado depois que o Monaco já
 *  terminou de inicializar (ver app.js). */
export function initWorkbench() {
  const defaultId = initExplorer(openInWorkbench);
  initTabbarInteractions();

  const defaultFile = getFileById(defaultId);
  if (defaultFile) openInWorkbench(defaultFile);
}

/* ---------------------------------------------------------------------
 * Tema (sincroniza o Monaco com o toggle dark/light do topbar)
 * ------------------------------------------------------------------- */

function initThemeToggle() {
  qs("#btn-theme-toggle")?.addEventListener("click", () => {
    const next = toggleTheme();
    setEditorTheme(next);
  });
}

/* ---------------------------------------------------------------------
 * Zoom e minimapa do editor
 * ------------------------------------------------------------------- */

function initEditorToolbar() {
  qs("#btn-zoom-in")?.addEventListener("click", zoomIn);
  qs("#btn-zoom-out")?.addEventListener("click", zoomOut);

  const minimapBtn = qs("#btn-toggle-minimap");
  minimapBtn?.addEventListener("click", () => {
    const enabled = toggleMinimap();
    minimapBtn.classList.toggle("is-active", enabled);
    minimapBtn.setAttribute("aria-pressed", String(enabled));
  });
}

/* ---------------------------------------------------------------------
 * Drawers (Missões e Configurações compartilham o mesmo overlay)
 * ------------------------------------------------------------------- */

/** Cria os controles abrir/fechar de um drawer sobre o overlay compartilhado. */
function createDrawerController(drawer, overlay) {
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
  return { open, close };
}

function initMissionsDrawer() {
  const drawer = qs("#missions-drawer");
  const overlay = qs("#drawer-overlay");
  if (!drawer || !overlay) return null;

  const { open, close } = createDrawerController(drawer, overlay);
  qs("#btn-missions")?.addEventListener("click", open);
  qs("#btn-close-missions")?.addEventListener("click", close);
  return close;
}

function initSettingsDrawer() {
  const drawer = qs("#settings-drawer");
  const overlay = qs("#drawer-overlay");
  const inputId = qs("#input-jdoodle-client-id");
  const inputSecret = qs("#input-jdoodle-client-secret");
  if (!drawer || !overlay || !inputId || !inputSecret) return null;

  const { open, close } = createDrawerController(drawer, overlay);

  qs("#btn-settings")?.addEventListener("click", () => {
    const state = get("state", {});
    inputId.value = state?.settings?.jdoodleClientId || "";
    inputSecret.value = state?.settings?.jdoodleClientSecret || "";
    open();
  });
  qs("#btn-close-settings")?.addEventListener("click", close);

  qs("#btn-save-settings")?.addEventListener("click", () => {
    const state = get("state", {});
    set("state", {
      ...state,
      settings: {
        ...(state.settings || {}),
        jdoodleClientId: inputId.value.trim(),
        jdoodleClientSecret: inputSecret.value.trim(),
      },
    });
    const status = qs("#settings-save-status");
    if (status) {
      status.hidden = false;
      setTimeout(() => {
        status.hidden = true;
      }, 2000);
    }
  });

  return close;
}

/** Liga o overlay compartilhado: clicar fora ou apertar Esc fecha
 *  qualquer drawer que esteja aberto no momento. */
function initSharedOverlay(closers) {
  const overlay = qs("#drawer-overlay");
  if (!overlay) return;

  const closeAll = () => closers.forEach((close) => close?.());
  overlay.addEventListener("click", closeAll);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
}

/* ---------------------------------------------------------------------
 * Painel de ajuda: "Explicar código" (ai.js) e dicionário (editor.js)
 * ------------------------------------------------------------------- */

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

function renderDictionaryEntry(panel, entry) {
  const body = qs(".helppanel__body", panel);
  if (!body) return;

  body.innerHTML = `
    <div class="code-finding">
      <div class="code-finding__line">${entry.label}</div>
      <p class="code-finding__message">${entry.definition}</p>
      <div class="code-finding__suggestion">${entry.example}</div>
      <p class="helppanel__hint" style="margin-top:8px">${entry.practice}</p>
    </div>
  `;
}

function initHelpPanel() {
  const panel = qs("#helppanel");
  if (!panel) return;

  qs("#btn-explain")?.addEventListener("click", () => {
    panel.hidden = false;
    renderFindings(panel, analyzeCode(getValue()));
    refitTerminal();
  });
  qs("#btn-close-help")?.addEventListener("click", () => {
    panel.hidden = true;
    refitTerminal();
  });

  onKeywordClick((entry) => {
    panel.hidden = false;
    renderDictionaryEntry(panel, entry);
    refitTerminal();
  });
}

/* ---------------------------------------------------------------------
 * Executar — Sprint 3: compilação real via JDoodle (compiler.js)
 * ------------------------------------------------------------------- */

function initRunButton() {
  const btn = qs("#btn-run");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    clearTerminal();
    writeLine("$ Compilando…");

    const language = qs("#status-language")?.textContent === "C++" ? "cpp" : "cpp";
    const result = await compileAndRun(getValue(), "", language);

    if (result.compileOutput) writeError(result.compileOutput);
    if (result.stdout) writeLine(result.stdout);
    if (result.stderr) writeError(result.stderr);

    if (result.exitCode === 0) {
      writeSuccess(`$ processo finalizado com sucesso (${result.statusDescription || "OK"})`);
    } else {
      writeError(`$ processo finalizado com erro (código ${result.exitCode})`);
    }
    btn.disabled = false;
  });
}

/** Ponto único de inicialização do "chrome" do shell (tudo que não é o
 *  workbench, iniciado à parte em initWorkbench após o Monaco carregar). */
export function initUI() {
  initThemeToggle();
  initEditorToolbar();
  const closeMissions = initMissionsDrawer();
  const closeSettings = initSettingsDrawer();
  initSharedOverlay([closeMissions, closeSettings]);
  initHelpPanel();
  initRunButton();
}
