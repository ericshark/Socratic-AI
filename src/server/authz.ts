import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type DecisionWithRelations = Prisma.DecisionGetPayload<{
  include: {
    team: {
      include: {
        members: true;
      };
    };
  };
}>;

export async function assertDecisionAccess(userId: string, decisionId: string) {
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: {
      team: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!decision) {
    throw new Error("Decision not found");
  }

  if (!decision.teamId && decision.userId !== userId) {
    throw new Error("You do not have access to this decision");
  }

  if (decision.teamId && decision.team) {
    const membership = decision.team.members.find((member) => member.userId === userId);
    if (!membership) {
      throw new Error("You are not a member of this team");
    }
  }

  return decision as DecisionWithRelations;
}

export async function assertTeamRole(userId: string, teamId: string) {
  const member = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: { teamId, userId },
    },
  });

  if (!member) {
    throw new Error("Only team members can perform this action");
  }

  return member;
}
