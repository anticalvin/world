import { describe, expect, it } from 'vitest';
import { createBoxer, punch, ringPosition, tickBoxer, takeHit } from '../src/game/boxing';
import { worlds } from '../src/sdk/worlds';
describe('DELTA-9 solo training',()=>{
 it('spawns inside the ring with a reachable return portal',()=>{const ring=worlds.find(w=>w.id==='delta-9')!;expect(ringPosition(ring.spawns.entry[0],ring.spawns.entry[2]).bounced).toBe(false);expect(ringPosition(ring.portals[0].position[0],ring.portals[0].position[2]).bounced).toBe(false);});
 it('has separate punches with cooldown and stamina',()=>{const b=createBoxer();expect(punch(b,'left').landed).toBe(true);expect(punch(b,'right').landed).toBe(false);tickBoxer(b,.3);expect(punch(b,'right').damage).toBe(14);});
 it('clamps to ropes',()=>{expect(ringPosition(99,-99)).toEqual({x:4.2,z:-8.2,bounced:true});});
 it('guard mitigates damage',()=>{const b=createBoxer();b.guarding=true;takeHit(b,20);expect(b.health).toBe(95);});
});
