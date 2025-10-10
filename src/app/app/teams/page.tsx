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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Teams</h1>
          <p className="text-sm text-white/65">Manage members, async rounds, and shared heatmaps.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {memberships.map((member) => (
          <Card key={member.teamId} className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">{member.team.name}</CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.3em] text-white/50">
                {member.role}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-white/70">
              <p className="max-w-[65%] text-pretty">
                Collaborate on decisions, run async rounds, export briefs.
              </p>
              <Button asChild variant="outline" size="sm" className="rounded-full border-white/20 px-4">
                <Link href={`/app/teams/${member.teamId}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {memberships.length === 0 && (
          <Card className="border border-dashed border-white/20 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>No teams yet</CardTitle>
              <CardDescription className="text-white/70">
                Invite teammates from a decision workspace (placeholder).
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
