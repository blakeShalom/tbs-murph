import {
  BOARD_SIZE,
  COMBAT_GRID_SIZE,
  COMBAT_TILE_SIZE,
  MAP_GRID_SIZE,
  MAP_TILE_SIZE
} from "../core/constants.js";

export function createCanvasRenderer(canvas, ctx) {
  function draw(state) {
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    if (state.mode === "map") {
      drawGrid(MAP_TILE_SIZE, MAP_GRID_SIZE, "#d8e2c5", "#c8d7b1");
      drawUnitAtGrid(state.units.player, state.units.player.x, state.units.player.y, MAP_TILE_SIZE, "D");
      drawUnitAtGrid(state.units.enemy, state.units.enemy.x, state.units.enemy.y, MAP_TILE_SIZE, "I");
    } else {
      drawGrid(COMBAT_TILE_SIZE, COMBAT_GRID_SIZE, "#e6dbbf", "#dbcba8");
      drawUnitAtGrid(state.units.player, state.combat.player.x, state.combat.player.y, COMBAT_TILE_SIZE, "D");
      drawUnitAtGrid(state.units.enemy, state.combat.enemy.x, state.combat.enemy.y, COMBAT_TILE_SIZE, "I");
      ctx.fillStyle = "#1f2a1f";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Dawnforged HP: ${state.units.player.hp} | Ironclad HP: ${state.units.enemy.hp}`, BOARD_SIZE / 2, 26);
    }
  }

  function drawGrid(tileSize, size, colorA, colorB) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  function drawUnitAtGrid(unit, x, y, tileSize, label) {
    if (unit.hp <= 0) return;
    const cx = x * tileSize + tileSize / 2;
    const cy = y * tileSize + tileSize / 2;

    ctx.fillStyle = unit.color;
    ctx.beginPath();
    ctx.arc(cx, cy, tileSize * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, cy + 5);
  }

  return {
    draw,
    resize() {
      canvas.width = BOARD_SIZE;
      canvas.height = BOARD_SIZE;
    }
  };
}
