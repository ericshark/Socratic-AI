import { describe, expect, it } from "vitest";

import { brierScore } from "@/server/services/forecast";

describe("brierScore", () => {
  it("is zero for perfect forecast", () => {
    expect(brierScore(1, 1)).toBe(0);
    expect(brierScore(0, 0)).toBe(0);
  });

  it("penalises confident misses", () => {
    expect(brierScore(0.9, 0)).toBeCloseTo(0.81);
  });

  it("rounds to four decimals", () => {
    expect(brierScore(0.33, 1)).toBeCloseTo(0.4489, 4);
  });
});
