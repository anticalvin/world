import * as THREE from "three";
import { bitmapMaterial } from "../render/bitmap";

const SIZE = 32;
const KEY = "awaken-bitmap-studio-v1";
const COLORS = ["#160725", "#ffffff", "#ff2e9a", "#35f0ff", "#ffb347", "#8b5cf6", "#34d399", "#f43f5e", "#000000"];
const blank = () => Array<string>(SIZE * SIZE).fill("#160725");

export function mountBitmapStudio(scene: THREE.Scene, host: HTMLElement) {
  const pixels = blank();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(saved) && saved.length === pixels.length)
      for (let i = 0; i < pixels.length; i++)
        if (typeof saved[i] === "string" && /^#[0-9a-f]{6}$/i.test(saved[i])) pixels[i] = saved[i];
  } catch { /* A malformed local draft must never break the world. */ }

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  canvas.style.cssText = "width:min(256px,65vw);height:min(256px,65vw);image-rendering:pixelated;border:2px solid #35f0ff;touch-action:none;cursor:crosshair";
  canvas.setAttribute("aria-label", "32 by 32 bitmap painting canvas");
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  const prop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), bitmapMaterial(texture));
  prop.name = "bitmap-studio-local-preview";
  prop.visible = false;
  scene.add(prop);
  const panel = document.createElement("section");
  panel.className = "ui panel";
  panel.id = "bitmap-studio";
  panel.setAttribute("aria-label", "Bitmap Studio");
  panel.style.cssText = "display:none;position:fixed;z-index:8;top:50%;left:50%;transform:translate(-50%,-50%);width:min(320px,calc(100vw - 40px));max-height:90vh;overflow:auto;box-sizing:border-box;pointer-events:auto";
  const heading = document.createElement("h2");
  heading.textContent = "BITMAP STUDIO · 32×32";
  heading.style.cssText = "margin:0 0 8px;color:#35f0ff;font-size:17px";
  const description = document.createElement("p");
  description.textContent = "Paint pixels, then place your textured cube. Saved locally on this device.";
  description.style.cssText = "font-size:12px;line-height:1.4";
  const palette = document.createElement("div");
  palette.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin:10px 0";
  let color = COLORS[2];
  for (const value of COLORS) {
    const button = document.createElement("button");
    button.type = "button";
    button.title = value;
    button.setAttribute("aria-label", "Paint " + value);
    button.style.cssText = `width:28px;height:28px;background:${value};border:2px solid ${value === color ? "#fff" : "#555"};padding:0`;
    button.onclick = () => {
      color = value;
      for (const child of Array.from(palette.children) as HTMLButtonElement[])
        child.style.borderColor = child.title === value ? "#fff" : "#555";
    };
    palette.append(button);
  }
  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;flex-wrap:wrap;gap:6px";
  const makeButton = (label: string, fn: () => void) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.textContent = label;
    button.onclick = fn;
    actions.append(button);
    return button;
  };
  function redraw() {
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        ctx.fillStyle = pixels[y * SIZE + x];
        ctx.fillRect(x, y, 1, 1);
      }
    texture.needsUpdate = true;
  }
  let painting = false;
  function paint(event: PointerEvent) {
    const bounds = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - bounds.left) * SIZE / bounds.width);
    const y = Math.floor((event.clientY - bounds.top) * SIZE / bounds.height);
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    pixels[y * SIZE + x] = color;
    redraw();
  }
  canvas.addEventListener("pointerdown", event => {
    painting = true;
    canvas.setPointerCapture(event.pointerId);
    paint(event);
  });
  canvas.addEventListener("pointermove", event => { if (painting) paint(event); });
  canvas.addEventListener("pointerup", () => { painting = false; localStorage.setItem(KEY, JSON.stringify(pixels)); });
  canvas.addEventListener("pointercancel", () => { painting = false; });
  const close = () => { panel.style.display = "none"; };
  makeButton("PLACE CUBE", () => {
    localStorage.setItem(KEY, JSON.stringify(pixels));
    prop.visible = true;
    prop.userData.placed = true;
    const position = getPosition();
    prop.position.set(position.x + 2, position.y + 1, position.z - 2);
    close();
  });
  makeButton("EXPORT PNG", () => {
    const link = document.createElement("a");
    link.download = "awaken-bitmap-32.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
  makeButton("CLEAR", () => { pixels.fill("#160725"); redraw(); localStorage.setItem(KEY, JSON.stringify(pixels)); });
  makeButton("CLOSE", close);
  panel.append(heading, description, palette, canvas, actions);
  host.append(panel);
  redraw();
  let getPosition = () => new THREE.Vector3(0, 0, 9);
  return {
    open(position: () => THREE.Vector3) { getPosition = position; panel.style.display = "block"; },
    close,
    setWorldVisible(visible: boolean) { prop.visible = visible && prop.userData.placed === true; },
  };
}
