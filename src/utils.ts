export function getCPS() {
  return Game.cookiesPs * (1 - Game.cpsSucked);
}
/** Milliseconds to human readable time. Minimum accuracy, if set to 1000 will stop at seconds  */
export function formatTime(time: number, min = 1) {
  const ranges = [
    [31_536_000_000, 'y'],
    [86_400_000, 'd'],
    [3_600_000, 'h'],
    [60_000, 'm'],
    [1000, 's'],
    [1, 'ms'],
  ] as const;
  let output = '';
  for (const [ms, title] of ranges) {
    if (time < min) break;
    if (time < ms) continue;
    const val = Math.floor(time / ms);
    if (val !== 0) output += ` ${val}${title}`;
    time %= ms;
  }
  return output;
}
