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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Decisions</h1>
          <p className="text-sm text-slate-600">Guided flows, answer-delay guardrails, and team heatmaps.</p>
        </div>
        <Button asChild>
          <Link href="/app/decisions/new">New Decision</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {decisions.map((decision) => (
          <Card key={decision.id} className="transition hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                <Link href={`/app/decisions/${decision.id}`} className="hover:underline">
                  {decision.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-wide text-slate-500">
                {decision.pack?.name ?? "Ad-hoc"} · {decision.depth}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p className="line-clamp-3 text-pretty">{decision.problem}</p>
              <div className="text-xs text-slate-500">
                Last updated {decision.updatedAt.toLocaleDateString()} · {decision.status}
              </div>
            </CardContent>
          </Card>
        ))}
        {decisions.length === 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No decisions yet</CardTitle>
              <CardDescription>Create your first decision to unlock guided flows.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/app/decisions/new">Start Quick Flow</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
