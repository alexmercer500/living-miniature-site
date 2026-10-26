import test from 'node:test';
import assert from 'node:assert/strict';
import { flourishState } from '../src/lib/camera-flourish-state.ts';
import { heroJourneyState } from '../src/lib/hero-journey-state.ts';

test('flourishes are invisible at both camera endpoints, so handoffs stay exact',()=>{
  for(const p of [0,1,-1,2])assert.equal(flourishState(p).rim.opacity,0);
});
test('rim rides the reveal edge and glows only mid-handoff',()=>{
  for(let i=1;i<100;i++){
    const f=flourishState(i/100),s=heroJourneyState(i/100);
    assert.equal(f.rim.wipe,s.wipe);assert.ok(f.rim.opacity>=0&&f.rim.opacity<=.95);
  }
  assert.ok(flourishState(.48).rim.opacity>.9);
});
