import { NextRequest } from "next/server";

import { scheduleReviewSchema } from "@core/index";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json, parseJsonBody } from "@/server/http";

interface RouteContext {
  params: { decisionId: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    await assertDecisionAccess(session.user.id, params.decisionId);

    const body = await parseJsonBody(request, scheduleReviewSchema);

    const reminder = await prisma.reviewReminder.create({
      data: {
        decisionId: params.decisionId,
        reviewAt: body.reviewAt,
      },
    });

    return json({ reminder });
  } catch (error) {
    return handleError(error);
  }
}
