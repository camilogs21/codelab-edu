# CodeLab EDU — Sprint 3: Terminal Real + Compilação Judge0

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

**Importante:** Monaco e xterm.js carregam via CDN — **é preciso ter
internet**. E, a partir deste sprint, **compilar/executar código também
precisa de uma chave de API do Judge0** (grátis, ver seção abaixo).

## Configurando a compilação real (Judge0)

1. Crie uma conta gratuita em [rapidapi.com](https://rapidapi.com) e
   assine o plano **Basic (grátis)** de
   [Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce).
2. Copie sua chave de API (`X-RapidAPI-Key`).
3. Na plataforma, clique no ícone de engrenagem (⚙) na barra lateral
   esquerda, cole a chave no painel de Configurações e clique em Salvar.
4. Pronto — o botão "Executar" já compila e roda C/C++ de verdade.

⚠️ **Trade-off de segurança aceito neste sprint:** a chave fica salva só
no `localStorage` do seu navegador — nunca é commitada no repositório.
Isso é seguro para um professor testando sozinho, mas **não** para
distribuir a mesma chave entre várias turmas (qualquer aluno com DevTools
consegue ler). Detalhes completos e o plano para resolver isso (proxy
serverless) estão em `docs/api.md`.

## O que este Sprint entrega

- **Terminal real com xterm.js**: cores ANSI (verde/vermelho), scroll,
  redimensionamento automático, botão de limpar.
- **Compilação/execução real de C/C++** via Judge0 CE (RapidAPI):
  `compileAndRun` deixou de ser uma simulação e agora faz uma chamada
  HTTP de verdade, decodifica a saída em base64 e trata erros comuns
  (chave ausente/inválida, limite de requisições, timeout, sem internet).
- **Painel de Configurações**: novo drawer para colar a chave de API,
  reaproveitando o mesmo componente visual do drawer de Missões.
- Tudo dos sprints anteriores continua funcionando (Monaco, workbench,
  dicionário contextual, tema, XP, missões, responsividade, acessibilidade).

## O que é placeholder proposital (será substituído nos próximos sprints)

| Módulo         | Hoje (Sprint 3)                          | Sprint que substitui |
|----------------|-------------------------------------------|-----------------------|
| `lessons.js`   | Uma aula fake, só o contrato de dados      | Sprint 4 — Sistema de Aulas completo |
| `achievements.js` | Funções vazias, só o contrato           | Sprint 5 — Gamificação completa |
| Chave de API no localStorage | Funciona, mas não escala para várias turmas | Quando um backend/proxy existir |

A interface pública de cada módulo continua estável desde o Sprint 1 —
os sprints seguintes trocam a implementação por dentro, não o contrato.

## Decisões de arquitetura confirmadas com o professor

- **Linguagem prioritária do MVP:** C/C++, compilado via Judge0 CE
  (RapidAPI). Execução de código depende de internet.
- **Monaco e xterm.js via CDN:** versões fixadas em `js/config.js`
  (`EDITOR_DEFAULTS`/`TERMINAL_DEFAULTS`). Atualizar lá e nas tags
  `<script>`/`<link>` de `index.html` juntas.
- **Judge0 CE, `language_id` 54 (C++) e 50 (C)**, GCC 9.2.0.

## Paleta e identidade visual

Reaproveitei a estética "circuito impresso" (navy profundo + cobre) que já
aparece nos seus outros materiais didáticos, agora aplicada como uma
identidade de IDE profissional — ver tokens em `css/themes.css` e os
temas do Monaco em `js/editor.js` (`defineCustomThemes`).
