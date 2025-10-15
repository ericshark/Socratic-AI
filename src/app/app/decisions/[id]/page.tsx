import { notFound } from "next/navigation";

import { DecisionWorkspace } from "@/components/decision/decision-workspace";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";

interface DecisionPageProps {
  params: { id: string };
}

export default async function DecisionPage({ params }: DecisionPageProps) {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  const decision = await prisma.decision.findUnique({
    where: { id: params.id },
    include: {
      map: true,
    },
  });

  if (!decision) {
    notFound();
  }

  return (
    <DecisionWorkspace
      decision={{
        id: decision.id,
        title: decision.title,
        problem: decision.problem,
        depth: decision.depth,
      }}
      initialMap={{
        assumptions: (decision.map?.assumptions ?? []) as any,
        options: (decision.map?.options ?? []) as any,
        evidence: (decision.map?.evidence ?? []) as any,
        risks: (decision.map?.risks ?? []) as any,
        criteria: (decision.map?.criteria ?? []) as any,
        biasFlags: (decision.map?.biasFlags ?? []) as any,
      }}
    />
  );
}
