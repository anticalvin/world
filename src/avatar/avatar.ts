import { characterSelectModel } from "./character-select";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const BODY = ["blocky", "stylized"] as const;
export const HATS = ["none", "cap", "beanie", "halo", "crown"] as const;
export const HAIR = ["twists", "buzz", "afro", "braids", "bald", "bob", "mohawk", "bun"] as const;
export const TOPS = ["tee", "tank", "hoodie", "jacket", "armor"] as const;
export const PANTS = ["cargo", "jeans", "shorts", "skirt"] as const;
export const SHOES = ["boots", "sneakers", "sandals"] as const;
export const GLASSES = ["none", "round", "visor"] as const;
export const MASKS = ["none", "half", "neon"] as const;
export const BACKPACKS = ["none", "pack", "wings"] as const;
export type Choice<T extends readonly string[]> = T[number];
export type AvatarConfig = {
  version: 2;
  name: string;
  style: "geisha" | "ronin" | "ghost" | "fox";
  body: Choice<typeof BODY>;
  outfit: string;
  accent: string;
  skin: string;
  hairColor: string;
  hair: Choice<typeof HAIR>;
  top: Choice<typeof TOPS>;
  pants: Choice<typeof PANTS>;
  shoes: Choice<typeof SHOES>;
  hat: Choice<typeof HATS>;
  glasses: Choice<typeof GLASSES>;
  mask: Choice<typeof MASKS>;
  backpack: Choice<typeof BACKPACKS>;
  scale: number;
  rotation: number;
  seed: number;
  imported?: string;
};
export type AvatarAppearance = Omit<
  AvatarConfig,
  "name" | "scale" | "rotation" | "seed" | "imported"
>;
const key = "awaken-avatar-v2",
  legacy = "awaken-avatar-v12",
  db = "awaken-avatar-assets-v12";
const palettes = [
  ["#355cdd", "#35f0ff", "#b8794f", "#17122b"],
  ["#e0a22f", "#f55699", "#7b4f35", "#251124"],
  ["#3aaf87", "#f5e9ff", "#593b2b", "#101827"],
  ["#7d50c7", "#ffcc55", "#d19a73", "#32213d"],
];
const pick = <T>(items: readonly T[], n: number) =>
  items[Math.abs(n) % items.length];
export function randomAvatar(
  seed = Math.floor(Math.random() * 2 ** 31),
): AvatarConfig {
  const p = pick(palettes, seed),
    n = (v: number) => Math.abs((seed * v) ^ (seed >>> 3));
  return {
    version: 2,
    name: "WANDERER",
    style: pick(["geisha", "ronin", "ghost", "fox"] as const, n(3)),
    body: pick(BODY, n(5)),
    outfit: p[0],
    accent: p[1],
    skin: p[2],
    hairColor: p[3],
    hair: pick(HAIR, n(7)),
    top: pick(TOPS, n(11)),
    pants: pick(PANTS, n(13)),
    shoes: pick(SHOES, n(17)),
    hat: pick(HATS, n(19)),
    glasses: pick(GLASSES, n(23)),
    mask: pick(MASKS, n(29)),
    backpack: pick(BACKPACKS, n(31)),
    scale: 1,
    rotation: 0,
    seed,
  };
}
export const defaults = randomAvatar(142857);
const valid = <T extends readonly string[]>(
  v: unknown,
  list: T,
  fallback: T[number],
) => (list.includes(v as T[number]) ? (v as T[number]) : fallback);
const color = (v: unknown, fallback: string) =>
  typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
export function sanitizeAvatar(value: Partial<AvatarConfig>): AvatarConfig {
  const d = randomAvatar(Number(value.seed) || 142857);
  return {
    ...d,
    version: 2,
    name:
      String(value.name || d.name)
        .replace(/[^ A-Z0-9_-]/gi, "")
        .slice(0, 14) || d.name,
    style: valid(
      value.style,
      ["geisha", "ronin", "ghost", "fox"] as const,
      d.style,
    ),
    body: valid(value.body, BODY, d.body),
    hair: valid(value.hair, HAIR, d.hair),
    top: valid(value.top, TOPS, d.top),
    pants: valid(value.pants, PANTS, d.pants),
    shoes: valid(value.shoes, SHOES, d.shoes),
    hat: valid(value.hat, HATS, d.hat),
    glasses: valid(value.glasses, GLASSES, d.glasses),
    mask: valid(value.mask, MASKS, d.mask),
    backpack: valid(value.backpack, BACKPACKS, d.backpack),
    outfit: color(value.outfit, d.outfit),
    accent: color(value.accent, d.accent),
    skin: color(value.skin, d.skin),
    hairColor: color(value.hairColor, (value as any).hair || d.hairColor),
    scale: Math.min(1.2, Math.max(0.8, Number(value.scale) || 1)),
    rotation: Number(value.rotation) || 0,
  };
}
export const loadConfig = (): AvatarConfig => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return sanitizeAvatar(JSON.parse(saved));
    const old = JSON.parse(localStorage.getItem(legacy) || "{}");
    const next = sanitizeAvatar({
      ...randomAvatar(),
      ...old,
      hairColor: old.hair,
    });
    saveConfig(next);
    return next;
  } catch {
    return randomAvatar();
  }
};
export const saveConfig = (v: AvatarConfig) =>
  localStorage.setItem(key, JSON.stringify(sanitizeAvatar(v)));
export const presets = (): Record<string, AvatarConfig> => {
  try {
    return JSON.parse(localStorage.getItem("awaken-avatar-presets-v2") || "{}");
  } catch {
    return {};
  }
};
export const savePreset = (name: string, v: AvatarConfig) => {
  const all = presets();
  all[name.slice(0, 24) || "LOOK"] = sanitizeAvatar(v);
  localStorage.setItem("awaken-avatar-presets-v2", JSON.stringify(all));
};
const mat = (c: string) =>
  new THREE.MeshStandardMaterial({
    color: c,
    emissive: c,
    emissiveIntensity: 0.12,
    flatShading: true,
  });
const part = (
  root: THREE.Group,
  name: string,
  g: THREE.BufferGeometry,
  m: THREE.Material,
  x: number,
  y: number,
  z: number,
  meshOffsetY = 0,
) => {
  const p = new THREE.Group();
  p.name = name;
  p.position.set(x, y, z);
  const mesh = new THREE.Mesh(g, m);
  mesh.position.y = meshOffsetY;
  p.add(mesh);
  root.add(p);
  return p;
};
export function builtIn(input: AvatarConfig) {
  return characterSelectModel(sanitizeAvatar(input));
}
export function appearanceOf(c: AvatarConfig): AvatarAppearance {
  const { name, scale, rotation, seed, imported, ...appearance } =
    sanitizeAvatar(c);
  return appearance;
}
function open() {
  return new Promise<IDBDatabase>((ok, no) => {
    const r = indexedDB.open(db, 2);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains("files"))
        r.result.createObjectStore("files");
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
  });
}
export async function saveFile(file: File, id = "active") {
  const d = await open();
  await new Promise<void>((ok, no) => {
    const t = d.transaction("files", "readwrite");
    t.objectStore("files").put(file, id);
    t.oncomplete = () => ok();
    t.onerror = () => no(t.error);
  });
  d.close();
}
export async function getFile(id = "active") {
  const d = await open();
  const result = await new Promise<Blob | undefined>((ok, no) => {
    const r = d.transaction("files").objectStore("files").get(id);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
  });
  d.close();
  return result;
}
export async function parseGlb(file: Blob) {
  if (file.size > 8 * 1024 * 1024) throw Error("Avatar exceeds 8 MB");
  const b = await file.arrayBuffer(),
    d = new DataView(b);
  if (
    b.byteLength < 20 ||
    d.getUint32(0, true) !== 0x46546c67 ||
    d.getUint32(4, true) !== 2
  )
    throw Error("Select a valid GLB 2.0 file");
  const gltf = await new GLTFLoader().parseAsync(b, "");
  let vertices = 0;
  gltf.scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh)
      vertices += (o as THREE.Mesh).geometry.attributes.position?.count || 0;
  });
  if (!vertices || vertices > 300000)
    throw Error("Avatar must contain 1–300,000 vertices");
  const box = new THREE.Box3().setFromObject(gltf.scene),
    size = box.getSize(new THREE.Vector3()),
    center = box.getCenter(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y < 0.001)
    throw Error("Avatar has invalid bounds");
  gltf.scene.position.sub(center);
  gltf.scene.position.y += size.y / 2;
  gltf.scene.scale.multiplyScalar(
    Math.min(2.1 / Math.max(size.x, size.y, size.z), 5),
  );
  return { model: gltf.scene, clips: gltf.animations };
}
