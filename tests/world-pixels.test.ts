import { describe, it, expect } from "vitest";
import worldSource from "../src/worlds/scenes.ts?raw";
import pixelSource from "../src/render/world-pixels.ts?raw";
import htmlSource from "../index.html?raw";

describe("pixel-art world renderer", () => {
  it("removes the fake CRT scanline overlay", () => {
    expect(htmlSource).not.toContain('class="scan"');
    expect(htmlSource).not.toContain("repeating-linear-gradient");
  });
  it("maps procedural 32px bitmap textures onto 3D materials", () => {
    expect(worldSource).toContain("map:pixelTexture(c,surface)");
    expect(pixelSource).toContain("canvas.width = canvas.height = 32");
    expect(pixelSource).toContain("configureBitmapTexture");
  });
});
