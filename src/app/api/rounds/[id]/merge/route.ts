import { NextRequest } from "next/server";

import { mergeRoundSchema } from "@core/index";

import { average, variance } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json, parseJsonBody } from "@/server/http";

interface RouteContext {
  params: { id: string };
}

function buildHeatmap(entries: Record<string, any>) {
  const categories = ["assumptions", "options", "risks", "evidence", "criteria"];
  const heatmap: Record<string, { variance: number; average: number }> = {};

  for (const category of categories) {
    const confidences: number[] = [];
    for (const entry of Object.values(entries)) {
      const items = (entry as Record<string, any>)[category];
      if (Array.isArray(items)) {
        for (const item of items) {
          const value = typeof item?.confidence === "number" ? item.confidence : 0.5;
          confidences.push(value);
        }
      }
    }
    heatmap[category] = {
      variance: variance(confidences),
      average: average(confidences),
    };
  }

  return heatmap;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const round = await prisma.teamRound.findUnique({ where: { id: params.id } });
    if (!round) {
      throw new ApiError(404, "Round not found");
    }

    await assertDecisionAccess(session.user.id, round.decisionId);

    const body = await parseJsonBody(request, mergeRoundSchema);

    const entries = body.heatmap ? round.entries : round.entries;
    const heatmap = body.heatmap ?? buildHeatmap(entries as Record<string, any>);

    const updated = await prisma.teamRound.update({
      where: { id: round.id },
      data: {
        phase: "merge",
        heatmap,
      },
    });

    return json({ round: updated });
  } catch (error) {
    return handleError(error);
  }
}
