import { describe, expect, it } from "vitest";
import { pixelRenderSize, WORLD_PIXEL_SIZE } from "../src/render/pixel-screen";
import mainSource from "../src/main.ts?raw";

describe("full-scene bitmap rendering", () => {
  it("renders at a stable chunky resolution on desktop and iPhone", () => {
    expect(WORLD_PIXEL_SIZE).toBe(3);
    expect(pixelRenderSize(390, 844)).toEqual({ width: 130, height: 282 });
    expect(pixelRenderSize(1280, 800)).toEqual({ width: 427, height: 267 });
    expect(pixelRenderSize(0, 0)).toEqual({ width: 1, height: 1 });
  });
  it("restores a full-size canvas until a safe postprocess pass is implemented", () => {
    expect(mainSource).not.toContain("image-rendering:pixelated");
    expect(mainSource).toContain("r.setSize(w, h, false)");
    expect(mainSource).toContain("r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5))");
    expect(mainSource).not.toContain("class=\"scan\"");
  });
});
