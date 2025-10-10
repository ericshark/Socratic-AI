import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json } from "@/server/http";
import { evaluateReveal, normaliseMap } from "@/server/services/reveal";

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

    if (!decision.packId) {
      throw new ApiError(400, "Decision has no associated question pack");
    }

    const mapRecord = await prisma.decisionMap.findUnique({
      where: { decisionId: params.id },
    });

    if (!mapRecord) {
      throw new ApiError(404, "Decision map not found");
    }

    const pack = await prisma.questionPack.findUnique({
      where: { id: decision.packId },
    });

    if (!pack) {
      throw new ApiError(404, "Question pack not found");
    }

    const map = normaliseMap(mapRecord);
    const result = evaluateReveal(map, pack.revealRules ?? {});

    await prisma.decision.update({
      where: { id: decision.id },
      data: { revealAllowed: result.allowed },
    });

    return json({ revealAllowed: result.allowed, status: result.status });
  } catch (error) {
    return handleError(error);
  }
}
