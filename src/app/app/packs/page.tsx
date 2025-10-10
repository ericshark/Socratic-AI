import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function PacksPage() {
  const packs = await prisma.questionPack.findMany({
    orderBy: { category: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Question Packs</h1>
          <p className="text-sm text-slate-600">Curated Socratic flows tailored to specific decision types.</p>
        </div>
        <Button asChild>
          <Link href="/app/packs/new">Create Custom Pack</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => (
          <Card key={pack.id} className="transition hover:shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                <Link href={`/app/packs/${pack.slug}`} className="hover:underline">
                  {pack.name}
                </Link>
              </CardTitle>
              <CardDescription className="text-xs uppercase text-slate-500">{pack.category}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              <p className="line-clamp-4">{pack.description}</p>
              <p className="mt-3 text-xs text-slate-500">{pack.flow.length} questions · Reveal rules enforced</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
