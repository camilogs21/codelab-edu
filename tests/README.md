# tests/

Nenhum framework de testes automatizados ainda — o projeto não tem
build step (JS puro, sem bundler), então a decisão de qual framework
usar (ex.: Vitest com jsdom, Playwright para E2E) fica para quando
`compiler.js`/`lessons.js` tiverem lógica complexa o bastante para
justificar o setup. Por ora, checklist manual a rodar antes de cada
entrega de sprint:

## Checklist do Sprint 3

- [ ] Abrir Configurações (engrenagem), colar Client ID + Client Secret válidos do JDoodle e salvar
- [ ] Recarregar a página — as credenciais continuam salvas (persistidas)
- [ ] Clicar em "Executar" sem credenciais configuradas → mensagem clara pedindo pra configurar, sem travar a UI
- [ ] Clicar em "Executar" com um `cout << "ola" << endl;` → saída aparece em verde no terminal
- [ ] Rodar um código com erro de sintaxe proposital → erro de compilação aparece em vermelho
- [ ] Testar com credenciais inválidas → mensagem específica de credenciais inválidas (não uma tela em branco)
- [ ] Limpar terminal (ícone de lixeira) funciona
- [ ] Terminal se redimensiona corretamente ao abrir/fechar o painel de ajuda
- [ ] Sem internet (modo avião) → mensagem de falha de conexão, não trava o botão "Executar"

## Checklist do Sprint 2

- [ ] Monaco Editor carrega (precisa de internet — é via CDN)
- [ ] Syntax highlight de C++ aparece corretamente
- [ ] Clicar em cada arquivo da árvore abre o conteúdo certo no editor
- [ ] Abrir 2-3 arquivos gera abas reais; fechar uma aba funciona
- [ ] Fechar a aba ativa troca para a aba anterior corretamente
- [ ] Expandir/colapsar a pasta "projetos" esconde/mostra os arquivos de verdade
- [ ] Editar código, trocar de aba, voltar — edição não foi perdida
- [ ] Recarregar a página — a última edição de cada arquivo persiste
- [ ] Alternar tema dark/light também muda o tema do Monaco
- [ ] Zoom + / Zoom - mudam o tamanho da fonte e persistem ao recarregar
- [ ] Alternar minimapa liga/desliga de verdade
- [ ] Clicar em `int`, `if`, `cout` no código abre o dicionário certo no painel de ajuda
- [ ] "Explicar código" com `int idade = "18";` ainda funciona (ai.js do Sprint 1 intacto)

## Checklist do Sprint 1

- [ ] `python3 -m http.server` + abrir no navegador sem erros no console
- [ ] Alternar tema dark/light e recarregar a página (deve persistir)
- [ ] Expandir/colapsar pastas no Explorer
- [ ] Selecionar um arquivo diferente na árvore
- [ ] Digitar no editor e ver o gutter de linhas acompanhar
- [ ] Recarregar a página e ver o código digitado persistido
- [ ] Clicar em "Executar" e ver a resposta simulada no terminal
- [ ] Clicar em "Explicar código" com `int idade = "18";` no editor e ver o finding aparecer
- [ ] Abrir e fechar o drawer de Missões (botão, X, clique fora, Esc)
- [ ] Redimensionar a janela até a largura de um Chromebook (1366×768) sem quebra de layout
- [ ] Navegar pela interface só com Tab/Shift+Tab (foco sempre visível)

## Quando isso vira teste automatizado

A partir do Sprint 3 (compilação real) faz sentido introduzir testes de
integração para `compiler.js` (mockando a API externa) e, a partir do
Sprint 4, testes de unidade para as regras de `lessons.js`/`ai.js`.
