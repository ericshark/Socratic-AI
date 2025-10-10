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
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>New Decision</CardTitle>
          <CardDescription>Kick off a guided flow with answer-delay guard rails.</CardDescription>
        </CardHeader>
        <CardContent>
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
