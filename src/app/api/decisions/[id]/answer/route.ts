import { NextRequest } from "next/server";

import { answerStepSchema, decisionMapSchema } from "@core/index";

import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json, parseJsonBody } from "@/server/http";
import { llm } from "@/server/llm";
import { normaliseMap } from "@/server/services/reveal";

interface RouteContext {
  params: { id: string };
}

function mergeByText<T extends { text: string }>(existing: T[], updates: T[]) {
  const copy = [...existing];
  for (const item of updates) {
    if (!copy.some((entry) => entry.text.trim().toLowerCase() === item.text.trim().toLowerCase())) {
      copy.push(item);
    }
  }
  return copy;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const limiter = rateLimit(`answer:${session.user.id}`);
    if (!limiter.allowed) {
      throw new ApiError(429, "Rate limit exceeded");
    }

    const body = await parseJsonBody(request, answerStepSchema);

    const decision = await assertDecisionAccess(session.user.id, params.id);

    const pack = decision.packId
      ? await prisma.questionPack.findUnique({ where: { id: decision.packId } })
      : null;
    const step = pack?.flow?.find?.((item: { id: string }) => item.id === body.stepId);

    let promptSession = await prisma.promptSession.findUnique({
      where: {
        decisionId_userId: {
          decisionId: decision.id,
          userId: session.user.id,
        },
      },
    });

    if (!promptSession) {
      promptSession = await prisma.promptSession.create({
        data: {
          decisionId: decision.id,
          userId: session.user.id,
          role: "questioner",
          transcript: [],
        },
      });
    }

    const transcript = Array.isArray(promptSession.transcript)
      ? [...promptSession.transcript]
      : [];

    transcript.push({
      q: step?.text ?? body.stepId,
      a: body.answer,
      ts: new Date().toISOString(),
    });

    await prisma.promptSession.update({
      where: { id: promptSession.id },
      data: { transcript },
    });

    const llmMap = await llm.mapper.normalize(transcript);

    const existingMapRecord = await prisma.decisionMap.findUnique({
      where: { decisionId: decision.id },
    });

    const existingMap = existingMapRecord
      ? decisionMapSchema.parse(existingMapRecord)
      : decisionMapSchema.parse({
          assumptions: [],
          options: [],
          evidence: [],
          risks: [],
          criteria: [],
          biasFlags: [],
        });

    const mergeByName = <T extends { name: string }>(existing: T[], updates: T[]) => {
      const copy = [...existing];
      for (const item of updates) {
        if (!copy.some((entry) => entry.name.trim().toLowerCase() === item.name.trim().toLowerCase())) {
          copy.push(item);
        }
      }
      return copy;
    };

    const mergeBias = (existing: Array<{ type: string; note?: string }>, updates: Array<{ type: string; note?: string }>) => {
      const copy = [...existing];
      for (const item of updates) {
        if (!copy.some((entry) => entry.type === item.type)) {
          copy.push(item);
        }
      }
      return copy;
    };

    const merged = normaliseMap({
      assumptions: mergeByText(existingMap.assumptions, llmMap.assumptions),
      options: mergeByText(existingMap.options, llmMap.options),
      evidence: mergeByText(existingMap.evidence, llmMap.evidence),
      risks: mergeByText(existingMap.risks, llmMap.risks),
      criteria: mergeByName(existingMap.criteria, llmMap.criteria),
      biasFlags: mergeBias(existingMap.biasFlags, llmMap.biasFlags),
    });

    await prisma.decisionMap.upsert({
      where: { decisionId: decision.id },
      update: merged,
      create: {
        decisionId: decision.id,
        ...merged,
      },
    });

    return json({ map: merged, transcript });
  } catch (error) {
    return handleError(error);
  }
}
