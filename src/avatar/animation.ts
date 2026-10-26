import * as THREE from "three";
import type { MotorState } from "../movement/motor";
export type AnimationState =
  | "idle"
  | "walk"
  | "run"
  | "jump"
  | "fall"
  | "land"
  | "slide";
export class AvatarAnimator {
  state: AnimationState = "idle";
  private mixer?: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  constructor(
    private root: THREE.Object3D,
    clips: THREE.AnimationClip[] = [],
  ) {
    if (clips.length) {
      this.mixer = new THREE.AnimationMixer(root);
      for (const c of clips)
        this.actions.set(c.name.toLowerCase(), this.mixer.clipAction(c));
    }
  }
  update(s: MotorState, dt: number) {
    const speed = Math.hypot(s.velocity.x, s.velocity.z);
    this.state =
      s.slide > 0
        ? "slide"
        : !s.grounded
          ? s.velocity.y > 0
            ? "jump"
            : "fall"
          : speed > 0.3
            ? speed > 5.4
              ? "run"
              : "walk"
            : "idle";
    if (this.root.userData.procedural) {
      this.root.rotation.z = 0;
      this.root.rotation.x = this.state === "slide" ? -0.28 : 0;
      this.root.position.y =
        Math.sin(performance.now() * 0.012) *
        (this.state === "idle" ? 0.025 : speed > 0.3 ? 0.045 : 0);
      const swing =
        this.state === "walk" || this.state === "run"
          ? Math.sin(
              performance.now() * 0.012 * (this.state === "run" ? 1.8 : 1),
            ) * 0.7
          : 0;
      for (const side of ["LEFT", "RIGHT"]) {
        const sign = side === "LEFT" ? 1 : -1;
        this.root.getObjectByName(`${side}_UPPER_ARM`)!.rotation.x =
          sign * swing;
        this.root.getObjectByName(`${side}_UPPER_LEG`)!.rotation.x =
          -sign * swing;
      }
      if (this.state === "jump" || this.state === "fall")
        this.root.getObjectByName("LEFT_UPPER_ARM")!.rotation.x =
          this.root.getObjectByName("RIGHT_UPPER_ARM")!.rotation.x = -0.8;
    }
    const wanted = [...this.actions].find(([n]) => n.includes(this.state))?.[1];
    if (wanted) {
      for (const a of this.actions.values()) if (a !== wanted) a.fadeOut(0.12);
      wanted.reset().fadeIn(0.12).play();
    }
    this.mixer?.update(dt);
  }
}
