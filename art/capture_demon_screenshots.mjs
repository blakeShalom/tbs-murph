import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = 'http://127.0.0.1:5173';
const outDir = path.resolve('output/web-game/demon-horde-art');

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1500, height: 1100 } });
const page = await context.newPage();

await page.goto(`${baseUrl}/art/demon_unit_sprite_preview_homm3.html`, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(outDir, 'demon-horde-units-and-backgrounds.png'), fullPage: true });

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.selectOption('#playerRaceSelect', 'demon-horde');
await page.selectOption('#enemyRaceSelect', 'demon-horde');
await page.waitForTimeout(150);
await page.screenshot({ path: path.join(outDir, 'demon-horde-setup-screen.png'), fullPage: true });

await page.click('#startGameBtn');
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(outDir, 'demon-horde-map-screen.png'), fullPage: true });

await page.keyboard.press('b');
await page.waitForTimeout(220);
await page.screenshot({ path: path.join(outDir, 'demon-horde-combat-screen.png'), fullPage: true });

const stateText = await page.evaluate(() => {
  if (typeof window.render_game_to_text === 'function') {
    return window.render_game_to_text();
  }
  return '{}';
});
await writeFile(path.join(outDir, 'state.json'), stateText + '\n', 'utf8');

await browser.close();
console.log(`Captured demon screenshots in ${outDir}`);
