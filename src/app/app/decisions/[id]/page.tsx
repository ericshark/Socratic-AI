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
      pack: true,
      brief: true,
      forecasts: true,
      sessions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!decision) {
    notFound();
  }

  const transcript = decision.sessions
    .flatMap((session) => (Array.isArray(session.transcript) ? session.transcript : []))
    .map((entry) => ({
      q: entry.q as string,
      a: entry.a as string,
      ts: entry.ts as string | undefined,
    }));

  return (
    <DecisionWorkspace
      decision={{
        id: decision.id,
        title: decision.title,
        problem: decision.problem,
        depth: decision.depth,
        status: decision.status,
        revealAllowed: decision.revealAllowed,
        pack: decision.pack
          ? {
              ...decision.pack,
              revealRules: decision.pack.revealRules as Record<string, number>,
            }
          : undefined,
      }}
      initialMap={{
        assumptions: (decision.map?.assumptions ?? []) as any,
        options: (decision.map?.options ?? []) as any,
        evidence: (decision.map?.evidence ?? []) as any,
        risks: (decision.map?.risks ?? []) as any,
        criteria: (decision.map?.criteria ?? []) as any,
        biasFlags: (decision.map?.biasFlags ?? []) as any,
      }}
      transcript={transcript}
      forecasts={decision.forecasts.map((forecast) => ({
        id: forecast.id,
        statement: forecast.statement,
        probability: forecast.probability,
        dueAt: forecast.dueAt.toISOString(),
        outcome: forecast.outcome,
        brier: forecast.brier,
      }))}
      brief={decision.brief ?? undefined}
    />
  );
}
