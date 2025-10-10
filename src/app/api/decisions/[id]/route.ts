import { NextRequest } from "next/server";

import { auth } from "@/server/auth";
import { assertDecisionAccess } from "@/server/authz";
import { ApiError, handleError } from "@/server/errors";
import { json } from "@/server/http";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const limiter = rateLimit(`decision:read:${session.user.id}`);
    if (!limiter.allowed) {
      throw new ApiError(429, "Rate limit exceeded");
    }

    const decision = await assertDecisionAccess(session.user.id, context.params.id);

    const data = await prisma.decision.findUnique({
      where: { id: decision.id },
      include: {
        map: true,
        pack: true,
        brief: true,
        rounds: {
          orderBy: { createdAt: "desc" },
        },
        forecasts: {
          orderBy: { createdAt: "desc" },
        },
        reviews: true,
      },
    });

    if (!data) {
      throw new ApiError(404, "Decision not found");
    }

    const rounds = data.rounds.map((round) => ({
      id: round.id,
      phase: round.phase,
      createdAt: round.createdAt,
      heatmap: round.heatmap,
    }));

    return json({
      decision: {
        id: data.id,
        title: data.title,
        problem: data.problem,
        depth: data.depth,
        status: data.status,
        revealAllowed: data.revealAllowed,
        pack: data.pack
          ? {
              id: data.pack.id,
              slug: data.pack.slug,
              name: data.pack.name,
              revealRules: data.pack.revealRules,
            }
          : null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      map: data.map,
      brief: data.brief,
      rounds,
      forecasts: data.forecasts,
      reviews: data.reviews,
    });
  } catch (error) {
    return handleError(error);
  }
}
