import { describe, expect, it } from 'vitest';
import main from '../src/main.ts?raw';
import anim from '../src/avatar/animation.ts?raw';
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
