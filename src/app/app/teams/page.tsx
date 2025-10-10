import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";

export default async function TeamsPage() {
  const session = await auth();
  const memberships = await prisma.teamMember.findMany({
    where: { userId: session?.user?.id },
    include: { team: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Teams</h1>
          <p className="text-sm text-slate-600">Manage team members, rounds, and heatmaps.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {memberships.map((member) => (
          <Card key={member.teamId}>
            <CardHeader>
              <CardTitle>{member.team.name}</CardTitle>
              <CardDescription className="text-xs uppercase text-slate-500">{member.role}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-slate-600">
              <p>Collaborate on decisions, run async rounds, export briefs.</p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/app/teams/${member.teamId}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {memberships.length === 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No teams yet</CardTitle>
              <CardDescription>Invite teammates from a decision workspace (placeholder).</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
