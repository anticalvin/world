import * as THREE from "three";
import { configureBitmapTexture } from "./bitmap";

/** Small authored-style procedural pixel patterns applied to real 3D surfaces. */
export type PixelSurface = "stone" | "wood" | "metal" | "fabric" | "water" | "neon";
const cache = new Map<string, THREE.Texture>();
export function pixelTexture(color: number, surface: PixelSurface = "stone"): THREE.Texture {
  const key = color.toString(16) + ":" + surface;
  const existing = cache.get(key);
  if (existing) return existing;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const base = new THREE.Color(color);
  const rgb = (scale: number) => {
    const c = base.clone().multiplyScalar(scale);
    return "#" + c.getHexString();
  };
  ctx.fillStyle = rgb(1);
  ctx.fillRect(0, 0, 32, 32);
  const seed = (x: number, y: number) => ((x * 37 + y * 67 + x * y * 13) % 101) / 101;
  if (surface === "stone") {
    for (let y = 0; y < 32; y += 8) {
      for (let x = -8; x < 40; x += 16) {
        const shift = (Math.floor(y / 8) % 2) * 8;
        ctx.fillStyle = rgb(.66);
        ctx.fillRect(x + shift, y, 15, 1);
        ctx.fillRect(x + shift, y, 1, 8);
        ctx.fillStyle = rgb(1.15);
        ctx.fillRect(x + shift + 2, y + 2, 4, 1);
      }
    }
  } else if (surface === "wood") {
    for (let y = 0; y < 32; y += 5) {
      ctx.fillStyle = rgb(.7);
      ctx.fillRect(0, y, 32, 1);
      ctx.fillStyle = rgb(1.2);
      ctx.fillRect((y * 7) % 23, y + 2, 9, 1);
    }
  } else if (surface === "metal") {
    for (let y = 0; y < 32; y += 8) {
      ctx.fillStyle = rgb(.7);
      ctx.fillRect(0, y, 32, 1);
      for (let x = 0; x < 32; x += 8) {
        ctx.fillStyle = rgb(1.35);
        ctx.fillRect(x + 1, y + 1, 1, 1);
        ctx.fillStyle = rgb(.55);
        ctx.fillRect(x + 2, y + 2, 1, 1);
      }
    }
  } else if (surface === "fabric") {
    for (let y = 0; y < 32; y += 4) for (let x = 0; x < 32; x += 4) {
      ctx.fillStyle = rgb(seed(x, y) > .5 ? 1.2 : .77);
      ctx.fillRect(x, y, 2, 2);
    }
  } else if (surface === "water") {
    for (let y = 2; y < 32; y += 6) {
      ctx.fillStyle = rgb(1.45);
      ctx.fillRect((y * 5) % 20, y, 9, 1);
      ctx.fillStyle = rgb(.7);
      ctx.fillRect((y * 3) % 24, y + 2, 6, 1);
    }
  } else {
    ctx.fillStyle = rgb(1.5);
    ctx.fillRect(2, 2, 28, 2);
    ctx.fillRect(2, 28, 28, 2);
    ctx.fillRect(2, 2, 2, 28);
    ctx.fillRect(28, 2, 2, 28);
    for (let y = 8; y < 26; y += 7) {
      ctx.fillStyle = rgb(.6);
      ctx.fillRect(7, y, 18, 2);
    }
  }
  const texture = configureBitmapTexture(new THREE.CanvasTexture(canvas));
  cache.set(key, texture);
  return texture;
}
