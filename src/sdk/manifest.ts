export const MANIFEST_VERSION = 1 as const;
export type Vec3 = readonly [number, number, number];
export type Collider = { type: 'box'; position: Vec3; size: Vec3 } | { type: 'ramp'; position: Vec3; size: Vec3; rise: number };
export type Portal = { id: string; position: Vec3; radius: number; targetWorld: string; targetSpawn: string };
export interface WorldManifest { version: typeof MANIFEST_VERSION; id: string; identity: { name: string; author: string; official?: boolean }; scene: { background: number; fog: number; colliders: Collider[] }; spawns: Record<string, Vec3>; portals: Portal[]; triggers: { id: string; position: Vec3; radius: number; message: string }[]; gameMode: { kind: 'social' | 'course' | 'arena'; localOnly: true }; access: { visibility: 'public' | 'protected'; build: 'owner' | 'none' } }
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const vec = (v: unknown): v is Vec3 => Array.isArray(v) && v.length === 3 && v.every(finite);
export function validateManifest(input: unknown): input is WorldManifest { const w=input as WorldManifest; return !!w && w.version===MANIFEST_VERSION && /^[a-z0-9-]{2,48}$/.test(w.id) && !!w.identity && typeof w.identity.name==='string' && !!w.scene && Array.isArray(w.scene.colliders) && !!w.spawns && Object.values(w.spawns).every(vec) && Array.isArray(w.portals) && Array.isArray(w.triggers) && !!w.gameMode && w.gameMode.localOnly===true && !!w.access; }
