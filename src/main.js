import { createCanvasRenderer } from "./render/canvasRenderer.js";
import { createGameController } from "./gameController.js";

const board = document.getElementById("board");
const ctx = board.getContext("2d");
const statusEl = document.getElementById("status");
const modeLabelEl = document.getElementById("modeLabel");
const mapMpLabelEl = document.getElementById("mapMpLabel");
const combatMpLabelEl = document.getElementById("combatMpLabel");
const attackBtn = document.getElementById("attackBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
const resetBtn = document.getElementById("resetBtn");

const renderer = createCanvasRenderer(board, ctx);
renderer.resize();

const ui = {
  setStatus(text) {
    statusEl.textContent = text;
  },
  setMode(text) {
    modeLabelEl.textContent = text;
  },
  setMapMp(text) {
    if (mapMpLabelEl) mapMpLabelEl.textContent = text;
  },
  setCombatMp(text) {
    if (combatMpLabelEl) combatMpLabelEl.textContent = text;
  },
  setAttackDisabled(disabled) {
    attackBtn.disabled = disabled;
  },
  setEndTurnDisabled(disabled) {
    endTurnBtn.disabled = disabled;
  }
};

const game = createGameController({ ui, renderer });
game.reset();

document.addEventListener("keydown", (event) => {
  if (!event.key.startsWith("Arrow")) return;
  game.move(event.key);
});

attackBtn.addEventListener("click", () => game.playerAttack());
endTurnBtn.addEventListener("click", () => game.endTurn());
resetBtn.addEventListener("click", () => game.reset());
