# Roadmap — CodeLab EDU

Desenvolvimento dividido em sprints, cada um com entrega testável antes
de avançar para o próximo (decisão tomada para evitar um código gerado
de uma vez só, inconsistente entre módulos).

| # | Sprint | Status |
|---|--------|--------|
| 1 | Arquitetura e layout | ✅ Concluído |
| 2 | Editor Monaco + interface completa estilo VS Code | ⬜ Próximo |
| 3 | Terminal (xterm.js) + compilação real (C/C++ via API externa) | ⬜ |
| 4 | Sistema de aulas e exercícios | ⬜ |
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
- Sprint 6 precisa baixar os bundles do Monaco/xterm para servir local,
  já que CDN quebra o requisito de uso 100% offline em laboratório.
