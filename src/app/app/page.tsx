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
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Workspace</h1>
          <p className="text-sm text-white/60">Pick up a thinking session or start a fresh decision.</p>
        </div>
        <Button asChild size="lg" className="w-full rounded-full px-6 md:w-auto">
          <Link href="/app/decisions/new">New decision</Link>
        </Button>
      </div>

      {decisions.length === 0 ? (
        <Card className="border border-dashed border-white/15 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">No decisions yet</CardTitle>
            <CardDescription className="text-sm text-white/65">
              Create a workspace, capture what you know, and invite your team when ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/app/decisions/new">Start your first decision</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {decisions.map((decision) => (
            <Card key={decision.id} className="border-white/10 bg-white/5">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base font-semibold text-white">
                  <Link href={`/app/decisions/${decision.id}`} className="transition hover:text-primary">
                    {decision.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-[0.3em] text-white/45">
                  Updated {decision.updatedAt.toLocaleDateString()} · {decision.pack?.name ?? "No pack"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/70">
                <p className="line-clamp-3 text-pretty">{decision.problem}</p>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>Depth: {decision.depth}</span>
                  <span className="uppercase tracking-[0.3em] text-white/45">{decision.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
