import { NextRequest } from "next/server";

import { decisionMapSchema, updateDecisionMapSchema } from "@core/index";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json, parseJsonBody } from "@/server/http";
import { normaliseMap } from "@/server/services/reveal";

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

    const updates = await parseJsonBody(request, updateDecisionMapSchema);

    const existing = await prisma.decisionMap.findUnique({
      where: { decisionId: params.id },
    });

    const map = decisionMapSchema.parse({
      assumptions: existing?.assumptions ?? [],
      options: existing?.options ?? [],
      evidence: existing?.evidence ?? [],
      risks: existing?.risks ?? [],
      criteria: existing?.criteria ?? [],
      biasFlags: existing?.biasFlags ?? [],
      ...updates,
    });

    const normalised = normaliseMap(map);

    const record = await prisma.decisionMap.upsert({
      where: { decisionId: params.id },
      update: normalised,
      create: {
        decisionId: params.id,
        ...normalised,
      },
    });

    return json({ map: record });
  } catch (error) {
    return handleError(error);
  }
}
