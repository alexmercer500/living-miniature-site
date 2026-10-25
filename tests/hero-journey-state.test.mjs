import test from 'node:test';
import assert from 'node:assert/strict';
import { heroJourneyState,journeyMemoryState } from '../src/lib/hero-journey-state.ts';

test('camera has exact original-art endpoints and an early readable end hold',()=>{
  const a=heroJourneyState(0),b=heroJourneyState(1);
  assert.equal(a.outgoingScale,1);assert.equal(a.outgoingX,0);assert.equal(a.heroCopyOpacity,1);
  assert.equal(a.clip,'inset(100% 0 0 0)');assert.equal(b.clip,'inset(0)');
  assert.equal(b.incomingScale,1);assert.equal(b.incomingX,0);assert.equal(b.journeyCopyY,0);assert.equal(b.journeyCopyOpacity,1);
  assert.equal(heroJourneyState(.84).clip,'inset(0)');assert.equal(heroJourneyState(.96).pathOffset,0);
});
test('reveal is monotonic, bounded and uses an organic edge between endpoints',()=>{
  let last=0;
  for(let i=0;i<=100;i++){
    const s=heroJourneyState(i/100);assert.ok(s.incoming>=last&&s.incoming<=1);last=s.incoming;
    assert.ok(s.outgoingScale>=1&&s.outgoingScale<=1.12);assert.ok(s.incomingScale>=1&&s.incomingScale<=1.11);
    assert.ok(s.branchOpacity>=0&&s.branchOpacity<=.76);
  }
  assert.ok(heroJourneyState(.5).clip.startsWith('polygon('));
});
test('reverse scrolling and repeated sampling never accumulate motion state',()=>{
  const states=Array.from({length:101},(_,i)=>heroJourneyState(i/100));
  for(let i=100;i>=0;i--)assert.deepEqual(heroJourneyState(i/100),states[i]);
  assert.deepEqual(heroJourneyState(-1),heroJourneyState(0));assert.deepEqual(heroJourneyState(2),heroJourneyState(1));
});
test('keepsakes are staggered, restrained and fully settled before arrival',()=>{
  assert.ok(journeyMemoryState(.3,0).opacity>journeyMemoryState(.3,2).opacity);
  for(let i=0;i<3;i++){
    assert.deepEqual(journeyMemoryState(1,i),{y:0,rotation:0,opacity:1});
    assert.equal(journeyMemoryState(.8,i).opacity,1);
    for(let j=0;j<=100;j++){
      const s=journeyMemoryState(j/100,i);assert.ok(s.y>=0&&s.y<=56&&s.opacity>=.12&&s.opacity<=1&&Math.abs(s.rotation)<=6);
    }
  }
});
