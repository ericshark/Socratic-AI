import { DecisionDepth } from "@prisma/client";
import { NextRequest } from "next/server";

import { createDecisionSchema } from "@core/index";

import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertTeamRole } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json, parseJsonBody } from "@/server/http";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const limiter = rateLimit(`decision:${session.user.id}`);
    if (!limiter.allowed) {
      throw new ApiError(429, "Rate limit exceeded");
    }

    const body = await parseJsonBody(request, createDecisionSchema);

    if (body.teamId) {
      await assertTeamRole(session.user.id, body.teamId);
    }

    let packId: string | undefined;
    if (body.packSlug) {
      const pack = await prisma.questionPack.findUnique({ where: { slug: body.packSlug } });
      if (!pack) {
        throw new ApiError(400, "Question pack not found");
      }
      packId = pack.id;
    }

    const decision = await prisma.$transaction(async (tx) => {
      const created = await tx.decision.create({
        data: {
          title: body.title,
          problem: body.problem,
          depth: body.depth as DecisionDepth,
          packId,
          userId: session.user.id,
          teamId: body.teamId,
        },
      });

      await tx.decisionMap.create({
        data: {
          decisionId: created.id,
          assumptions: [],
          options: [],
          evidence: [],
          risks: [],
          criteria: [],
          biasFlags: [],
        },
      });

      return created;
    });

    return json({ decisionId: decision.id });
  } catch (error) {
    return handleError(error);
  }
}
