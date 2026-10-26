import test from 'node:test';
import assert from 'node:assert/strict';
import { flourishState } from '../src/lib/camera-flourish-state.ts';
import { heroJourneyState } from '../src/lib/hero-journey-state.ts';

test('flourishes are invisible at both camera endpoints, so handoffs stay exact',()=>{
  for(const p of [0,1,-1,2]){const f=flourishState(p);assert.equal(f.rim.opacity,0);assert.equal(f.sweep.opacity,0);assert.ok(f.petals.every(x=>x.opacity===0));}
});
test('rim rides the reveal edge and glows only mid-handoff',()=>{
  for(let i=1;i<100;i++){
    const f=flourishState(i/100),s=heroJourneyState(i/100);
    assert.equal(f.rim.wipe,s.wipe);assert.ok(f.rim.opacity>=0&&f.rim.opacity<=.95);
  }
  assert.ok(flourishState(.48).rim.opacity>.9);
});
test('petals are pure functions of progress: scrolling back replays them exactly',()=>{
  const forward=Array.from({length:101},(_,i)=>flourishState(i/100).petals);
  for(let i=100;i>=0;i--)assert.deepEqual(flourishState(i/100).petals,forward[i]);
  const mid=flourishState(.45).petals;assert.ok(mid.filter(p=>p.opacity>0).length>=6,'most petals visible mid-handoff');
  for(const p of mid)assert.ok(p.opacity<=1&&Math.abs(p.flip)<=1&&p.x>-5&&p.x<105);
});
test('light sweep crosses once, only while the new scene settles',()=>{
  assert.equal(flourishState(.4).sweep.opacity,0);assert.ok(flourishState(.73).sweep.opacity>.85);
  let last=-Infinity;for(let i=0;i<=100;i++){const x=flourishState(i/100).sweep.x;assert.ok(x>=last);last=x;}
});
