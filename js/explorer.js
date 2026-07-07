/**
 * explorer.js
 * Sprint 2: deixa de operar sobre markup estático — agora é a fonte de
 * verdade dos arquivos do "workspace" (dados em memória) e renderiza a
 * árvore a partir deles. `initExplorer(onOpenFile)` recebe um callback
 * chamado sempre que o aluno seleciona um arquivo; quem decide o que
 * fazer com isso (abrir no Monaco, criar aba) é o ui.js.
 *
 * Sprint 4 troca `FILES` por dados vindos de `data/cpp/*.json` (aulas
 * reais) sem mudar a interface pública deste módulo.
 */

import { qs } from "./utils.js";

/**
 * Estrutura em árvore: pastas têm `children`, arquivos têm `content`.
 * `language` usa os ids do Monaco (cpp, csharp, python...) para já bater
 * com o mapeamento de config.js quando o Sprint 3 ligar a compilação real.
 */
const FILES = [
  {
    type: "folder",
    name: "aulas",
    open: true,
    children: [
      {
        type: "file",
        id: "aula-01",
        name: "01-introducao.cpp",
        language: "cpp",
        content: `#include <iostream>
using namespace std;

// Aula 01 — primeiro programa em C++
int main() {
    cout << "Ola, mundo!" << endl;
    return 0;
}
`,
      },
      {
        type: "file",
        id: "aula-02",
        name: "02-variaveis.cpp",
        language: "cpp",
        content: `#include <iostream>
using namespace std;

int main() {
    int idade = 16;
    double altura = 1.72;
    string nome = "Aluno";

    cout << nome << " tem " << idade << " anos." << endl;
    return 0;
}
`,
      },
      {
        type: "file",
        id: "aula-03",
        name: "03-condicionais.cpp",
        language: "cpp",
        content: `#include <iostream>
using namespace std;

int main() {
    int idade = 18;
    if (idade >= 18) {
        cout << "Maior de idade" << endl;
    } else {
        cout << "Menor de idade" << endl;
    }
    return 0;
}
`,
      },
    ],
  },
  {
    type: "folder",
    name: "projetos",
    open: false,
    children: [
      {
        type: "file",
        id: "proj-calculadora",
        name: "calculadora.cpp",
        language: "cpp",
        content: `#include <iostream>
using namespace std;

int main() {
    double a, b;
    char op;

    cout << "Digite: numero operador numero (ex: 4 + 2)" << endl;
    cin >> a >> op >> b;

    switch (op) {
        case '+': cout << a + b << endl; break;
        case '-': cout << a - b << endl; break;
        case '*': cout << a * b << endl; break;
        case '/': cout << a / b << endl; break;
        default: cout << "Operador invalido" << endl;
    }
    return 0;
}
`,
      },
      {
        type: "file",
        id: "proj-forca",
        name: "jogo-da-forca.cpp",
        language: "cpp",
        content: `#include <iostream>
using namespace std;

int main() {
    // TODO: implementar o Jogo da Forca (projeto guiado — Sprint 4/Projetos)
    cout << "Jogo da Forca — em construcao" << endl;
    return 0;
}
`,
      },
    ],
  },
  {
    type: "file",
    id: "main-cpp",
    name: "main.cpp",
    language: "cpp",
    content: `#include <iostream>
using namespace std;

int main() {
    cout << "CodeLab EDU" << endl;
    return 0;
}
`,
  },
];

const ID_ABERTO_POR_PADRAO = "aula-03";

/** Ícone de arquivo, hoje só emoji — Sprint 5+ pode trocar por SVG por linguagem. */
function fileIcon() {
  return "📄";
}

/** Constrói recursivamente os <li> da árvore a partir dos dados. */
function buildTreeNodes(nodes) {
  const ul = document.createElement("ul");
  nodes.forEach((node) => {
    const li = document.createElement("li");
    li.setAttribute("role", "treeitem");

    if (node.type === "folder") {
      li.className = `filetree__folder${node.open ? " is-open" : ""}`;
      li.innerHTML = `<span class="filetree__icon">📁</span> ${node.name}`;
      li.appendChild(buildTreeNodes(node.children));
    } else {
      li.className = "filetree__file";
      li.dataset.fileId = node.id;
      li.innerHTML = `<span class="filetree__icon">${fileIcon()}</span> ${node.name}`;
    }
    ul.appendChild(li);
  });
  return ul;
}

/** Acha um arquivo pelo id, buscando recursivamente na árvore. */
export function getFileById(id) {
  function search(nodes) {
    for (const node of nodes) {
      if (node.type === "file" && node.id === id) return node;
      if (node.type === "folder") {
        const found = search(node.children);
        if (found) return found;
      }
    }
    return null;
  }
  return search(FILES);
}

/** Retorna todos os arquivos (achatado, sem pastas) — usado por ui.js
 *  para abrir o arquivo padrão ao iniciar a plataforma. */
export function getAllFiles() {
  const flat = [];
  function walk(nodes) {
    nodes.forEach((node) => {
      if (node.type === "file") flat.push(node);
      else walk(node.children);
    });
  }
  walk(FILES);
  return flat;
}

function toggleFolder(folderEl) {
  folderEl.classList.toggle("is-open");
}

function setActiveFile(fileId, tree) {
  tree.querySelectorAll(".filetree__file.is-active").forEach((el) => el.classList.remove("is-active"));
  const target = tree.querySelector(`.filetree__file[data-file-id="${fileId}"]`);
  target?.classList.add("is-active");
}

/**
 * Renderiza a árvore e liga os cliques ao callback `onOpenFile(file)`.
 * Retorna o id do arquivo aberto por padrão, para quem chamar já poder
 * abri-lo no editor.
 */
export function initExplorer(onOpenFile) {
  const tree = qs("#explorer-tree");
  if (!tree) return ID_ABERTO_POR_PADRAO;

  tree.replaceChildren(...buildTreeNodes(FILES).children);
  setActiveFile(ID_ABERTO_POR_PADRAO, tree);

  tree.addEventListener("click", (event) => {
    const fileEl = event.target.closest(".filetree__file");
    const folderEl = event.target.closest(".filetree__folder");

    if (fileEl) {
      setActiveFile(fileEl.dataset.fileId, tree);
      const file = getFileById(fileEl.dataset.fileId);
      if (file) onOpenFile(file);
      return;
    }
    if (folderEl) {
      toggleFolder(folderEl);
    }
  });

  return ID_ABERTO_POR_PADRAO;
}

/** Usado por ui.js para destacar o arquivo certo na árvore quando o
 *  aluno troca de aba (sem passar pelo clique na árvore). */
export function highlightFile(fileId) {
  const tree = qs("#explorer-tree");
  if (tree) setActiveFile(fileId, tree);
}
