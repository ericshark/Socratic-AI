import { describe, expect, it } from "vitest";

import { evaluateReveal, detectBiases } from "@/server/services/reveal";

const baseMap = {
  assumptions: [
    { text: "Users want async reviews", confidence: 0.7 },
    { text: "Leaders respond if asked well", confidence: 0.8 },
    { text: "We can ship in two sprints", confidence: 0.6 },
  ],
  options: [
    { text: "Ship focus mode" },
    { text: "Do nothing" },
  ],
  evidence: [],
  risks: [{ text: "Low engagement", mitigation: "Seed templates" }],
  criteria: [{ name: "Impact", weight: 0.5 }],
  biasFlags: [],
};

describe("Answer-Delay evaluation", () => {
  it("grants reveal when thresholds met", () => {
    const result = evaluateReveal(baseMap, {
      minAssumptions: 3,
      minAlternatives: 1,
      minTopRisks: 1,
    });
    expect(result.allowed).toBe(true);
    expect(result.status.minAssumptions).toBe(true);
  });

  it("blocks reveal if not enough alternatives", () => {
    const result = evaluateReveal(
      { ...baseMap, options: [{ text: "Only option" }] },
      { minAssumptions: 2, minAlternatives: 2, minTopRisks: 1 },
    );
    expect(result.allowed).toBe(false);
    expect(result.status.minAlternatives).toBe(false);
  });
});

describe("Bias detection", () => {
  it("adds single-option flag", () => {
    const flags = detectBiases({ ...baseMap, options: [{ text: "Only choice" }], biasFlags: [] });
    expect(flags.some((flag) => flag.type === "single-option")).toBe(true);
  });

  it("deduplicates existing bias flags", () => {
    const flags = detectBiases({
      ...baseMap,
      options: [{ text: "Only choice" }],
      biasFlags: [{ type: "single-option", note: "Pre-existing" }],
    });
    expect(flags.filter((flag) => flag.type === "single-option")).toHaveLength(1);
  });
});
