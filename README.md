# CodeLab EDU — Sprint 2: Monaco Editor + Workbench

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

Ou use a extensão "Live Server" do VS Code, ou abra num GitHub Codespace.

**Importante desde este sprint:** o Monaco Editor carrega via CDN
(`cdn.jsdelivr.net`) — **é preciso ter internet** pra plataforma abrir
corretamente. Isso é aceitável por enquanto; o Sprint 6 (PWA) resolve
isso baixando os arquivos do Monaco pra servir localmente.

## O que este Sprint entrega

- **Monaco Editor de verdade**, substituindo o textarea do Sprint 1:
  syntax highlight de C++, autocomplete, bracket pair colorization,
  números de linha, indentação automática, minimapa, zoom de fonte.
- **Workbench real**: clicar num arquivo na árvore abre ele numa aba de
  verdade; cada arquivo tem seu próprio modelo (undo/redo independente);
  fechar aba funciona; a última edição de cada arquivo é salva sozinha.
- **Dois temas do Monaco** (`codelab-dark`/`codelab-light`) usando a
  mesma paleta cobre+navy do resto da plataforma, sincronizados com o
  botão de tema do topbar.
- **Dicionário contextual de verdade**: clicar numa palavra-chave
  reconhecida (`int`, `if`, `cout`, `for`...) no código abre definição,
  exemplo e boa prática no painel de ajuda.
- Correção de um bug do Sprint 1: pastas fechadas na árvore agora
  realmente escondem os arquivos dentro delas.
- Tudo do Sprint 1 continua funcionando (tema, XP, missões, "Explicar
  código", responsividade, acessibilidade).

## O que é placeholder proposital (será substituído nos próximos sprints)

| Módulo         | Hoje (Sprint 2)                          | Sprint que substitui |
|----------------|-------------------------------------------|-----------------------|
| `terminal.js`  | `<div>` estilizado como terminal           | Sprint 3 — xterm.js |
| `compiler.js`  | Simulação local (`setTimeout`), sem rede   | Sprint 3 — API externa (Judge0/JDoodle) de C/C++ |
| `lessons.js`   | Uma aula fake, só o contrato de dados      | Sprint 4 — Sistema de Aulas completo |
| `achievements.js` | Funções vazias, só o contrato           | Sprint 5 — Gamificação completa |

A interface pública de cada módulo (`getValue/setValue`, `writeLine/clear`,
`compileAndRun`, etc.) já é a definitiva — os sprints seguintes trocam a
implementação por dentro, não o contrato. O `editor.js` deste sprint é a
prova disso: trocou textarea por Monaco por baixo e `ui.js`/`compiler.js`/
`ai.js` não precisaram mudar uma linha.

## Decisão de arquitetura confirmada com o professor

- **Linguagem prioritária do MVP:** C/C++, compilado via API externa.
  Isso significa que a execução de código **depende de internet**, mesmo
  depois que o PWA (Sprint 6) cachear o resto da plataforma para uso offline.
  Vale alinhar com a escola se o laboratório tem conexão estável nos horários de aula.
- **Chave de API:** nunca vai para o front-end. O Sprint 3 já nasce com um
  proxy leve (função serverless) entre a IDE e a API de compilação.
- **Monaco via CDN (Sprint 2):** versão fixada em `js/config.js`
  (`EDITOR_DEFAULTS.cdnVersion`). Se atualizar, atualize também a tag
  `<script>` do loader em `index.html`.

## Paleta e identidade visual

Reaproveitei a estética "circuito impresso" (navy profundo + cobre) que já
aparece nos seus outros materiais didáticos, agora aplicada como uma
identidade de IDE profissional — ver tokens em `css/themes.css` e os
temas do Monaco em `js/editor.js` (`defineCustomThemes`).
