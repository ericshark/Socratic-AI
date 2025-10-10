import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

interface PackPageProps {
  params: { slug: string };
}

export default async function PackPage({ params }: PackPageProps) {
  const pack = await prisma.questionPack.findUnique({
    where: { slug: params.slug },
  });

  if (!pack) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Card className="border-white/15 bg-card/85">
        <CardHeader>
          <CardTitle className="text-2xl text-white">{pack.name}</CardTitle>
          <CardDescription className="text-white/70">{pack.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-white/70">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Category</p>
            <p className="mt-1 text-base text-white/85">{pack.category}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Reveal Rules</p>
            <ul className="mt-3 space-y-2">
              {Object.entries(pack.revealRules ?? {}).map(([key, value]) => (
                <li key={key} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="text-white/80">{key}</span>
                  <span className="text-white/40"> · {value as number}</span>
                </li>
              ))}
              {Object.keys(pack.revealRules ?? {}).length === 0 && (
                <li className="rounded-xl border border-dashed border-white/20 bg-white/5 p-3 text-white/60">
                  No reveal rules configured.
                </li>
              )}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Question Flow</p>
            <ol className="mt-4 space-y-4">
              {pack.flow.map((step: any, index: number) => (
                <li
                  key={step.id ?? index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <p className="font-medium text-white">
                    Step {index + 1}: {step.text}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/45">Type · {step.type}</p>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
