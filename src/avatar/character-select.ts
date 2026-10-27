import * as THREE from "three";
import type { AvatarConfig } from "./avatar";

// Adapted from the user's Character Select design. No remote scripts or textures.
export function characterSelectModel(c: AvatarConfig): THREE.Group {
  const root = new THREE.Group();
  root.userData.procedural = true;
  root.userData.sockets = {};
  const mat = (color: string) => new THREE.MeshLambertMaterial({ color, flatShading: true });
  const skin = mat(c.skin), top = mat(c.outfit), hair = mat(c.hairColor);
  const dark = mat("#17171c"), sole = mat("#f2f2f2");
  const pants = mat(c.pants === "jeans" ? "#303c5a" : c.pants === "cargo" ? "#556037" : c.accent);
  const shoe = mat(c.shoes === "boots" ? "#17171c" : c.accent);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (a: number, b: number, h: number) => new THREE.CylinderGeometry(a, b, h, 8);
  function group(parent: THREE.Object3D, name: string, x: number, y: number, z: number) {
    const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g;
  }
  function part(parent: THREE.Object3D, name: string, geo: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) {
    const m = new THREE.Mesh(geo, material); m.name = name; m.position.set(x, y, z); parent.add(m); return m;
  }
  const tw = c.top === "hoodie" ? 0.6 : c.top === "tank" ? 0.46 : 0.52;
  part(root, "TORSO", box(tw, 0.62, c.top === "hoodie" ? 0.34 : 0.28), top, 0, 1.26, 0);
  part(root, "WAIST", box(0.56, 0.22, 0.31), pants, 0, 0.88, 0);
  part(root, "BELT", box(0.57, 0.05, 0.32), dark, 0, 0.98, 0);
  part(root, "NECK", cyl(0.06, 0.07, 0.1), skin, 0, 1.62, 0);
  const baggy = c.pants === "cargo" || c.pants === "jeans";
  for (const side of ["LEFT", "RIGHT"] as const) {
    const d = side === "LEFT" ? -1 : 1;
    const shoulder = group(root, side + "_UPPER_ARM", d * (tw / 2 + 0.065), 1.49, 0);
    part(shoulder, "SLEEVE", cyl(0.087, 0.09, c.top === "hoodie" ? 0.4 : c.top === "tank" ? 0.05 : 0.18), top, 0, -0.1, 0);
    part(shoulder, "UPPER_ARM", cyl(0.06, 0.055, 0.32), skin, 0, -0.18, 0);
    const elbow = group(shoulder, side + "_LOWER_ARM", 0, -0.34, 0);
    part(elbow, "FOREARM", cyl(0.057, 0.05, 0.25), skin, 0, -0.125, 0);
    part(elbow, "HAND", new THREE.SphereGeometry(0.07, 6, 5), skin, 0, -0.27, 0);
    const hip = group(root, side + "_UPPER_LEG", d * (baggy ? 0.205 : 0.15), 0.76, 0);
    part(hip, "THIGH", baggy ? cyl(0.18, 0.20, 0.4) : cyl(0.13, 0.17, 0.4), pants, 0, -0.2, 0);
    if (c.pants === "cargo") part(hip, "POCKET", box(0.055, 0.16, 0.16), mat("#485330"), d * 0.205, -0.24, 0.01);
    const knee = group(hip, side + "_LOWER_LEG", 0, -0.4, 0);
    part(knee, "SHIN", baggy ? cyl(0.19, 0.155, 0.36) : cyl(0.12, 0.12, 0.36), c.pants === "shorts" ? skin : pants, 0, -0.18, 0);
    const ankle = group(knee, side + "_FOOT", 0, -0.36, 0);
    part(ankle, "SHOE", box(0.2, 0.10, 0.36), shoe, 0, 0.05, 0.05);
    part(ankle, "SOLE", box(0.22, 0.035, 0.38), sole, 0, 0.018, 0.05);
  }
  const head = group(root, "HEAD", 0, 1.76, 0);
  const face = part(head, "FACE", new THREE.SphereGeometry(0.15, 10, 8), skin, 0, 0, 0);
  face.scale.set(1, 1.15, 1);
  for (const d of [-1, 1]) {
    part(head, "EAR", box(0.04, 0.07, 0.03), skin, d * 0.15, 0, 0);
    part(head, "EYE", box(0.04, 0.025, 0.02), dark, d * 0.055, 0.03, 0.14);
    part(head, "BROW", box(0.07, 0.012, 0.02), dark, d * 0.055, 0.075, 0.14);
  }
  part(head, "MOUTH", box(0.05, 0.012, 0.02), mat("#5a2a22"), 0, -0.07, 0.14);
  if (c.hair === "afro") part(head, "HAIR", new THREE.SphereGeometry(0.27, 10, 8), hair, 0, 0.05, -0.02);
  else if (c.hair === "buzz" || c.hair === "bob") part(head, "HAIR", new THREE.SphereGeometry(0.158, 10, 8, 0, Math.PI * 2, 0, 1.65), hair, 0, 0.01, 0);
  else if (c.hair === "bun") part(head, "HAIR", new THREE.SphereGeometry(0.17, 8, 6), hair, 0, 0.15, -0.1);
  else if (c.hair === "mohawk") part(head, "HAIR", box(0.12, 0.25, 0.28), hair, 0, 0.18, 0);
  else if (c.hair === "braids") {
    for (let j = 0; j < 7; j++) {
      const a = -1.1 + j * 0.37;
      part(head, "BRAID", box(0.045, 0.32, 0.045), hair, Math.sin(a) * 0.16, -0.12, -Math.cos(a) * 0.14);
    }
  } else if (c.hair === "twists") {
    for (let i = 0; i < 26; i++) {
      const phi = Math.acos(1 - (i + 0.5) / 26 * 0.95), theta = i * 2.4, r = 0.16;
      const twist = part(head, "TWIST", box(0.05, 0.05, 0.15), hair, Math.sin(phi) * Math.cos(theta) * r, Math.cos(phi) * r * 1.15, Math.sin(phi) * Math.sin(theta) * r);
      twist.lookAt(twist.position.clone().multiplyScalar(3).add(new THREE.Vector3(0, 0.15, 0)));
      twist.translateZ(0.04);
    }
  }
  if (c.hat !== "none") {
    if (c.hat === "halo") {
      const ring = part(head, "HAT", new THREE.TorusGeometry(0.25, 0.035, 8, 20), mat(c.accent), 0, 0.36, 0);
      ring.rotation.x = Math.PI / 2;
    } else part(head, "HAT", cyl(0.18, 0.19, 0.12), mat(c.accent), 0, 0.2, 0);
  }
  if (c.glasses !== "none") for (const d of [-1, 1]) part(head, "GLASSES", new THREE.TorusGeometry(0.07, 0.014, 5, 10), mat(c.accent), d * 0.07, 0.025, 0.15);
  if (c.mask !== "none") part(head, "MASK", box(0.19, 0.09, 0.04), mat(c.accent), 0, -0.06, 0.16);
  if (c.backpack !== "none") part(root, "BACKPACK", box(0.35, 0.4, 0.12), mat(c.accent), 0, 1.27, -0.22);
  return root;
}
