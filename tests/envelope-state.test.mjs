import test from 'node:test';
import assert from 'node:assert/strict';
import { envelopeState, envelopeLayout } from '../src/lib/envelope-state.ts';

test('the envelope has stable closed and readable open endpoints', () => {
  const closed = envelopeState(0);
  assert.equal(closed.lift, 0);
  assert.equal(closed.seal, 0);
  assert.equal(closed.flap, 0);
  assert.equal(closed.card, 0);
  assert.equal(closed.opened, false);
  const open = envelopeState(1);
  assert.equal(open.seal, 1);
  assert.equal(open.flap, 1);
  assert.equal(open.card, 1);
  assert.equal(open.lift, 1);
  assert.equal(open.present, 1);
  assert.equal(open.cardLayer, 6);
  assert.equal(open.opened, true);
  assert.deepEqual(envelopeState(-3), closed);
  assert.deepEqual(envelopeState(4), open);
});

test('the envelope floats off the table before the seal releases', () => {
  assert.ok(envelopeState(.15).lift > 0);
  assert.equal(envelopeState(.15).seal, 0);
  assert.equal(envelopeState(.15).flap, 0);
  assert.equal(envelopeState(.25).lift, 1);
  assert.equal(envelopeState(.25).seal, 0);
});

test('paper clears the pocket before moving in front of the envelope', () => {
  assert.equal(envelopeState(.36).seal, 1);
  assert.equal(envelopeState(.36).card, 0);
  assert.equal(envelopeState(.46).card, 0);
  assert.equal(envelopeState(.5).flap, 1);
  assert.equal(envelopeState(.5).flapLayer, 1);
  assert.equal(envelopeState(.6).cardLayer, 2);
  assert.equal(envelopeState(.78).card, 1);
  assert.equal(envelopeState(.78).present, 0);
  assert.equal(envelopeState(.78).opened, false);
  assert.equal(envelopeState(.9).cardLayer, 6);
  assert.equal(envelopeState(1).opened, true);
});

test('lift and presentation overshoot softly and return to exact endpoints', () => {
  const poses = Array.from({ length: 501 }, (_, i) => envelopeState(i / 500));
  assert.ok(poses.some(pose => pose.liftSpring > 1.05));
  assert.ok(poses.some(pose => pose.presentSpring > 1.05));
  for (const pose of poses) {
    assert.ok(pose.liftSpring >= 0 && pose.liftSpring < 1.3);
    assert.ok(pose.presentSpring >= 0 && pose.presentSpring < 1.3);
  }
  assert.equal(envelopeState(1).presentSpring, 1);
});

test('layout keeps extracted paper below the header and foreground card above actions', () => {
  for (const [height, rigHeight, cardHeight] of [[900,350,368], [844,212,300], [568,174,280]]) {
    const layout = envelopeLayout(height, rigHeight, cardHeight, 60);
    const paperTop = layout.extractCenter - .45 * rigHeight - cardHeight * 1.08;
    assert.ok(paperTop >= 87.99);
    const frontTop = layout.presentCenter - .45 * rigHeight + layout.frontOffset;
    assert.ok(frontTop >= 88);
    assert.ok(frontTop + cardHeight <= height - 123.99);
    assert.ok(layout.restCenter < height * .7);
  }
});

test('reverse scroll reproduces the same geometry without accumulated state', () => {
  const forward = Array.from({ length: 501 }, (_, i) => envelopeState(i / 500));
  for (let i = 500; i >= 0; i--) {
    const current = envelopeState(i / 500);
    assert.deepEqual(current, forward[i]);
    for (const key of ['lift', 'seal', 'flap', 'card', 'present']) {
      assert.ok(current[key] >= 0 && current[key] <= 1);
      if (i > 0) assert.ok(current[key] >= forward[i - 1][key]);
    }
  }
});
