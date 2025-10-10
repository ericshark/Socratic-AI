import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json } from "@/server/http";
import { composeDecisionBrief } from "@/server/services/brief";

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

    const [map, forecasts] = await Promise.all([
      prisma.decisionMap.findUnique({
        where: { decisionId: decision.id },
      }),
      prisma.forecast.findMany({
        where: { decisionId: decision.id },
      }),
    ]);

    if (!map) {
      throw new ApiError(404, "Decision map is missing");
    }

    const { markdown, pdfUrl } = await composeDecisionBrief({
      decision: {
        id: decision.id,
        title: decision.title,
        problem: decision.problem,
        revealAllowed: decision.revealAllowed,
      },
      map,
      forecasts,
    });

    const brief = await prisma.decisionBrief.upsert({
      where: { decisionId: decision.id },
      update: {
        markdown,
        pdfUrl,
      },
      create: {
        decisionId: decision.id,
        markdown,
        pdfUrl,
      },
    });

    return json({ brief });
  } catch (error) {
    return handleError(error);
  }
}
