# Roadmap — CodeLab EDU

Desenvolvimento dividido em sprints, cada um com entrega testável antes
de avançar para o próximo (decisão tomada para evitar um código gerado
de uma vez só, inconsistente entre módulos).

| # | Sprint | Status |
|---|--------|--------|
| 1 | Arquitetura e layout | ✅ Concluído |
| 2 | Editor Monaco + interface completa estilo VS Code | ✅ Concluído |
| 3 | Terminal (xterm.js) + compilação real (C/C++ via API externa) | ✅ Concluído |
| 4 | Sistema de aulas e exercícios | ⬜ Próximo |
| 5 | Gamificação completa (XP, níveis, conquistas, ranking, dashboard) | ⬜ |
| 6 | PWA e modo offline | ⬜ |
| 7 | Painel do professor | ⬜ |
| 8 | Integração com IA (análise de código real) | ⬜ |

## Decisões já travadas (não reabrir sem motivo forte)

- **Linguagem prioritária do MVP:** C/C++, via API externa de compilação.
  Implica dependência de internet mesmo com o PWA instalado.
- **Sem frameworks:** HTML5 + CSS3 + JS puro (ES Modules), por decisão
  explícita do briefing.
- **Estrutura de pastas:** ver `docs/arquitetura.md`.

## Sinalizadores de risco para os próximos sprints

- Sprint 3 depende de decidir o provedor da API de compilação (Judge0,
  JDoodle ou similar) e montar o proxy que esconde a chave de API.
  **Confirmado no Sprint 3:** começou como Judge0 CE via RapidAPI, mas
  trocou para **JDoodle** — o Judge0 no RapidAPI exige cartão de crédito
  mesmo no plano gratuito (política deles pra APIs "freemium"), e o
  professor preferiu evitar isso. O JDoodle dá 200 execuções grátis por
  dia sem cartão. O proxy que esconde as credenciais ainda NÃO existe —
  elas ficam no `localStorage` do professor (ver docs/api.md). Isso
  precisa virar prioridade antes de usar com turmas reais em produção.
- Sprint 6 precisa baixar os bundles do Monaco/xterm para servir local,
  já que CDN quebra o requisito de uso 100% offline em laboratório.
  **Confirmado no Sprint 2:** o Monaco está sendo servido via
  `cdn.jsdelivr.net` (versão fixada em `js/config.js`, `EDITOR_DEFAULTS.cdnVersion`) —
  sem internet, o editor não carrega. Isso é aceitável agora, mas é
  exatamente o problema que o Sprint 6 precisa resolver.
  **Confirmado no Sprint 3:** o mesmo vale para o xterm.js
  (`TERMINAL_DEFAULTS` em `js/config.js`).
