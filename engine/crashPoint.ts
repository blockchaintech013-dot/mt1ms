
/**
 * TEMPORARY DEMO CRASH-POINT GENERATOR.
 *
 * Replace this with the exact drawCrashPoint() implementation
 * from your existing src/lib/shabikia.ts before final integration.
 *
 * This currently produces a uniform demo crash point between
 * 1.00x and 10.00x. It is not a production fairness algorithm.
 */
export function drawCrashPoint(): number {
  const minimum = 1;
  const maximum = 10;

  const value = minimum + Math.random() * (maximum - minimum);

  return Math.max(1, Math.floor(value * 100) / 100);
}
