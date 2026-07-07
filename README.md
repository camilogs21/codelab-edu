# CodeLab EDU — Sprint 3: Terminal Real + Compilação JDoodle

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
precisa de credenciais de API do JDoodle** (grátis, sem cartão, ver
seção abaixo).

## Configurando a compilação real (JDoodle)

1. Crie uma conta gratuita em [jdoodle.com/compiler-api](https://www.jdoodle.com/compiler-api)
   (só e-mail, **sem cartão de crédito**). O plano gratuito dá 200
   execuções por dia.
2. No seu painel do JDoodle, copie o **Client ID** e o **Client Secret**.
3. Na plataforma, clique no ícone de engrenagem (⚙) na barra lateral
   esquerda, cole as duas credenciais no painel de Configurações e
   clique em Salvar.
4. Pronto — o botão "Executar" já compila e roda C/C++ de verdade.

⚠️ **Trade-off de segurança aceito neste sprint:** as credenciais ficam
salvas só no `localStorage` do seu navegador — nunca são commitadas no
repositório. Isso é seguro para um professor testando sozinho, mas
**não** para distribuir as mesmas credenciais entre várias turmas
(qualquer aluno com DevTools consegue ler, e o limite de 200/dia é
compartilhado). Detalhes completos e o plano para resolver isso (proxy
serverless) estão em `docs/api.md`.

## O que este Sprint entrega

- **Terminal real com xterm.js**: cores ANSI (verde/vermelho), scroll,
  redimensionamento automático, botão de limpar.
- **Compilação/execução real de C/C++** via JDoodle:
  `compileAndRun` deixou de ser uma simulação e agora faz uma chamada
  HTTP de verdade e trata erros comuns (credenciais ausentes/inválidas,
  limite diário de 200 execuções, timeout, sem internet).
- **Painel de Configurações**: novo drawer para colar o Client ID/Secret
  do JDoodle, reaproveitando o mesmo componente visual do drawer de Missões.
- Tudo dos sprints anteriores continua funcionando (Monaco, workbench,
  dicionário contextual, tema, XP, missões, responsividade, acessibilidade).

## O que é placeholder proposital (será substituído nos próximos sprints)

| Módulo         | Hoje (Sprint 3)                          | Sprint que substitui |
|----------------|-------------------------------------------|-----------------------|
| `lessons.js`   | Uma aula fake, só o contrato de dados      | Sprint 4 — Sistema de Aulas completo |
| `achievements.js` | Funções vazias, só o contrato           | Sprint 5 — Gamificação completa |
| Credenciais de API no localStorage | Funciona, mas não escala para várias turmas | Quando um backend/proxy existir |

A interface pública de cada módulo continua estável desde o Sprint 1 —
os sprints seguintes trocam a implementação por dentro, não o contrato.

## Decisões de arquitetura confirmadas com o professor

- **Linguagem prioritária do MVP:** C/C++, compilado via JDoodle.
  Execução de código depende de internet.
- **Monaco e xterm.js via CDN:** versões fixadas em `js/config.js`
  (`EDITOR_DEFAULTS`/`TERMINAL_DEFAULTS`). Atualizar lá e nas tags
  `<script>`/`<link>` de `index.html` juntas.
- **JDoodle, `language` "c"/"cpp"**, versionIndex "7" (GCC 15.2.1).

## Paleta e identidade visual

Reaproveitei a estética "circuito impresso" (navy profundo + cobre) que já
aparece nos seus outros materiais didáticos, agora aplicada como uma
identidade de IDE profissional — ver tokens em `css/themes.css` e os
temas do Monaco em `js/editor.js` (`defineCustomThemes`).
