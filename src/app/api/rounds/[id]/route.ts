import { NextRequest } from "next/server";

import { startTeamRoundSchema } from "@core/index";

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

    const decision = await assertDecisionAccess(session.user.id, params.id);
    if (!decision.teamId) {
      throw new ApiError(400, "Team rounds require a team decision");
    }

    const body = await parseJsonBody(request, startTeamRoundSchema);

    const round = await prisma.teamRound.create({
      data: {
        decisionId: decision.id,
        phase: body.phase ?? "private_input",
        entries: body.entries ?? {},
      },
    });

    return json({ round });
  } catch (error) {
    return handleError(error);
  }
}
