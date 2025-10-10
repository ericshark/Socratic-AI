import { NextRequest } from "next/server";

import { resolveForecastSchema } from "@core/index";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json, parseJsonBody } from "@/server/http";
import { brierScore } from "@/server/services/forecast";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const forecast = await prisma.forecast.findUnique({ where: { id: params.id } });
    if (!forecast) {
      throw new ApiError(404, "Forecast not found");
    }

    await assertDecisionAccess(session.user.id, forecast.decisionId);

    const body = await parseJsonBody(request, resolveForecastSchema);
    const brier = brierScore(forecast.probability, body.outcome);

    const updated = await prisma.forecast.update({
      where: { id: forecast.id },
      data: {
        outcome: body.outcome,
        brier,
      },
    });

    return json({ forecast: updated });
  } catch (error) {
    return handleError(error);
  }
}
