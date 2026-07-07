/**
 * terminal.js
 * Sprint 3: terminal real com xterm.js, substituindo o placeholder
 * estático do Sprint 1. Mantém o mesmo contrato público
 * (`writeLine/writeError/clear`) que `ui.js` e `compiler.js` já usavam —
 * só a implementação por dentro mudou.
 */

import { qs } from "./utils.js";

let term = null;
let fitAddon = null;

// Cores ANSI (sequências de escape) usadas pelas funções de escrita.
const ANSI = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
};

/** Inicializa o xterm.js no container e o mantém redimensionado junto
 *  com o painel. Chamado uma única vez pelo app.js. */
export function initTerminal() {
  const container = qs("#terminal-body");
  if (!container || !window.Terminal) return;

  term = new window.Terminal({
    convertEol: true,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 13,
    theme: {
      background: "#0d1017",
      foreground: "#e6edf3",
      cursor: "#e2965a",
      selectionBackground: "#8a573055",
    },
    scrollback: 2000,
    disableStdin: true, // Sprint 3: sem stdin interativo ainda (ver roadmap)
  });

  fitAddon = new window.FitAddon.FitAddon();
  term.loadAddon(fitAddon);
  term.open(container);
  fitAddon.fit();

  writeLine(`${ANSI.gray}CodeLab EDU — terminal pronto.${ANSI.reset}`);
  writeLine(`${ANSI.gray}Compilação real via JDoodle. Configure suas credenciais em Configurações.${ANSI.reset}`);

  // Reajusta o terminal sempre que a janela (ou o painel) mudar de tamanho.
  window.addEventListener("resize", () => fitAddon?.fit());

  qs("#btn-clear-terminal")?.addEventListener("click", clear);
}

/** Escreve uma linha comum no terminal. */
export function writeLine(text) {
  term?.writeln(text);
}

/** Escreve uma linha de erro (vermelho). */
export function writeError(text) {
  term?.writeln(`${ANSI.red}${text}${ANSI.reset}`);
}

/** Escreve uma linha de sucesso (verde) — usado pelo fluxo de execução. */
export function writeSuccess(text) {
  term?.writeln(`${ANSI.green}${text}${ANSI.reset}`);
}

/** Limpa todo o conteúdo do terminal. */
export function clear() {
  term?.clear();
}

/** Reajusta o terminal ao tamanho atual do container. Útil depois de
 *  abrir/fechar painéis vizinhos (ex.: painel de ajuda) que mudam o
 *  espaço disponível. */
export function refit() {
  fitAddon?.fit();
}
