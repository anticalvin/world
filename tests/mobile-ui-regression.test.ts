import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
const anim=readFileSync(new URL('../src/avatar/animation.ts',import.meta.url),'utf8');
describe('mobile regression safeguards',()=>{
 it('gates chat on static GitHub Pages without a websocket',()=>{
  expect(main).toContain('const liveChatConfigured =');
  expect(main).toContain('chatToggle.hidden = !liveChatConfigured');
  expect(main).toContain('liveChatConfigured && open && w.id');
 });
 it('does not tilt idle shoulder joints out of alignment',()=>{
  expect(anim).toContain('rotation.z = 0;');
  expect(anim).not.toContain('side === "LEFT" ? -0.08 : 0.08');
 });
});
