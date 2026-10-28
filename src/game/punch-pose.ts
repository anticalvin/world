import * as THREE from "three";
import type { Hand } from "./boxing";

/** Procedural avatars face local +Z. A negative X shoulder rotation drives
 * the hanging arm toward +Z; bending the elbow makes the fist lead. */
export function applyForwardPunch(shoulder: THREE.Object3D, hand: Hand) {
  shoulder.rotation.x = -1.35;
  shoulder.rotation.y = hand === "left" ? -0.1 : 0.1;
  shoulder.rotation.z = hand === "left" ? -0.12 : 0.12;
  const elbow = shoulder.getObjectByName((hand === "left" ? "LEFT" : "RIGHT") + "_LOWER_ARM");
  if (elbow) elbow.rotation.x = -0.25;
}
