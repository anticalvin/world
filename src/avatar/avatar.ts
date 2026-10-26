import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const BODY = ["blocky", "stylized"] as const;
export const HATS = ["none", "cap", "beanie", "halo", "crown"] as const;
export const HAIR = ["bob", "mohawk", "bun"] as const;
export const TOPS = ["jacket", "hoodie", "armor"] as const;
export const PANTS = ["cargo", "skirt", "shorts"] as const;
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
  const c = sanitizeAvatar(input),
    root = new THREE.Group(),
    skin = mat(c.skin),
    cloth = mat(c.outfit),
    accent = mat(c.accent),
    hair = mat(c.hairColor),
    block = c.body === "blocky";
  root.userData.procedural = true;
  root.userData.sockets = {};
  const box = (x: number, y: number, z: number) =>
    new THREE.BoxGeometry(x, y, z);
  const limb = block
    ? box(0.24, 0.72, 0.24)
    : new THREE.CapsuleGeometry(0.13, 0.48, 4, 8);
  part(
    root,
    "TORSO",
    block
      ? box(0.72, 0.82, 0.34)
      : new THREE.CylinderGeometry(0.38, 0.32, 0.85, 8),
    cloth,
    0,
    1.28,
    0,
  );
  part(
    root,
    "HEAD",
    block ? box(0.52, 0.55, 0.48) : new THREE.SphereGeometry(0.32, 12, 10),
    skin,
    0,
    2.02,
    0,
  );
  for (const [side, x] of [
    ["LEFT", -0.48],
    ["RIGHT", 0.48],
  ] as const) {
    const upper = part(root, `${side}_UPPER_ARM`, limb, cloth, x, 1.61, 0, -0.36);
    part(upper, `${side}_LOWER_ARM`, limb, skin, 0, -0.69, 0, -0.36);
    const thigh = part(root, `${side}_UPPER_LEG`, limb, cloth, x * 0.55, 0.91, 0, -0.36);
    const shin = part(thigh, `${side}_LOWER_LEG`, limb, accent, 0, -0.69, 0, -0.36);
    part(shin, `${side}_FOOT`, box(0.26, 0.16, 0.38), accent, 0, -0.69, 0.1);
  }
  const socket = (name: string, x: number, y: number, z: number) => {
    const q = new THREE.Group();
    q.name = name;
    q.position.set(x, y, z);
    root.add(q);
    root.userData.sockets[name] = q;
    return q;
  };
  const head = socket("HEAD_TOP", 0, 2.37, 0),
    face = socket("HEAD_FACE", 0, 2.04, 0.28),
    back = socket("BACK", 0, 1.32, 0.25);
  if (c.hair === "bun")
    part(head, "HAIR", new THREE.SphereGeometry(0.18, 8, 6), hair, 0, 0.12, 0);
  else
    part(
      head,
      "HAIR",
      c.hair === "mohawk"
        ? box(0.16, 0.42, 0.38)
        : new THREE.SphereGeometry(0.32, 10, 8),
      hair,
      0,
      0.03,
      0,
    );
  // Hats are authored around the head-top socket. No generic limb offset:
  // previously every hat sat 0.32 units below its intended anchor.
  if (c.hat !== "none") {
    const hat = new THREE.Group();
    hat.name = "HAT";
    head.add(hat);
    const addHatMesh = (geometry: THREE.BufferGeometry, material: THREE.Material, y: number) => {
      const piece = new THREE.Mesh(geometry, material);
      piece.position.y = y;
      hat.add(piece);
    };
    if (c.hat === "cap") {
      addHatMesh(new THREE.CylinderGeometry(0.29, 0.31, 0.16, 12), cloth, 0.09);
      const brim = new THREE.Mesh(box(0.48, 0.045, 0.22), accent);
      brim.position.set(0, 0.025, 0.31);
      hat.add(brim);
    } else if (c.hat === "beanie") {
      addHatMesh(new THREE.SphereGeometry(0.31, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), cloth, 0.0);
      addHatMesh(new THREE.CylinderGeometry(0.31, 0.31, 0.09, 12), accent, 0.025);
    } else if (c.hat === "halo") {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 8, 24), accent);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.32;
      hat.add(ring);
    } else if (c.hat === "crown") {
      addHatMesh(new THREE.CylinderGeometry(0.29, 0.29, 0.13, 8), accent, 0.12);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.17, 4), accent);
        tip.position.set(Math.cos(a) * 0.24, 0.28, Math.sin(a) * 0.24);
        hat.add(tip);
      }
    }
    // A full bob/bun/mohawk and a close-fitting hat occupy the same space.
    // Hide procedural hair only for fitted hats; keep it for halo/crown.
    if (c.hat === "cap" || c.hat === "beanie") {
      const hairMesh = head.getObjectByName("HAIR");
      if (hairMesh) hairMesh.visible = false;
    }
  }
  if (c.glasses !== "none")
    part(
      face,
      "GLASSES",
      new THREE.TorusGeometry(0.13, 0.03, 5, 8),
      accent,
      0,
      0,
      0.02,
    );
  if (c.mask !== "none")
    part(
      face,
      "MASK",
      box(0.34, 0.18, 0.07),
      c.mask === "neon" ? accent : cloth,
      0,
      -0.12,
      0.02,
    );
  if (c.backpack !== "none")
    part(
      back,
      "BACKPACK",
      c.backpack === "wings"
        ? new THREE.ConeGeometry(0.32, 0.7, 4)
        : box(0.46, 0.52, 0.14),
      accent,
      0,
      0,
      0.12,
    );
  return root;
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
