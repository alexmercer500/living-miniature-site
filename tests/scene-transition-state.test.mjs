import test from 'node:test';
import assert from 'node:assert/strict';
import { heroJourneyState } from '../src/lib/hero-journey-state.ts';
import { sceneTransitionState,sceneEntryState,sceneHandoffRange } from '../src/lib/scene-transition-state.ts';

test('later cameras preserve the approved first transition at every scroll position',()=>{
  for(let i=0;i<=100;i++)assert.deepEqual(sceneTransitionState(i/100),heroJourneyState(i/100));
  const last=sceneTransitionState(.5,true),first=heroJourneyState(.5);
  assert.equal(last.mask,first.mask);assert.equal(last.incomingScale,first.incomingScale);
  assert.ok(last.outgoingScale<first.outgoingScale&&last.outgoingScale>1);
});
test('all arrival groups are bounded, staggered, reversible and readable before the anchor',()=>{
  for(const [kind,count] of [['card',3],['sign',3],['wish',6],['note',1]]){
    for(let i=0;i<count;i++){
      const states=Array.from({length:101},(_,n)=>sceneEntryState(n/100,i,kind));
      for(let n=100;n>=0;n--){
        const s=sceneEntryState(n/100,i,kind);assert.deepEqual(s,states[n]);
        assert.ok(s.opacity>=.12&&s.opacity<=1&&s.y>=0&&s.y<=44&&Math.abs(s.rotation)<=8&&s.scale>=.95&&s.scale<=1);
        if(n)assert.ok(states[n-1].opacity<=s.opacity);
      }
      const end=sceneEntryState(.84,i,kind);assert.equal(end.opacity,1);assert.equal(end.y,0);assert.ok(end.rotation===0);assert.equal(end.scale,1);assert.equal(end.tilt,0);
    }
    if(count>1)assert.ok(sceneEntryState(.35,0,kind).opacity>sceneEntryState(.35,count-1,kind).opacity);
  }
});
test('envelope exit starts after its opening track, and adds no scroll distance',()=>{
  assert.deepEqual(sceneHandoffRange(1800,900),{start:900,end:1800});
  // Invitation starts at 1800; 3600px opening track ends at 5400, exit ends 6300.
  assert.deepEqual(sceneHandoffRange(6300,900),{start:5400,end:6300});
  assert.deepEqual(sceneHandoffRange(700,900),{start:0,end:700});
});
