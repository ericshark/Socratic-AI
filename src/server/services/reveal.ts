import { AnswerDelayRules, DecisionMapInput, answerDelayRulesSchema, decisionMapSchema } from "@core/index";

import { average } from "@/lib/utils";

export function evaluateReveal(map: DecisionMapInput, rawRules: Partial<AnswerDelayRules>) {
  const rules = answerDelayRulesSchema.parse(rawRules);
  const status = {
    minAssumptions: map.assumptions.length >= (rules.minAssumptions ?? 0),
    minAlternatives: map.options.length >= (rules.minAlternatives ?? 0),
    minTopRisks: map.risks.length >= (rules.minTopRisks ?? 0),
  } as const;

  const allowed = Object.values(status).every(Boolean);

  return { allowed, status };
}

export function detectBiases(map: DecisionMapInput) {
  const flags = [...(map.biasFlags ?? [])];

  if (map.options.length <= 1 && !flags.some((flag) => flag.type === "single-option")) {
    flags.push({ type: "single-option", note: "Add at least one credible alternative." });
  }

  if (map.assumptions.length && map.assumptions.every((assumption) => assumption.confidence >= 0.8)) {
    flags.push({ type: "confirmation", note: "All assumptions show high confidence." });
  }

  const weights = map.criteria.map((criterion) => criterion.weight ?? 0);
  if (weights.length) {
    const mean = average(weights);
    const maxDelta = Math.max(...weights) - mean;
    if (maxDelta > 0.4) {
      flags.push({ type: "anchoring", note: "Criteria weights heavily favour one dimension." });
    }
  }

  const uniqueFlags = flags.reduce<DecisionMapInput["biasFlags"]>((acc, flag) => {
    if (!acc.some((existing) => existing.type === flag.type)) {
      acc.push(flag);
    }
    return acc;
  }, []);

  return uniqueFlags;
}

export function normaliseMap(input: DecisionMapInput) {
  return decisionMapSchema.parse({
    ...input,
    assumptions: input.assumptions ?? [],
    options: input.options ?? [],
    evidence: input.evidence ?? [],
    risks: input.risks ?? [],
    criteria: input.criteria ?? [],
    biasFlags: detectBiases({ ...input, biasFlags: input.biasFlags ?? [] }),
  });
}
