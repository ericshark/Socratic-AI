import { z } from "zod";

export const decisionDepthSchema = z.enum(["quick", "standard", "deep"]);
export type DecisionDepth = z.infer<typeof decisionDepthSchema>;

export const decisionStatusSchema = z.enum(["in_progress", "locked", "decided"]);
export type DecisionStatus = z.infer<typeof decisionStatusSchema>;

export const roleSchema = z.enum(["owner", "admin", "member"]);
export type TeamRole = z.infer<typeof roleSchema>;

export const promptRoleSchema = z.enum(["questioner", "critic", "mapper"]);

export const biasFlagSchema = z.object({
  type: z.string(),
  note: z.string().optional(),
});

export const assumptionSchema = z.object({
  text: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.5),
});

export const optionSchema = z.object({
  text: z.string().min(1),
  notes: z.string().optional(),
});

export const evidenceSchema = z.object({
  text: z.string().min(1),
  link: z.string().url().optional(),
  weight: z.number().min(0).max(1).optional(),
});

export const riskSchema = z.object({
  text: z.string().min(1),
  mitigation: z.string().optional(),
});

export const criteriaSchema = z.object({
  name: z.string().min(1),
  weight: z.number().min(0).max(1).default(0.2),
});

export const decisionMapSchema = z.object({
  assumptions: z.array(assumptionSchema).default([]),
  options: z.array(optionSchema).default([]),
  evidence: z.array(evidenceSchema).default([]),
  risks: z.array(riskSchema).default([]),
  criteria: z.array(criteriaSchema).default([]),
  biasFlags: z.array(biasFlagSchema).default([]),
});

export type DecisionMapInput = z.infer<typeof decisionMapSchema>;

export const questionFlowStepSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["prompt", "check", "branch"]).default("prompt"),
  text: z.string().min(1),
  condition: z.string().optional(),
});

export const questionPackSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(3),
  category: z.string().min(2),
  description: z.string().min(10),
  flow: z.array(questionFlowStepSchema).min(1),
  revealRules: z.object({
    minAssumptions: z.number().int().nonnegative().optional(),
    minAlternatives: z.number().int().nonnegative().optional(),
    minTopRisks: z.number().int().nonnegative().optional(),
  }),
});

export type QuestionPackInput = z.infer<typeof questionPackSchema>;

export const createDecisionSchema = z.object({
  title: z.string().min(3),
  problem: z.string().min(10),
  depth: decisionDepthSchema,
  packSlug: z.string().optional(),
  teamId: z.string().optional(),
});

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;

export const answerStepSchema = z.object({
  stepId: z.string().min(1),
  answer: z.string().min(1),
});

export const updateDecisionMapSchema = z.object({
  assumptions: z.array(assumptionSchema).optional(),
  options: z.array(optionSchema).optional(),
  evidence: z.array(evidenceSchema).optional(),
  risks: z.array(riskSchema).optional(),
  criteria: z.array(criteriaSchema).optional(),
  biasFlags: z.array(biasFlagSchema).optional(),
});

export const forecastInputSchema = z.object({
  statement: z.string().min(5),
  probability: z.number().min(0).max(1),
  dueAt: z.coerce.date(),
});

export type ForecastInput = z.infer<typeof forecastInputSchema>;

export const resolveForecastSchema = z.object({
  outcome: z.union([z.literal(0), z.literal(1)]),
});

export const startTeamRoundSchema = z.object({
  phase: z.enum(["private_input", "merge", "review"]).default("private_input"),
  entries: z.record(z.any()).optional(),
});

export const mergeRoundSchema = z.object({
  heatmap: z.any().optional(),
});

export const scheduleReviewSchema = z.object({
  reviewAt: z.coerce.date(),
});

export const decisionBriefSectionSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export const revealRuleSchema = questionPackSchema.shape.revealRules;

export type RevealRules = z.infer<typeof revealRuleSchema>;

export const checkRevealSchema = z.object({
  map: decisionMapSchema,
  rules: revealRuleSchema,
});

export const meResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    image: z.string().nullable(),
  }),
  teams: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      role: roleSchema,
    }),
  ),
  usage: z.object({
    decisions: z.number(),
    forecasts: z.number(),
  }),
});

export type MeResponse = z.infer<typeof meResponseSchema>;

export const answerDelayRulesSchema = z.object({
  minAssumptions: z.number().int().nonnegative().default(0),
  minAlternatives: z.number().int().nonnegative().default(0),
  minTopRisks: z.number().int().nonnegative().default(0),
});

export type AnswerDelayRules = z.infer<typeof answerDelayRulesSchema>;

export const llmQuestionStepSchema = z.object({
  id: z.string(),
  role: z.enum(["coach", "critic", "mapper"]).default("coach"),
  text: z.string(),
});

export type LlmQuestionStep = z.infer<typeof llmQuestionStepSchema>;

export const llmMapOutputSchema = decisionMapSchema.extend({
  summary: z.string().optional(),
});

export type LlmMapOutput = z.infer<typeof llmMapOutputSchema>;
