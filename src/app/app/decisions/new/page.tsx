import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { CreateDecisionForm } from "@/components/decision/create-decision-form";

export default async function NewDecisionPage() {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  const [packs, teams] = await Promise.all([
    prisma.questionPack.findMany({ orderBy: { name: "asc" } }),
    prisma.teamMember.findMany({
      where: { userId: session.user.id },
      include: { team: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Card className="border-white/15 bg-card/85">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl text-white">Start a new decision</CardTitle>
          <CardDescription className="text-sm text-white/70">
            Give the problem a name, set the context, and invite others to weigh in later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CreateDecisionForm
            packs={packs.map((pack) => ({
              slug: pack.slug,
              name: pack.name,
              category: pack.category,
              description: pack.description,
              flow: pack.flow,
              revealRules: pack.revealRules,
            }))}
            teams={teams.map((membership) => ({
              id: membership.team.id,
              name: membership.team.name,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
