import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = path.resolve(".");
const inputDir = path.join(rootDir, "img", "units", "demons");

const configs = [
  { id: "imp", source: "imp-source.png", output: "imp.png", labelCutoffY: 790 },
  { id: "gog", source: "gog-source.png", output: "gog.png", labelCutoffY: 790 },
  { id: "hell-hound", source: "hell-hound-source.png", output: "hell-hound.png", labelCutoffY: 790 },
  { id: "succubus", source: "succubus-source.png", output: "succubus.png", labelCutoffY: 790 },
  { id: "incubus", source: "incubus-source.png", output: "incubus.png", labelCutoffY: 790 },
  { id: "arch-fiend", source: "arch-fiend-source.png", output: "arch-fiend.png", labelCutoffY: 790 }
];

const outWidth = 140;
const outHeight = 110;
const blackThreshold = 12;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.setContent("<!doctype html><html><body></body></html>", { waitUntil: "load" });

for (const config of configs) {
  const inputPath = path.join(inputDir, config.source);
  const outputPath = path.join(inputDir, config.output);
  const bytes = await readFile(inputPath);
  const dataUrl = `data:image/png;base64,${bytes.toString("base64")}`;

  const pngBase64 = await page.evaluate(
    async ({ dataUrl, outWidth, outHeight, blackThreshold, labelCutoffY }) => {
      const loadImage = (src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
        });

      const img = await loadImage(dataUrl);
      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = img.naturalWidth;
      sourceCanvas.height = img.naturalHeight;
      const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
      sourceCtx.drawImage(img, 0, 0);

      const scanHeight = Math.min(sourceCanvas.height, labelCutoffY);
      const sourceData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
      const pixels = sourceData.data;

      let minX = sourceCanvas.width;
      let minY = scanHeight;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < scanHeight; y += 1) {
        for (let x = 0; x < sourceCanvas.width; x += 1) {
          const idx = (y * sourceCanvas.width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const a = pixels[idx + 3];
          if (!a) continue;
          if (r <= blackThreshold && g <= blackThreshold && b <= blackThreshold) continue;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }

      if (maxX < minX || maxY < minY) {
        throw new Error("No sprite bounds found");
      }

      const cropWidth = maxX - minX + 1;
      const cropHeight = maxY - minY + 1;
      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = outWidth;
      outputCanvas.height = outHeight;
      const outputCtx = outputCanvas.getContext("2d", { willReadFrequently: true });

      const scale = Math.min((outWidth * 0.92) / cropWidth, (outHeight * 0.94) / cropHeight);
      const drawWidth = cropWidth * scale;
      const drawHeight = cropHeight * scale;
      const drawX = (outWidth - drawWidth) / 2;
      const drawY = outHeight - drawHeight - outHeight * 0.02;
      outputCtx.imageSmoothingEnabled = true;
      outputCtx.drawImage(sourceCanvas, minX, minY, cropWidth, cropHeight, drawX, drawY, drawWidth, drawHeight);

      const outputData = outputCtx.getImageData(0, 0, outWidth, outHeight);
      const outPixels = outputData.data;
      for (let i = 0; i < outPixels.length; i += 4) {
        const r = outPixels[i];
        const g = outPixels[i + 1];
        const b = outPixels[i + 2];
        if (r <= blackThreshold && g <= blackThreshold && b <= blackThreshold) {
          outPixels[i + 3] = 0;
        }
      }
      outputCtx.putImageData(outputData, 0, 0);

      return outputCanvas.toDataURL("image/png").split(",")[1];
    },
    { dataUrl, outWidth, outHeight, blackThreshold, labelCutoffY: config.labelCutoffY }
  );

  await writeFile(outputPath, Buffer.from(pngBase64, "base64"));
}

await browser.close();
console.log(`Exported final demon game sprites to ${inputDir}`);
