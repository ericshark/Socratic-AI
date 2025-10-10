import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function PacksPage() {
  const packs = await prisma.questionPack.findMany({
    orderBy: { category: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Question Packs</h1>
          <p className="text-sm text-white/65">Curated Socratic flows tailored to specific decision types.</p>
        </div>
        <Button asChild size="lg" className="rounded-full px-6">
          <Link href="/app/packs/new">Create Custom Pack</Link>
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => (
          <Card key={pack.id} className="border-white/10 bg-white/5 transition-transform hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">
                <Link href={`/app/packs/${pack.slug}`} className="transition hover:text-primary">
                  {pack.name}
                </Link>
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.3em] text-white/50">
                {pack.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p className="line-clamp-4 text-pretty">{pack.description}</p>
              <p className="text-xs text-white/50">{pack.flow.length} questions · Reveal rules enforced</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
