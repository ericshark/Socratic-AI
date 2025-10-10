import { NextRequest } from "next/server";

import { forecastInputSchema } from "@core/index";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json, parseJsonBody } from "@/server/http";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    await assertDecisionAccess(session.user.id, params.id);

    const body = await parseJsonBody(request, forecastInputSchema);

    const forecast = await prisma.forecast.create({
      data: {
        decisionId: params.id,
        userId: session.user.id,
        statement: body.statement,
        probability: body.probability,
        dueAt: body.dueAt,
      },
    });

    return json({ forecast });
  } catch (error) {
    return handleError(error);
  }
}
