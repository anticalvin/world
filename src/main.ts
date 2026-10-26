import * as T from "three";
import { worlds } from "./sdk/worlds";
import { validateManifest, type WorldManifest } from "./sdk/manifest";
import { RapierCharacter } from "./movement/rapier-controller";
import { TICK } from "./movement/motor";
import {
  builtIn,
  getFile,
  loadConfig,
  parseGlb,
  saveConfig,
  saveFile,
  appearanceOf,
  randomAvatar,
  sanitizeAvatar,
  savePreset,
  presets,
  BODY,
  HATS,
  HAIR,
  TOPS,
  PANTS,
  SHOES,
  GLASSES,
  MASKS,
  BACKPACKS,
  type AvatarConfig,
} from "./avatar/avatar";
import { AvatarAnimator } from "./avatar/animation";
import {
  checkpoint,
  courseEnter,
  createCourse,
  finish,
  restart,
  type CourseState,
} from "./game/course";
import { createWorldScene } from "./worlds/scenes";
import { LoungeClient, type LoungePlayer } from "./network/lounge-client";
const responsive = document.createElement("style");
responsive.textContent =
  ".hud{inset:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))}.hud .top{align-items:flex-start}.hud .top .panel{max-width:48vw;font-size:11px;padding:6px}.hud .top .btn{min-height:40px;margin:0;padding:7px;font-size:11px}.hud .hint{max-width:min(46vw,260px);bottom:154px;right:0;padding:7px;font-size:10px}@media(max-height:600px){.hud .hint{bottom:124px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}";
document.head.append(responsive);
const app = document.querySelector<HTMLDivElement>("#app")!,
  r = new T.WebGLRenderer({ antialias: false }),
  s = new T.Scene(),
  cam = new T.PerspectiveCamera(70, 1, 0.1, 100),
  av = new T.Group(),
  keys = new Set<string>(),
  ray = new T.Raycaster();
r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
r.domElement.style.cssText =
  "position:fixed;inset:0;width:100%;height:100%;display:block;touch-action:none;z-index:0";
app.append(r.domElement);
const sun = new T.DirectionalLight(0xbff4ff, 2.4);
sun.position.set(-8, 14, 8);
s.add(
  new T.HemisphereLight(0xc2aaff, 0x4a2a70, 3),
  new T.AmbientLight(0x7a5ab0, 1.4),
  sun,
  av,
);
const grid = new T.GridHelper(50, 50, 0xff2e9a, 0x35f0ff);
grid.visible = false;
s.add(grid);
let cfg: AvatarConfig = loadConfig(),
  model: T.Object3D = builtIn(cfg),
  an = new AvatarAnimator(model),
  w = worlds[0],
  active = false,
  yaw = 0,
  pitch = -0.15,
  third = true,
  acc = 0,
  last = performance.now(),
  jump = false,
  slide = false,
  sx = 0,
  sy = 0,
  mobileRun = false,
  note = "LOCAL SESSION · no other players connected",
  objects: T.Mesh[] = [],
  course: CourseState = loadCourse();
av.add(model);
function loadCourse() {
  try {
    return {
      ...createCourse(),
      ...JSON.parse(localStorage.getItem("awaken-course-v12") || "{}"),
    };
  } catch {
    return createCourse();
  }
}
function saveCourse() {
  localStorage.setItem("awaken-course-v12", JSON.stringify(course));
}
function resize() {
  const v = visualViewport,
    w = Math.max(1, Math.round(v?.width || innerWidth)),
    h = Math.max(1, Math.round(v?.height || innerHeight));
  r.setSize(w, h, false);
  r.domElement.style.width = `${w}px`;
  r.domElement.style.height = `${h}px`;
  cam.aspect = w / h;
  cam.updateProjectionMatrix();
}
addEventListener("resize", resize);
visualViewport?.addEventListener("resize", resize);
visualViewport?.addEventListener("scroll", resize);
resize();
const boot = document.createElement("section"),
  hud = document.createElement("section");
boot.className = "ui panel boot";
hud.className = "ui hud";
hud.innerHTML =
  '<div class="top"><div class="panel" id="where"></div><button class="btn" id="view">VIEW: 3RD</button><button class="btn" id="menu" aria-label="Return to main menu">MENU</button></div><div class="panel hint" id="notice"></div><div id="touch" style="display:none"><div id="stick" style="position:absolute;left:18px;bottom:20px;width:112px;height:112px;border:2px solid #35f0ff;border-radius:50%;background:#0d061488;touch-action:none;pointer-events:auto"><div id="nub" style="position:absolute;left:33px;top:33px;width:42px;height:42px;border-radius:50%;background:#ff2e9a;border:2px solid white"></div></div><div style="position:absolute;right:12px;bottom:18px;display:flex;gap:6px;flex-wrap:wrap;width:160px;pointer-events:auto"><button style="min-width:72px;min-height:48px;color:#f5e9ff;background:#2a0f4d;border:2px solid #ff2e9a;font:inherit" id="run">RUN</button><button style="min-width:72px;min-height:48px;color:#f5e9ff;background:#2a0f4d;border:2px solid #ff2e9a;font:inherit" id="mjump">JUMP</button><button style="min-width:72px;min-height:48px;color:#f5e9ff;background:#2a0f4d;border:2px solid #ff2e9a;font:inherit" id="mslide">SLIDE</button><button style="min-width:72px;min-height:48px;color:#f5e9ff;background:#2a0f4d;border:2px solid #ff2e9a;font:inherit" id="mview">VIEW</button></div></div>';
app.append(boot, hud);
const where = hud.querySelector("#where")!,
  notice = hud.querySelector("#notice")!;
const chatToggle = document.createElement("button"),
  chatPanel = document.createElement("section"),
  networkStatus = document.createElement("small"),
  chatLog = document.createElement("output"),
  chatForm = document.createElement("form"),
  chatText = document.createElement("input"),
  chatSend = document.createElement("button");
chatPanel.className = "panel";
chatToggle.className = "btn";
chatToggle.id = "chat-toggle";
chatToggle.type = "button";
chatToggle.textContent = "CHAT";
chatToggle.setAttribute("aria-expanded", "false");
chatToggle.setAttribute("aria-controls", "lounge-chat");
chatToggle.style.cssText = "position:absolute;left:0;top:52px;min-height:40px;pointer-events:auto";
chatPanel.id = "lounge-chat";
chatPanel.style.cssText =
  "display:none;position:absolute;left:0;top:102px;bottom:auto;width:min(280px,calc(100vw - 36px));max-height:35vh;overflow:auto;box-sizing:border-box;pointer-events:auto";
chatPanel.setAttribute("aria-label", "Lounge chat");
networkStatus.textContent = "OFFLINE · LOCAL SESSION";
networkStatus.id = "network-status";
chatLog.setAttribute("aria-live", "polite");
chatLog.style.cssText = "display:block;min-height:22px";
chatText.maxLength = 120;
chatText.placeholder = "Say something";
chatText.setAttribute("aria-label", "Lounge chat");
chatSend.type = "submit";
chatSend.className = "btn";
chatSend.textContent = "SEND";
chatForm.append(chatText, chatSend);
chatPanel.append(networkStatus, chatLog, chatForm);
hud.append(chatToggle, chatPanel);
let chatOpen = false;
function toggleChat(open = !chatOpen) {
  chatOpen = open;
  chatPanel.style.display = open && w.id === "awaken-lounge" && active ? "block" : "none";
  chatToggle.setAttribute("aria-expanded", String(open));
  chatToggle.textContent = open ? "CLOSE CHAT" : "CHAT";
  if (!open) chatText.blur();
}
chatToggle.onclick = () => toggleChat();
chatForm.onsubmit = (e) => {
  e.preventDefault();
  const text = chatText.value.trim();
  if (text && lounge.connected) {
    lounge.sendChat(text);
    chatText.value = "";
  }
};
if (matchMedia("(pointer:coarse)").matches)
  (hud.querySelector("#touch") as HTMLElement).style.display = "block";
function setAvatar(x: T.Object3D, c: T.AnimationClip[] = []) {
  av.remove(model);
  model = x;
  model.scale.setScalar(cfg.scale);
  model.rotation.y = cfg.rotation;
  av.add(model);
  an = new AvatarAnimator(model, c);
}
function menu() {
  boot.replaceChildren();
  const h = document.createElement("h1");
  h.textContent = "AWAKEN";
  const list = document.createElement("div");
  list.className = "worlds";
  for (const x of worlds) {
    const b = document.createElement("button");
    b.className = "world" + (x === w ? " on" : "");
    b.textContent =
      x.identity.name +
      " · " +
      (x.identity.official ? "OFFICIAL / PROTECTED" : x.gameMode.kind);
    b.onclick = () => {
      w = x;
      menu();
    };
    list.append(b);
  }
  const studio = document.createElement("button");
  studio.className = "btn primary";
  studio.textContent = "AVATAR STUDIO";
  studio.onclick = openStudio;
  const play = document.createElement("button");
  play.className = "btn primary";
  play.textContent = "JACK IN";
  play.onclick = () => start(w);
  boot.append(h, list, studio, play);
}
function openStudio() {
  const draft = { ...cfg };
  boot.replaceChildren();
  const h = document.createElement("h1");
  h.textContent = "AVATAR STUDIO";
  const name = document.createElement("input");
  name.value = draft.name;
  name.setAttribute("aria-label", "Display name");
  name.oninput = () => (draft.name = name.value.toUpperCase());
  const grid = document.createElement("div");
  grid.className = "worlds";
  const select = (
    label: string,
    key: keyof typeof draft,
    choices: readonly string[],
  ) => {
    const row = document.createElement("div");
    row.textContent = label + " ";
    for (const choice of choices) {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = choice;
      b.onclick = () => {
        (draft as any)[key] = choice;
        setAvatar(builtIn(sanitizeAvatar(draft)));
        openStudio();
      };
      row.append(b);
    }
    grid.append(row);
  };
  select("BODY", "body", BODY);
  select("HAIR", "hair", HAIR);
  select("TOP", "top", TOPS);
  select("PANTS", "pants", PANTS);
  select("SHOES", "shoes", SHOES);
  select("HAT", "hat", HATS);
  select("GLASSES", "glasses", GLASSES);
  select("MASK", "mask", MASKS);
  select("BACKPACK", "backpack", BACKPACKS);
  for (const key of ["outfit", "accent", "skin", "hairColor"] as const) {
    const input = document.createElement("input");
    input.type = "color";
    input.value = (draft as any)[key];
    input.setAttribute("aria-label", key);
    input.oninput = () => {
      (draft as any)[key] = input.value;
      setAvatar(builtIn(sanitizeAvatar(draft)));
    };
    grid.append(input);
  }
  const random = document.createElement("button");
  random.className = "btn";
  random.textContent = "RANDOMIZE";
  random.onclick = () => {
    Object.assign(draft, randomAvatar());
    setAvatar(builtIn(draft));
    openStudio();
  };
  const save = document.createElement("button");
  save.className = "btn primary";
  save.textContent = "SAVE LOOK";
  save.onclick = () => {
    cfg = sanitizeAvatar(draft);
    saveConfig(cfg);
    savePreset(cfg.name, cfg);
    setAvatar(builtIn(cfg));
    lounge.sendAppearance(appearanceOf(cfg));
    menu();
  };
  const cancel = document.createElement("button");
  cancel.className = "btn";
  cancel.textContent = "CANCEL";
  cancel.onclick = () => {
    setAvatar(builtIn(cfg));
    menu();
  };
  const saved = document.createElement("div");
  for (const [label, look] of Object.entries(presets())) {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = label;
    b.onclick = () => {
      Object.assign(draft, look);
      setAvatar(builtIn(draft));
      openStudio();
    };
    saved.append(b);
  }
  const file = document.createElement("input");
  file.type = "file";
  file.accept = ".glb";
  file.onchange = async () => {
    const f = file.files?.[0];
    if (!f) return;
    try {
      const g = await parseGlb(f);
      await saveFile(f, cfg.seed + "");
      cfg.imported = f.name;
      setAvatar(g.model, g.clips);
      note = "LOCAL-ONLY GLB · remote players see your wardrobe avatar";
    } catch (e) {
      note = "IMPORT ERROR · " + (e as Error).message;
    }
  };
  boot.append(h, name, grid, random, save, cancel, saved, file);
}
menu();
const remotes = new Map<
  string,
  { root: T.Group; target: T.Vector3; yaw: number }
>();
let inputSeq = 0,
  networkClock = 0;
function tag(text: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 48;
  const x = c.getContext("2d")!;
  x.font = "18px monospace";
  x.textAlign = "center";
  x.fillStyle = "#f5e9ff";
  x.fillText(text, 128, 28);
  const q = new T.Sprite(
    new T.SpriteMaterial({
      map: new T.CanvasTexture(c),
      transparent: true,
      depthTest: false,
    }),
  );
  q.scale.set(1.6, 0.3, 1);
  q.position.y = 2.8;
  return q;
}
function upsertRemote(p: LoungePlayer) {
  if (loungeId === p.id) return;
  let remote = remotes.get(p.id);
  const remoteConfig = sanitizeAvatar({
    ...p.appearance,
    name: p.name,
    style: p.style,
  });
  const fingerprint = JSON.stringify(p.appearance || {});
  if (!remote || remote.root.userData.appearance !== fingerprint) {
    if (remote) s.remove(remote.root);
    const root = builtIn(remoteConfig);
    root.userData.appearance = fingerprint;
    root.add(tag(p.name));
    s.add(root);
    remote = { root, target: new T.Vector3(), yaw: p.yaw };
    remotes.set(p.id, remote);
  }
  remote.target.set(p.x, 0, p.z);
  remote.yaw = p.yaw;
  if (import.meta.env.DEV)
    (window as any).__AWAKEN_DEBUG = {
      ...(window as any).__AWAKEN_DEBUG,
      remoteCount: remotes.size,
      remotePosition: { x: p.x, z: p.z },
    };
}
function removeRemote(id: string) {
  const remote = remotes.get(id);
  if (remote) {
    s.remove(remote.root);
    remotes.delete(id);
    if (import.meta.env.DEV)
      (window as any).__AWAKEN_DEBUG = {
        ...(window as any).__AWAKEN_DEBUG,
        remoteCount: remotes.size,
      };
  }
}
function clearRemotes() {
  for (const id of remotes.keys()) removeRemote(id);
}
let loungeId = "";
const lounge = new LoungeClient({
  self: (id) => (loungeId = id),
  player: (p) => upsertRemote(p),
  remove: removeRemote,
  chat: (m) => {
    if (!muted.has(m.id)) {
      chatLog.textContent = `${m.id === loungeId ? "YOU" : "WANDERER"}: ${m.text}`;
    }
  },
  status: (_s, detail) => {
    note = detail;
    networkStatus.textContent = detail;
  },
});
const muted = new Set<string>();
const hero = new RapierCharacter();
await hero.ready;
try {
  if (cfg.imported) {
    const f = await getFile();
    if (f) {
      const g = await parseGlb(f);
      setAvatar(g.model, g.clips);
    } else {
      cfg.imported = undefined;
      saveConfig(cfg);
    }
  }
} catch {
  cfg.imported = undefined;
  saveConfig(cfg);
}
const mat = (c: number) =>
  new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1 });
let visual: T.Group | undefined;
function art(x: WorldManifest) {
  if (visual) s.remove(visual);
  for (const o of objects) s.remove(o);
  objects = [];
  visual = createWorldScene(x.id);
  visual.traverse((o) => {
    if (
      (o as T.Mesh).isMesh &&
      o.name !== "garden-ground" &&
      o.name !== "koi-hours-water"
    )
      objects.push(o as T.Mesh);
  });
  s.add(visual);
  s.background = new T.Color(x.scene.background);
  s.fog = new T.FogExp2(x.scene.fog, 0.014);
  for (const p of x.portals) {
    const o = new T.Mesh(
      new T.TorusGeometry(p.radius, 0.09, 8, 20),
      mat(0xff2e9a),
    );
    o.rotation.x = Math.PI / 2;
    o.position.set(...p.position);
    o.name = "portal-" + p.id;
    s.add(o);
    objects.push(o);
  }
}
function start(x: WorldManifest, spawn?: string) {
  if (!validateManifest(x)) throw Error("Invalid manifest");
  active = true;
  boot.style.display = "none";
  hud.style.display = "block";
  stickReset();
  keys.clear();
  art(x);
  hero.setWorld(x.scene.colliders, x.spawns[spawn || Object.keys(x.spawns)[0]]);
  if (x.id === "neon-course") course = restart(course);
  toggleChat(false);
  chatToggle.style.display = x.id === "awaken-lounge" ? "block" : "none";
  if (x.id === "awaken-lounge")
    lounge.connect({
      name: cfg.name,
      style: cfg.style,
      appearance: appearanceOf(cfg),
    });
  else {
    lounge.disconnect();
    loungeId = "";
    clearRemotes();
  }
}
function distance(
  p: { x: number; y: number; z: number },
  v: readonly number[],
) {
  return Math.hypot(p.x - v[0], p.y - v[1], p.z - v[2]);
}
function game() {
  const p = hero.state.position;
  for (const portal of w.portals)
    if (distance(p, portal.position) < portal.radius) {
      const next = worlds.find((x) => x.id === portal.targetWorld);
      if (next && next.spawns[portal.targetSpawn]) {
        w = next;
        start(next, portal.targetSpawn);
        note = "TRANSITION · " + next.identity.name;
      }
    }
  if (w.id === "neon-course") {
    course = courseEnter(course, performance.now());
    if (p.z < 4) course = checkpoint(course, 1);
    if (p.z < -3) course = checkpoint(course, 2);
    if (p.z < -9) {
      course = finish(course, performance.now());
      saveCourse();
    }
    const t = course.finished
      ? course.elapsed
      : performance.now() - (course.startedAt || performance.now());
    note = course.finished
      ? `FINISH ${(t / 1000).toFixed(2)}s · PB ${((course.best || t) / 1000).toFixed(2)}s`
      : `TRAVERSE ${Math.floor(t / 1000)}s · CP ${course.checkpoint}/2 · R restart`;
  }
}
function exitToMenu() {
  active = false;
  toggleChat(false);
  stickReset();
  mobileRun = false;
  keys.clear();
  lounge.disconnect();
  loungeId = "";
  clearRemotes();
  hud.style.display = "none";
  boot.style.display = "block";
  menu();
}
addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLElement && (e.target.matches("input, textarea, select") || e.target.isContentEditable)) return;
  if (e.code === "Escape" && active) {
    exitToMenu();
    return;
  }
  if (e.code === "KeyV") third = !third;
  if (e.code === "Space") {
    jump = true;
    e.preventDefault();
  }
  if (e.code === "KeyC") slide = true;
  if (e.code === "KeyR" && w.id === "neon-course") start(w, "start");
  keys.add(e.code);
});
addEventListener("blur", () => { keys.clear(); stickReset(); mobileRun = false; });
addEventListener("keyup", (e) => keys.delete(e.code));
let drag: { x: number; y: number } | undefined;
r.domElement.onpointerdown = (e) => {
  drag = { x: e.clientX, y: e.clientY };
  r.domElement.setPointerCapture(e.pointerId);
};
r.domElement.onpointermove = (e) => {
  if (drag) {
    yaw -= (e.clientX - drag.x) * 0.005;
    pitch = Math.max(-0.6, Math.min(0.5, pitch - (e.clientY - drag.y) * 0.004));
    drag = { x: e.clientX, y: e.clientY };
  }
};
r.domElement.onpointerup = () => (drag = undefined);
(hud.querySelector("#view") as HTMLButtonElement).onclick = () =>
  (third = !third);
(hud.querySelector("#menu") as HTMLButtonElement).onclick = exitToMenu;
const stick = hud.querySelector("#stick") as HTMLElement,
  nub = hud.querySelector("#nub") as HTMLElement;
let stickPointer: number | undefined;
function stickReset() {
  sx = sy = 0;
  stickPointer = undefined;
  nub.style.transform = "";
}
function stickMove(e: PointerEvent) {
  if (stickPointer !== e.pointerId) return;
  const b = stick.getBoundingClientRect(),
    x = e.clientX - b.left - 56,
    y = e.clientY - b.top - 56,
    l = Math.max(1, Math.hypot(x, y)),
    q = Math.min(40, l) / l;
  sx = (x * q) / 40;
  sy = (y * q) / 40;
  nub.style.transform = `translate(${x * q}px,${y * q}px)`;
}
stick.onpointerdown = (e) => {
  if (stickPointer !== undefined) return;
  stickPointer = e.pointerId;
  stick.setPointerCapture(e.pointerId);
  stickMove(e);
};
stick.onpointermove = stickMove;
stick.onpointerup = stickReset;
stick.onpointercancel = stickReset;
stick.onlostpointercapture = stickReset;
(hud.querySelector("#mjump") as HTMLButtonElement).onclick = () =>
  (jump = true);
(hud.querySelector("#mslide") as HTMLButtonElement).onclick = () =>
  (slide = true);
(hud.querySelector("#mview") as HTMLButtonElement).onclick = () =>
  (third = !third);
(hud.querySelector("#run") as HTMLButtonElement).onclick = () =>
  (mobileRun = !mobileRun);
function follow(p: { x: number; y: number; z: number }, dt: number) {
  // Rapier capsule center is 0.96 above its sole contact plane.
  av.position.set(p.x, p.y - 0.96, p.z);
  av.rotation.y = yaw + Math.PI;
  const target = new T.Vector3(p.x, p.y + 0.45, p.z);
  if (!third) {
    cam.position.lerp(target, 0.25);
    cam.rotation.set(pitch, yaw, 0, "YXZ");
    av.visible = false;
    return;
  }
  const ideal = new T.Vector3(
      p.x + Math.sin(yaw) * 4.4,
      p.y + 2.5,
      p.z + Math.cos(yaw) * 4.4,
    ),
    d = ideal.clone().sub(target).normalize();
  ray.set(target, d);
  const hit = ray.intersectObjects(objects.filter(o => !o.name.startsWith("portal-")))[0],
    wanted = hit
      ? target.clone().addScaledVector(d, Math.max(0.25, hit.distance - 0.15))
      : ideal;
  cam.position.lerp(wanted, Math.min(1, dt * 12));
  cam.lookAt(target);
  av.visible = true;
}
function loop(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (active) {
    acc = Math.min(0.12, acc + dt);
    while (acc >= TICK) {
      hero.step(
        {
          forward: (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0) - sy,
          right: (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0) + sx,
          yaw,
          sprint: keys.has("ShiftLeft") || mobileRun,
          jump,
          slide,
        },
        TICK,
      );
      jump = slide = false;
      acc -= TICK;
    }
    networkClock += dt;
    if (w.id === "awaken-lounge" && lounge.connected && networkClock > 1 / 20) {
      networkClock = 0;
      lounge.sendInput({
        forward: (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0) - sy,
        right: (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0) + sx,
        yaw,
        seq: ++inputSeq,
      });
    }
    for (const remote of remotes.values()) {
      remote.root.position.lerp(remote.target, Math.min(1, dt * 11));
      remote.root.rotation.y +=
        (remote.yaw - remote.root.rotation.y) * Math.min(1, dt * 11);
    }
    an.update(hero.state, dt);
    follow(hero.state.position, dt);
    game();
    where.textContent = `${w.identity.name} · ${cfg.name} · ${an.state.toUpperCase()}`;
    notice.textContent = note;
  }
  r.render(s, cam);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
