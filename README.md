# CodeLab EDU — Sprint 1: Arquitetura e Layout

IDE educacional para o Curso Técnico em Informática, inspirada em VS Code / Replit / Cursor.
HTML5 + CSS3 + JavaScript puro (ES Modules), sem frameworks.

## Como rodar

Como o JS usa `type="module"`, o navegador bloqueia `import` via `file://`.
É preciso servir por HTTP local:

```bash
cd codelab-edu
python3 -m http.server 8080
# depois abra http://localhost:8080
```

Ou use a extensão "Live Server" do VS Code.

## O que este Sprint entrega

- Estrutura de pastas modular (`/css`, `/js`) conforme o briefing.
- Shell completo estilo VS Code: topbar, activity bar, sidebar/explorer,
  tabbar, editor (placeholder), terminal (placeholder), status bar,
  drawer de missões/XP, painel de ajuda.
- Sistema de temas (dark/light) com variáveis CSS centralizadas em `themes.css`.
- Persistência em `localStorage` via `storage.js` (tema, XP, nível, streak, último código).
- Árvore de arquivos (Explorer) navegável de verdade (expandir/selecionar).
- Responsividade com prioridade em telas de Chromebook (1366×768 / 1280×800).
- Acessibilidade básica: skip link, foco visível, ARIA em botões e árvore.

## O que é placeholder proposital (será substituído nos próximos sprints)

| Módulo         | Hoje (Sprint 1)                         | Sprint que substitui |
|----------------|------------------------------------------|-----------------------|
| `editor.js`    | `<textarea>` + gutter simulando linhas    | Sprint 2 — Monaco Editor |
| `terminal.js`  | `<div>` estilizado como terminal          | Sprint 3 — xterm.js |
| `compiler.js`  | Simulação local (`setTimeout`), sem rede  | Sprint 3 — API externa (Judge0/JDoodle) de C/C++ |
| `lessons.js`   | Uma aula fake, só o contrato de dados     | Sprint 4 — Sistema de Aulas completo |
| `achievements.js` | Funções vazias, só o contrato          | Sprint 5 — Gamificação completa |

A interface pública de cada módulo (`getValue/setValue`, `writeLine/clear`,
`compileAndRun`, etc.) já é a definitiva — os sprints seguintes trocam a
implementação por dentro, não o contrato, então nenhum outro módulo
precisará ser reescrito quando isso acontecer.

## Decisão de arquitetura confirmada com o professor

- **Linguagem prioritária do MVP:** C/C++, compilado via API externa.
  Isso significa que a execução de código **depende de internet**, mesmo
  depois que o PWA (Sprint 6) cachear o resto da plataforma para uso offline.
  Vale alinhar com a escola se o laboratório tem conexão estável nos horários de aula.
- **Chave de API:** nunca vai para o front-end. O Sprint 3 já nasce com um
  proxy leve (função serverless) entre a IDE e a API de compilação.

## Paleta e identidade visual

Reaproveitei a estética "circuito impresso" (navy profundo + cobre) que já
aparece nos seus outros materiais didáticos, agora aplicada como uma
identidade de IDE profissional — ver tokens em `css/themes.css`.
