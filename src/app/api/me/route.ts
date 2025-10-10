import { auth } from "@/server/auth";
import { ApiError, handleError } from "@/server/errors";
import { json } from "@/server/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const [teams, decisions, forecasts] = await Promise.all([
      prisma.teamMember.findMany({
        where: { userId: session.user.id },
        include: { team: true },
      }),
      prisma.decision.count({ where: { userId: session.user.id } }),
      prisma.forecast.count({ where: { userId: session.user.id } }),
    ]);

    return json({
      user: session.user,
      teams: teams.map((membership) => ({
        id: membership.teamId,
        name: membership.team.name,
        role: membership.role,
      })),
      usage: {
        decisions,
        forecasts,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
