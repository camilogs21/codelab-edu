# Arquitetura — CodeLab EDU

## Estrutura de pastas

```
CodeLabEDU/
├── index.html
├── manifest.json        # stub — PWA real no Sprint 6
├── service-worker.js     # stub — não registrado ainda
├── assets/{icons,images,sounds}
├── css/…
├── js/…
├── data/{cpp,csharp,quizzes,projects}   # conteúdo pedagógico, não código
├── docs/…
└── tests/
```

## Convenção de CSS

Oito arquivos, cada um com uma responsabilidade única:

| Arquivo | Responsabilidade |
|---|---|
| `themes.css` | Só variáveis (cor, tipografia, espaçamento). Nunca uma regra de layout. |
| `main.css` | Reset e base tipográfica global. |
| `layout.css` | Posição/dimensão das **regiões** do shell (topbar, sidebar, workbench…). |
| `components.css` | Aparência de **widgets reutilizáveis** (botão, aba, card, chip, árvore de arquivos). |
| `editor.css` | Só o que é específico da feature de edição de código. |
| `terminal.css` | Só o que é específico da feature de terminal. |
| `dashboard.css` | Reservado para a visão de progresso completa (Sprint 5). |
| `animations.css` | Keyframes e transições centralizadas. |
| `responsive.css` | Breakpoints, prioridade Chromebook. |

Regra prática para decidir entre `layout.css` e `components.css`: se a
classe descreve uma região única da tela, é layout; se descreve um
padrão repetível, é componente.

## Convenção de JS

Módulos ES (`type="module"`), sem bundler no Sprint 1. Cada módulo expõe
uma interface pública mínima e estável — os sprints seguintes trocam a
implementação por dentro sem exigir mudanças em quem consome.

| Módulo | Contrato público estável |
|---|---|
| `editor.js` | `initEditor(theme)`, `getValue()`, `setValue(code)`, `onChange(fn)`, `focus()`, `openFile(file)`, `closeFile(id)`, `setTheme(theme)`, `zoomIn()/zoomOut()`, `toggleMinimap()`, `onKeywordClick(fn)` |
| `explorer.js` | `initExplorer(onOpenFile)`, `getFileById(id)`, `getAllFiles()`, `highlightFile(id)` |
| `terminal.js` | `initTerminal()`, `writeLine(text)`, `writeError(text)`, `writeSuccess(text)`, `clear()`, `refit()` |
| `compiler.js` | `compileAndRun(code, stdin, language) → {stdout, stderr, compileOutput, exitCode, statusDescription}` |
| `storage.js` | `get/set/remove`, `loadState()/saveState(state)` |
| `theme.js` | `initTheme()`, `toggleTheme()`, `applyTheme(theme)`, `getCurrentTheme()` |
| `gamification.js` | `initGamification()`, `grantXp(amount)` |
| `ai.js` | `analyzeCode(code) → Finding[]` |
| `lessons.js` | `getCurrentLesson()` (cresce no Sprint 4) |
| `projects.js` | `getAvailableProjects()` (cresce no sprint de Projetos) |
| `achievements.js` | `getUnlockedAchievements()`, `checkAchievement(event, payload)` |
| `config.js` | Constantes: `STORAGE_NAMESPACE`, `XP_PER_LEVEL`, `LANGUAGES`, `JUDGE0`, `EDITOR_DEFAULTS`, `TERMINAL_DEFAULTS` |

`getValue()/onChange()/focus()` mantiveram exatamente a assinatura do
Sprint 1 mesmo trocando textarea por Monaco por baixo — é o contrato
"pagando a dívida" que a arquitetura original previa.

`ui.js` ganhou o conceito de **workbench**: `initWorkbench()` orquestra
`explorer.js` (quais arquivos existem) + `editor.js` (o que está aberto),
incluindo o tabbar dinâmico. Só é chamado depois que `initEditor()`
(assíncrono — carrega via CDN) resolve, daí `app.js` virou `async`.

## `data/` não é código

Conteúdo pedagógico (enunciados, gabaritos, questões de quiz, specs de
projetos) fica em `data/`, versionado separadamente da lógica em `js/`.
Isso permite que o professor edite/adicione aulas sem tocar em código.
