export function brierScore(probability: number, outcome: 0 | 1) {
  const error = probability - outcome;
  return Number((error * error).toFixed(4));
}
