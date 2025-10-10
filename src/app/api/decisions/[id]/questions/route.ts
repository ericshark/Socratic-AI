import { NextRequest } from "next/server";
import { z } from "zod";

import { decisionMapSchema, questionPackSchema } from "@core/index";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json } from "@/server/http";
import { llm } from "@/server/llm";

interface RouteContext {
  params: { id: string };
}

const fallbackPack: z.infer<typeof questionPackSchema> = {
  slug: "socratic-default",
  name: "Socratic Default",
  category: "general",
  description: "A lightweight coaching flow when no bespoke question pack is selected.",
  flow: [
    { id: "clarify-problem", type: "prompt", text: "What decision are you exploring right now?" },
    { id: "surface-assumptions", type: "prompt", text: "Which assumptions must hold true for success?" },
    { id: "explore-evidence", type: "prompt", text: "What evidence supports or challenges your current direction?" },
    { id: "consider-options", type: "prompt", text: "What meaningful options or alternatives can we compare?" },
    { id: "highlight-risks", type: "prompt", text: "What risks or downsides should we deliberately surface?" },
  ],
  revealRules: {},
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const decisionAccess = await assertDecisionAccess(session.user.id, params.id);

    const decision = await prisma.decision.findUnique({
      where: { id: decisionAccess.id },
      include: {
        pack: true,
        map: true,
      },
    });

    if (!decision) {
      throw new ApiError(404, "Decision not found");
    }

    const promptSession = await prisma.promptSession.findUnique({
      where: {
        decisionId_userId: {
          decisionId: decision.id,
          userId: session.user.id,
        },
      },
    });

    const transcript = Array.isArray(promptSession?.transcript)
      ? (promptSession?.transcript as Array<{ q: string; a: string; ts?: string }>)
      : [];

    const mapCandidate = decision.map
      ? {
          assumptions: decision.map.assumptions ?? [],
          options: decision.map.options ?? [],
          evidence: decision.map.evidence ?? [],
          risks: decision.map.risks ?? [],
          criteria: decision.map.criteria ?? [],
          biasFlags: decision.map.biasFlags ?? [],
        }
      : undefined;

    const map = decisionMapSchema.parse(
      mapCandidate ?? {
        assumptions: [],
        options: [],
        evidence: [],
        risks: [],
        criteria: [],
        biasFlags: [],
      },
    );

    const pack = decision.pack
      ? questionPackSchema.parse({
          slug: decision.pack.slug,
          name: decision.pack.name,
          category: decision.pack.category,
          description: decision.pack.description,
          flow: decision.pack.flow as unknown,
          revealRules: decision.pack.revealRules as unknown,
        })
      : fallbackPack;

    const questions = await llm.questions.ask(
      {
        problem: decision.problem,
        packName: pack.name,
        map,
        transcript,
      },
      pack,
      decision.depth,
    );

    return json({
      questions: questions.map((question, index) => ({
        id: question.id ?? `${decision.id}-question-${index}`,
        role: question.role,
        text: question.text,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
