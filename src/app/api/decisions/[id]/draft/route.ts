import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json } from "@/server/http";
import { llm } from "@/server/llm";

interface RouteContext {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const decision = await assertDecisionAccess(session.user.id, params.id);

    if (!decision.revealAllowed) {
      throw new ApiError(403, "Answer-Delay guard active. Check reveal rules first.");
    }

    const map = await prisma.decisionMap.findUnique({
      where: { decisionId: decision.id },
    });

    if (!map) {
      throw new ApiError(404, "Decision map missing");
    }

    const forecasts = await prisma.forecast.findMany({
      where: { decisionId: decision.id },
    });

    const markdown = await llm.summarizer.decisionBrief({
      problem: decision.problem,
      map,
      forecasts,
      revealAllowed: decision.revealAllowed,
    });

    const critique = await llm.critic.devilAdvocate(decision.problem, map);

    return json({ markdown, critique });
  } catch (error) {
    return handleError(error);
  }
}
