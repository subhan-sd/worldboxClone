import test from 'node:test';
import assert from 'node:assert';
import { SeededRNG } from '../random/seeded-rng';

test('SeededRNG produces identical sequences from the same seed', () => {
  const rng1 = new SeededRNG(42);
  const rng2 = new SeededRNG(42);

  const seq1 = Array.from({ length: 20 }, () => rng1.next());
  const seq2 = Array.from({ length: 20 }, () => rng2.next());

  assert.deepStrictEqual(seq1, seq2);
});

test('SeededRNG produces different sequences from different seeds', () => {
  const rng1 = new SeededRNG(42);
  const rng2 = new SeededRNG(999);

  assert.notStrictEqual(rng1.next(), rng2.next());
});

test('nextInt respects inclusive bounds', () => {
  const rng = new SeededRNG(12345);
  for (let i = 0; i < 100; i++) {
    const val = rng.nextInt(5, 10);
    assert.ok(val >= 5 && val <= 10, `val ${val} out of bounds`);
    assert.strictEqual(Math.floor(val), val);
  }
});

test('state restoration resumes exact sequence', () => {
  const rng = new SeededRNG(777);
  for (let i = 0; i < 10; i++) rng.next();

  const savedState = rng.getState();
  const nextThreeExpected = [rng.next(), rng.next(), rng.next()];

  rng.setState(savedState);
  const nextThreeActual = [rng.next(), rng.next(), rng.next()];

  assert.deepStrictEqual(nextThreeActual, nextThreeExpected);
});
