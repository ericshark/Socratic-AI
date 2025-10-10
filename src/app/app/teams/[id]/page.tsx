import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";

interface TeamPageProps {
  params: { id: string };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      decisions: {
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
      rounds: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!team) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{team.name}</h1>
        <p className="text-sm text-white/65">Team rounds surface disagreement before the merge step.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Members</CardTitle>
            <CardDescription className="text-sm text-white/70">Owner, admin, and member roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            {team.members.map((member) => (
              <div key={member.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="font-medium text-white">{member.user.name ?? member.user.email}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">{member.role}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Recent Decisions</CardTitle>
            <CardDescription className="text-sm text-white/70">Last five decisions run by this team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            {team.decisions.map((decision) => (
              <div key={decision.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="font-medium text-white">{decision.title}</p>
                <p className="text-xs text-white/50">
                  {decision.status} · Updated {decision.updatedAt.toLocaleDateString()}
                </p>
              </div>
            ))}
            {team.decisions.length === 0 && (
              <p className="text-xs text-white/50">No decisions yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Rounds & Heatmaps</CardTitle>
          <CardDescription className="text-sm text-white/70">Monitor divergence before merge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-white/70">
          {team.rounds.map((round) => (
            <div key={round.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">
                {round.phase} · {round.createdAt.toLocaleString()}
              </p>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black/20 p-3 text-xs text-white/60">
                {JSON.stringify(round.heatmap ?? {}, null, 2)}
              </pre>
            </div>
          ))}
          {team.rounds.length === 0 && <p className="text-xs text-white/50">No rounds yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
