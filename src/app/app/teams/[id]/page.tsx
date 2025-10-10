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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{team.name}</h1>
        <p className="text-sm text-slate-600">Team rounds surface disagreement before the merge step.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Owner, admin, and member roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {team.members.map((member) => (
              <div key={member.id} className="rounded-md border border-slate-200 p-2">
                <p className="font-medium text-slate-900">{member.user.name ?? member.user.email}</p>
                <p className="text-xs uppercase text-slate-500">{member.role}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
            <CardDescription>Last five decisions run by this team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {team.decisions.map((decision) => (
              <div key={decision.id} className="rounded-md border border-slate-200 p-2">
                <p className="font-medium text-slate-900">{decision.title}</p>
                <p className="text-xs text-slate-500">
                  {decision.status} · Updated {decision.updatedAt.toLocaleDateString()}
                </p>
              </div>
            ))}
            {team.decisions.length === 0 && <p className="text-xs text-slate-500">No decisions yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rounds & Heatmaps</CardTitle>
          <CardDescription>Monitor divergence before merge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          {team.rounds.map((round) => (
            <div key={round.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">
                {round.phase} · {round.createdAt.toLocaleString()}
              </p>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-500">
                {JSON.stringify(round.heatmap ?? {}, null, 2)}
              </pre>
            </div>
          ))}
          {team.rounds.length === 0 && <p className="text-xs text-slate-500">No rounds yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
