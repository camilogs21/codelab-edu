/**
 * gamification.js
 * Sprint 1: liga o estado salvo (XP, nível, streak) aos elementos visuais
 * já presentes no shell (chip do topbar, status bar, drawer de missões).
 * Sprint 5 adiciona as regras completas: ganho de XP por exercício,
 * cálculo de nível, conquistas desbloqueáveis, moedas e ranking — tudo
 * consumindo as mesmas funções `render*` abaixo, sem trocar a UI.
 */

import { qs } from "./utils.js";
import { loadState, saveState } from "./storage.js";
import { XP_PER_LEVEL } from "./config.js";

let state = null;

/** Missões de demonstração — no Sprint 5 vêm de lessons.js / do progresso real. */
const DEMO_MISSIONS = [
  {
    title: "Estruturas condicionais em C++",
    desc: "Complete o exercício 03 usando if/else corretamente.",
    progress: 40,
    reward: "+25 XP",
  },
  {
    title: "Primeiro programa compilado",
    desc: "Execute qualquer código com sucesso no terminal.",
    progress: 0,
    reward: "+10 XP · Medalha 'Hello World'",
  },
];

function renderXpChip() {
  const levelEl = qs("#xp-level");
  const fillEl = qs("#xp-fill");
  if (!levelEl || !fillEl) return;

  const xpIntoLevel = state.xp % XP_PER_LEVEL;
  const percent = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);

  levelEl.textContent = `Nv. ${state.level}`;
  fillEl.style.width = `${percent}%`;
}

function renderStatusBar() {
  const xpEl = qs("#status-xp");
  const streakEl = qs("#status-streak");
  if (xpEl) xpEl.textContent = `${state.xp} XP`;
  if (streakEl) streakEl.textContent = `🔥 ${state.streakDays} dias`;
}

function renderMissionsDrawer() {
  const body = qs("#missions-drawer-body");
  if (!body) return;

  body.replaceChildren(
    ...DEMO_MISSIONS.map((mission) => {
      const card = document.createElement("article");
      card.className = "mission-card";
      card.innerHTML = `
        <h3 class="mission-card__title">${mission.title}</h3>
        <p class="mission-card__desc">${mission.desc}</p>
        <div class="mission-card__progress">
          <span class="mission-card__progress-fill" style="width:${mission.progress}%"></span>
        </div>
        <div class="mission-card__reward">${mission.reward}</div>
      `;
      return card;
    })
  );
}

/** Concede XP ao aluno, recalcula o nível e persiste o estado. Sprint 5
 *  vai chamar isto a partir de lessons.js e achievements.js. */
export function grantXp(amount) {
  state.xp += amount;
  state.level = Math.floor(state.xp / XP_PER_LEVEL) + 1;
  saveState(state);
  renderXpChip();
  renderStatusBar();
}

export function initGamification() {
  state = loadState();
  renderXpChip();
  renderStatusBar();
  renderMissionsDrawer();
}
