/**
 * explorer.js
 * Comportamento da árvore de arquivos na sidebar (Explorer).
 *
 * Sprint 1: opera sobre o markup estático em index.html (dados fake).
 * Sprint 2+: passa a ler a lista de arquivos de `storage.js` e a abrir
 * o conteúdo real no Monaco Editor via `editor.js` — a função
 * `onFileSelect` abaixo é o ponto de extensão para isso.
 */

import { qs, qsa } from "./utils.js";

/** Callback chamado quando um arquivo é selecionado na árvore. Sprint 2 vai
 *  substituir o `console.info` por uma chamada real a `editor.js`. */
function onFileSelect(fileLabel) {
  console.info(`[explorer] Arquivo selecionado: ${fileLabel.trim()}`);
}

/** Alterna a pasta entre aberta/fechada. */
function toggleFolder(folderEl) {
  folderEl.classList.toggle("is-open");
}

/** Marca visualmente um único arquivo como ativo na árvore inteira. */
function setActiveFile(fileEl, tree) {
  qsa(".filetree__file.is-active", tree).forEach((el) => el.classList.remove("is-active"));
  fileEl.classList.add("is-active");
}

export function initExplorer() {
  const tree = qs("#explorer-tree");
  if (!tree) return;

  tree.addEventListener("click", (event) => {
    const folder = event.target.closest(".filetree__folder");
    const file = event.target.closest(".filetree__file");

    // Se o clique caiu num arquivo dentro de uma pasta, prioriza o arquivo.
    if (file) {
      setActiveFile(file, tree);
      onFileSelect(file.textContent);
      return;
    }
    if (folder) {
      toggleFolder(folder);
    }
  });
}
