/**
 * lessons.js
 * Sprint 1: módulo vazio, apenas com o contrato de dados que o Sprint 4
 * (Sistema de Aulas) vai preencher.
 *
 * Cada aula seguirá a estrutura pedida no briefing:
 *   { id, title, objective, explanation, example, exercise, challenge,
 *     project, quiz }
 *
 * `getCurrentLesson()` já é usado por gamification.js e pela status bar
 * (rótulo "Missão: ...") mesmo antes do sistema completo existir, para
 * que a integração do Sprint 4 não exija mudanças em quem já o consome.
 */

const PLACEHOLDER_LESSON = {
  id: "placeholder-01",
  title: "Estruturas condicionais em C++",
};

/** Retorna a aula atualmente ativa. Sprint 4 substitui pelo dado real
 *  vindo do progresso salvo do aluno. */
export function getCurrentLesson() {
  return PLACEHOLDER_LESSON;
}
