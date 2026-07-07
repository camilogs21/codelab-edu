# tests/

Nenhum framework de testes automatizados ainda — o projeto não tem
build step (JS puro, sem bundler), então a decisão de qual framework
usar (ex.: Vitest com jsdom, Playwright para E2E) fica para quando
`compiler.js`/`lessons.js` tiverem lógica complexa o bastante para
justificar o setup. Por ora, checklist manual a rodar antes de cada
entrega de sprint:

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
