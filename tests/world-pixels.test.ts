import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("pixel-art world renderer", () => {
  it("does not use a full-screen CRT scanline overlay", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).not.toContain('class="scan"');
    expect(html).not.toContain("repeating-linear-gradient");
  });
  it("maps procedural bitmap patterns onto the scene's 3D materials", () => {
    const scene = readFileSync("src/worlds/scenes.ts", "utf8");
    expect(scene).toContain("map:pixelTexture(c,surface)");
    const textures = readFileSync("src/render/world-pixels.ts", "utf8");
    expect(textures).toContain("canvas.width = canvas.height = 32");
    expect(textures).toContain("configureBitmapTexture");
  });
});
