import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";

export default async function DashboardPage() {
  const session = await auth();
  const decisions = await prisma.decision.findMany({
    where: {
      OR: [
        { userId: session?.user?.id },
        {
          team: {
            members: {
              some: {
                userId: session?.user?.id,
              },
            },
          },
        },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
    include: {
      team: true,
      pack: true,
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Decisions</h1>
          <p className="text-sm text-white/65">
            Guided flows, answer-delay guardrails, and team heatmaps.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full px-6">
          <Link href="/app/decisions/new">New Decision</Link>
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {decisions.map((decision) => (
          <Card key={decision.id} className="border-white/10 bg-white/5 transition-transform hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">
                <Link href={`/app/decisions/${decision.id}`} className="transition hover:text-primary">
                  {decision.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.3em] text-white/50">
                {decision.pack?.name ?? "Ad-hoc"} · {decision.depth}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p className="line-clamp-3 text-pretty">{decision.problem}</p>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Updated {decision.updatedAt.toLocaleDateString()}</span>
                <span className="uppercase tracking-[0.3em] text-white/45">{decision.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {decisions.length === 0 && (
          <Card className="border border-dashed border-white/20 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>No decisions yet</CardTitle>
              <CardDescription className="text-white/70">
                Create your first decision to unlock guided flows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/app/decisions/new">Start Quick Flow</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
