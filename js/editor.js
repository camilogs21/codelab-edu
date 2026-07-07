/**
 * editor.js
 * Sprint 2: Monaco Editor de verdade, substituindo o placeholder do
 * Sprint 1. A interface pública combinada abaixo é a mesma prometida em
 * docs/arquitetura.md — quem consome (`compiler.js`, `ai.js`, `ui.js`)
 * não precisou mudar uma linha por causa dessa troca.
 *
 * Arquitetura de modelos: cada arquivo aberto tem seu próprio
 * `monaco.editor.ITextModel`, criado sob demanda e reaproveitado ao
 * reabrir a aba — isso dá undo/redo e posição de scroll independentes
 * por arquivo, como no VS Code de verdade.
 */

import { qs } from "./utils.js";
import { get, set } from "./storage.js";
import { EDITOR_DEFAULTS } from "./config.js";

let monaco = null;
let editorInstance = null;
let currentFileId = null;
const modelsByFileId = new Map();
const changeListeners = [];
const keywordClickListeners = [];

/**
 * Dicionário contextual (clique numa palavra-chave no editor). Cobre só
 * o vocabulário que aparece nos arquivos de demonstração deste sprint —
 * o Sprint 4 substitui por um dicionário completo vindo de /data/.
 */
const DICTIONARY = {
  include: {
    label: "#include",
    definition: "Diretiva de pré-processador: importa uma biblioteca antes da compilação.",
    example: "#include <iostream>",
    practice: "Inclua só as bibliotecas que você realmente usa no arquivo.",
  },
  int: {
    label: "int",
    definition: "Tipo de dado para números inteiros (sem casas decimais).",
    example: "int idade = 18;",
    practice: 'Nunca atribua texto a uma variável int, como em int x = "18";.',
  },
  double: {
    label: "double",
    definition: "Tipo de dado para números com casas decimais (ponto flutuante).",
    example: "double altura = 1.72;",
    practice: "Use double para medidas, preços e médias.",
  },
  string: {
    label: "string",
    definition: "Tipo de dado para texto (cadeia de caracteres).",
    example: 'string nome = "Aluno";',
    practice: "Sempre coloque o valor entre aspas duplas.",
  },
  if: {
    label: "if",
    definition: "Executa um bloco de código somente se a condição for verdadeira.",
    example: "if (idade >= 18) { ... }",
    practice: "Cuidado para não confundir = (atribuição) com == (comparação).",
  },
  else: {
    label: "else",
    definition: "Define o que acontece quando a condição do if é falsa.",
    example: "if (...) { ... } else { ... }",
    practice: "Um else sempre pertence ao if mais próximo acima dele.",
  },
  for: {
    label: "for",
    definition: "Estrutura de repetição com contador: início, condição e incremento.",
    example: "for (int i = 0; i < 10; i++) { ... }",
    practice: "Use for quando já souber quantas vezes vai repetir.",
  },
  while: {
    label: "while",
    definition: "Estrutura de repetição que continua enquanto a condição for verdadeira.",
    example: "while (tentativas < 3) { ... }",
    practice: "Garanta que algo dentro do while eventualmente torne a condição falsa.",
  },
  cout: {
    label: "cout",
    definition: "Mostra informações na tela (saída padrão).",
    example: 'cout << "Ola, mundo!" << endl;',
    practice: "Encadeie vários valores com << na mesma linha.",
  },
  cin: {
    label: "cin",
    definition: "Lê um valor digitado pelo usuário (entrada padrão).",
    example: "cin >> idade;",
    practice: "A variável precisa ter o tipo compatível com o que o usuário vai digitar.",
  },
  endl: {
    label: "endl",
    definition: "Insere uma quebra de linha na saída.",
    example: 'cout << "linha 1" << endl;',
    practice: 'Equivale a "\\n", mas também força a saída a ser exibida imediatamente.',
  },
  return: {
    label: "return",
    definition: "Encerra a função e devolve um valor para quem a chamou.",
    example: "return 0;",
    practice: "Em main(), 0 convencionalmente significa 'terminou sem erro'.",
  },
  main: {
    label: "main()",
    definition: "Função especial: ponto de entrada do programa em C++.",
    example: "int main() { ... }",
    practice: "Todo programa em C++ precisa de exatamente uma função main().",
  },
};

/* ---------------------------------------------------------------------
 * Configuração do Monaco (loader AMD + temas customizados)
 * ------------------------------------------------------------------- */

/** Carrega o Monaco via require AMD (script já incluído no index.html). */
function loadMonaco() {
  return new Promise((resolve, reject) => {
    if (window.monaco) {
      resolve(window.monaco);
      return;
    }
    if (!window.require) {
      reject(new Error("Monaco loader (AMD require) não encontrado no index.html"));
      return;
    }
    window.require.config({
      paths: { vs: `https://cdn.jsdelivr.net/npm/monaco-editor@${EDITOR_DEFAULTS.cdnVersion}/min/vs` },
    });
    window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
  });
}

/**
 * Temas customizados que reaproveitam a paleta de css/themes.css
 * (cobre + navy). Os valores hex ficam duplicados aqui de propósito —
 * o Monaco não lê variáveis CSS, então isto precisa ser mantido em
 * sincronia manualmente com themes.css ao mudar a paleta.
 */
function defineCustomThemes() {
  monaco.editor.defineTheme("codelab-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7688", fontStyle: "italic" },
      { token: "keyword", foreground: "e2965a" },
      { token: "string", foreground: "7ee787" },
      { token: "number", foreground: "d2a8ff" },
      { token: "identifier", foreground: "e6edf3" },
    ],
    colors: {
      "editor.background": "#0d1017",
      "editor.foreground": "#e6edf3",
      "editorLineNumber.foreground": "#6b7688",
      "editorLineNumber.activeForeground": "#e2965a",
      "editorCursor.foreground": "#e2965a",
      "editor.selectionBackground": "#8a573055",
      "editorIndentGuide.background": "#1f2733",
    },
  });

  monaco.editor.defineTheme("codelab-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8a94a6", fontStyle: "italic" },
      { token: "keyword", foreground: "b8752f" },
      { token: "string", foreground: "1a7f37" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editorLineNumber.activeForeground": "#b8752f",
      "editorCursor.foreground": "#b8752f",
    },
  });
}

/* ---------------------------------------------------------------------
 * Modelos por arquivo
 * ------------------------------------------------------------------- */

function getFileEdits() {
  return get("fileEdits", {});
}

const persistEdit = (() => {
  let timeoutId = null;
  return (fileId, content) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const edits = getFileEdits();
      edits[fileId] = content;
      set("fileEdits", edits);
    }, 400);
  };
})();

/** Cria (ou reaproveita) o modelo de um arquivo. Aplica edições salvas
 *  do aluno por cima do conteúdo original, se existirem. */
function getOrCreateModel(file) {
  if (modelsByFileId.has(file.id)) return modelsByFileId.get(file.id);

  const savedEdits = getFileEdits();
  const initialContent = savedEdits[file.id] ?? file.content;
  const model = monaco.editor.createModel(initialContent, file.language);
  modelsByFileId.set(file.id, model);
  return model;
}

/* ---------------------------------------------------------------------
 * Zoom (fonte)
 * ------------------------------------------------------------------- */

function applyFontSize(px) {
  const clamped = Math.min(Math.max(px, EDITOR_DEFAULTS.minFontSize), EDITOR_DEFAULTS.maxFontSize);
  editorInstance.updateOptions({ fontSize: clamped });
  const label = qs("#zoom-label");
  if (label) label.textContent = `${clamped}px`;
  const state = get("state", {});
  set("state", { ...state, settings: { ...(state.settings || {}), fontSize: clamped } });
  return clamped;
}

export function zoomIn() {
  return applyFontSize(editorInstance.getOption(monaco.editor.EditorOption.fontSize) + 1);
}

export function zoomOut() {
  return applyFontSize(editorInstance.getOption(monaco.editor.EditorOption.fontSize) - 1);
}

export function toggleMinimap() {
  const current = editorInstance.getOption(monaco.editor.EditorOption.minimap).enabled;
  editorInstance.updateOptions({ minimap: { enabled: !current } });
  return !current;
}

/* ---------------------------------------------------------------------
 * Inicialização
 * ------------------------------------------------------------------- */

/**
 * Monta o Monaco Editor no container. Assíncrono porque o Monaco carrega
 * via CDN — `app.js` aguarda essa Promise antes de liberar o resto da UI
 * que depende do editor.
 * @param {"dark"|"light"} initialTheme
 */
export async function initEditor(initialTheme = "dark") {
  monaco = await loadMonaco();
  defineCustomThemes();

  const state = get("state", {});
  const fontSize = state?.settings?.fontSize ?? EDITOR_DEFAULTS.fontSize;

  editorInstance = monaco.editor.create(qs("#monaco-container"), {
    value: "",
    language: EDITOR_DEFAULTS.defaultLanguage,
    theme: initialTheme === "dark" ? "codelab-dark" : "codelab-light",
    fontSize,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    automaticLayout: true,
    minimap: { enabled: EDITOR_DEFAULTS.minimapEnabled },
    bracketPairColorization: { enabled: true },
    autoIndent: "full",
    tabSize: 4,
    scrollBeyondLastLine: false,
    renderLineHighlight: "all",
  });

  applyFontSize(fontSize);

  editorInstance.onDidChangeModelContent(() => {
    const value = editorInstance.getValue();
    if (currentFileId) persistEdit(currentFileId, value);
    changeListeners.forEach((fn) => fn(value));
  });

  editorInstance.onDidChangeCursorPosition((event) => {
    const statusEl = qs("#status-cursor");
    if (statusEl) statusEl.textContent = `Ln ${event.position.lineNumber}, Col ${event.position.column}`;
  });

  editorInstance.onMouseDown((event) => {
    // Só reage a cliques dentro do texto do editor, não na margem/gutter.
    if (event.target.type !== monaco.editor.MouseTargetType.CONTENT_TEXT) return;
    const model = editorInstance.getModel();
    const word = model?.getWordAtPosition(event.target.position);
    if (!word) return;
    const entry = DICTIONARY[word.word.toLowerCase()];
    if (entry) keywordClickListeners.forEach((fn) => fn(entry));
  });
}

/** Abre um arquivo no editor (cria o modelo se ainda não existir). */
export function openFile(file) {
  const model = getOrCreateModel(file);
  editorInstance.setModel(model);
  currentFileId = file.id;

  const langEl = qs("#status-language");
  if (langEl) langEl.textContent = file.language === "cpp" ? "C++" : file.language;
}

/** Fecha um arquivo: descarta o modelo (perde undo/redo, mantém o
 *  conteúdo salvo em `fileEdits`, então reabrir não perde texto). */
export function closeFile(fileId) {
  const model = modelsByFileId.get(fileId);
  if (model) {
    model.dispose();
    modelsByFileId.delete(fileId);
  }
  if (currentFileId === fileId) currentFileId = null;
}

/* ---------------------------------------------------------------------
 * Interface pública estável (mesmo contrato do Sprint 1)
 * ------------------------------------------------------------------- */

export function getValue() {
  return editorInstance ? editorInstance.getValue() : "";
}

export function setValue(code) {
  editorInstance?.getModel()?.setValue(code);
}

export function onChange(fn) {
  changeListeners.push(fn);
}

export function focus() {
  editorInstance?.focus();
}

/** Aplica o tema visual do Monaco (chamado pelo theme.js/ui.js quando o
 *  aluno alterna dark/light no topbar). */
export function setTheme(themeName) {
  if (!monaco) return;
  monaco.editor.setTheme(themeName === "dark" ? "codelab-dark" : "codelab-light");
}

/** Registra um callback chamado quando o aluno clica numa palavra do
 *  dicionário. `ui.js` usa isso para preencher o painel de ajuda. */
export function onKeywordClick(fn) {
  keywordClickListeners.push(fn);
}
