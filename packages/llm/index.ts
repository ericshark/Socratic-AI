import { z } from "zod";

import {
  decisionDepthSchema,
  decisionMapSchema,
  forecastInputSchema,
  questionPackSchema,
} from "@core/index";

import { OpenAIAdapter } from "./adapters/openai";
import { MockAdapter } from "./adapters/mock";
import { BRIEF_PROMPT, CRITIC_PROMPT, MAPPER_PROMPT, QUESTION_PROMPT } from "./prompts";
import type { ChatMessage, LLMAdapter } from "./types";

const jsonArray = z.array(z.record(z.any()));

function safeJsonParse<T>(input: string, schema: z.ZodType<T>): T | null {
  try {
    const data = JSON.parse(input);
    const result = schema.safeParse(data);
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.warn(\"Failed to parse LLM output\", error);
  }
  return null;
}

export interface QuestionContext {
  problem: string;
  packName: string;
  map: z.infer<typeof decisionMapSchema>;
  transcript?: Array<{ q: string; a: string; ts?: string }>;
}

export function buildAdapter(options?: { apiKey?: string; mock?: boolean }) {
  if (options?.mock || !options?.apiKey) {
    return new MockAdapter();
  }

  return new OpenAIAdapter(options.apiKey);
}

export class QuestionEngine {
  constructor(private readonly adapter: LLMAdapter) {}

  async ask(
    context: QuestionContext,
    pack: z.infer<typeof questionPackSchema>,
    depth: z.infer<typeof decisionDepthSchema>,
  ) {
    const messages: ChatMessage[] = [
      {
        role: \"system\",
        content: QUESTION_PROMPT,
      },
      {
        role: \"user\",
        content: JSON.stringify({
          problem: context.problem,
          depth,
          pack,
          transcript: context.transcript ?? [],
          map: context.map,
        }),
      },
    ];

    const raw = await this.adapter.chat(messages, { temperature: 0.3 });
    const parsed = safeJsonParse(raw, jsonArray);
    if (parsed) {
      return parsed;
    }

    const next = pack.flow.slice(0, 3).map((step, index) => ({
      id: `${step.id}-fallback-${index}`,
      role: index === 0 ? \"coach\" : index === 1 ? \"critic\" : \"mapper\",
      text: step.text,
    }));

    return next;
  }
}

export class Mapper {
  constructor(private readonly adapter: LLMAdapter) {}

  async normalize(transcript: Array<{ q: string; a: string; ts?: string }>) {
    if (!transcript.length) {
      return decisionMapSchema.parse({
        assumptions: [],
        options: [],
        evidence: [],
        risks: [],
        criteria: [],
        biasFlags: [],
      });
    }

    const messages: ChatMessage[] = [
      { role: \"system\", content: MAPPER_PROMPT },
      { role: \"user\", content: JSON.stringify(transcript) },
    ];

    const raw = await this.adapter.chat(messages, { temperature: 0.1 });
    const parsed = safeJsonParse(raw, decisionMapSchema);
    if (parsed) {
      return parsed;
    }

    const assumptions = transcript
      .filter((entry) => /assumption|must be true|we believe/i.test(entry.q) || /assume|believe/i.test(entry.a))
      .map((entry, index) => ({ text: entry.a.trim(), confidence: Math.max(0.2, 0.7 - index * 0.05) }));

    const options = transcript
      .filter((entry) => /option|alternative|path/i.test(entry.q + entry.a))
      .map((entry) => ({ text: entry.a.trim(), notes: entry.q }));

    const evidence = transcript
      .filter((entry) => /evidence|signal|data/i.test(entry.q + entry.a))
      .map((entry, index) => ({ text: entry.a.trim(), weight: Math.max(0.2, 0.6 - index * 0.1) }));

    const risks = transcript
      .filter((entry) => /risk|concern|fail/i.test(entry.q + entry.a))
      .map((entry) => ({ text: entry.a.trim(), mitigation: undefined as string | undefined }));

    const criteriaEntries = transcript
      .filter((entry) => /criteria|evaluate|decide/i.test(entry.q + entry.a))
      .map((entry) => ({ name: entry.a.trim(), weight: 1 / transcript.length }));
    const criteria = criteriaEntries.length
      ? criteriaEntries.map((item) => ({ ...item, weight: Number((1 / criteriaEntries.length).toFixed(2)) }))
      : [];

    const biasFlags = [];
    if (options.length <= 1) {
      biasFlags.push({ type: \"single-option\", note: \"Only one option discussed.\" });
    }
    if (assumptions.every((assumption) => assumption.confidence > 0.7)) {
      biasFlags.push({ type: \"confirmation\", note: \"All assumptions show high confidence.\" });
    }

    return decisionMapSchema.parse({
      assumptions,
      options,
      evidence,
      risks,
      criteria,
      biasFlags,
    });
  }
}

export class Critic {
  constructor(private readonly adapter: LLMAdapter) {}

  async devilAdvocate(problem: string, map: z.infer<typeof decisionMapSchema>) {
    const raw = await this.adapter.chat(
      [
        { role: \"system\", content: CRITIC_PROMPT },
        { role: \"user\", content: JSON.stringify({ problem, map }) },
      ],
      { temperature: 0.4 },
    );
\n    if (raw.includes(\"-\")) {\n      return raw;\n    }\n\n    return [\n      \"- **Evidence gap** — Collect quantitative signal to support the leading option.\",\n      \"- **Missing alternative** — Explore a do-nothing baseline for contrast.\",\n      \"- **Bias alert** — Challenge assumptions with an external review.\",\n    ].join(\"\\n\");\n  }\n}\n\nexport class Summarizer {\n  constructor(private readonly adapter: LLMAdapter) {}\n\n  async decisionBrief(\n    input: {\n      problem: string;\n      map: z.infer<typeof decisionMapSchema>;\n      forecasts: Array<z.infer<typeof forecastInputSchema> & { outcome?: number | null }>;\n      revealAllowed?: boolean;\n    },\n  ) {\n    const response = await this.adapter.chat(\n      [\n        { role: \"system\", content: BRIEF_PROMPT },\n        { role: \"user\", content: JSON.stringify(input) },\n      ],\n      { temperature: 0.2 },\n    );\n\n    if (response.startsWith(\"##\")) {\n      return response;\n    }\n\n    const { problem, map, forecasts } = input;\n    const assumptions = map.assumptions.map((item) => `- ${item.text} (${Math.round(item.confidence * 100)}% confidence)`).join(\"\\n\");\n    const options = map.options.map((item) => `- ${item.text}`).join(\"\\n\");\n\n    return [\n      \"## Context\",\n      problem,\n      \"\\n## Assumptions\",\n      assumptions || \"- None captured yet\",\n      \"\\n## Options\",\n      options || \"- Explore alternatives\",\n      \"\\n## Forecasts & Review Dates\",\n      forecasts\n        .map(\n          (forecast) =>\n            `- ${forecast.statement} — ${(forecast.probability * 100).toFixed(0)}% by ${new Date(\n              forecast.dueAt,\n            ).toLocaleDateString()}`,\n        )\n        .join(\"\\n\") || \"- No forecasts\",\n    ].join(\"\\n\\n\");\n  }\n}\n\nexport function createLLMServices(options?: { apiKey?: string; mock?: boolean }) {\n  const adapter = buildAdapter(options);\n\n  return {\n    adapter,\n    questions: new QuestionEngine(adapter),\n    mapper: new Mapper(adapter),\n    critic: new Critic(adapter),\n    summarizer: new Summarizer(adapter),\n  };\n}\n*** End Patch
