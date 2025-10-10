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
      <Card>
        <CardHeader>
          <CardTitle>{pack.name}</CardTitle>
          <CardDescription>{pack.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600">
            <p className="font-semibold uppercase text-xs text-slate-500">Category</p>
            <p>{pack.category}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Reveal Rules</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {Object.entries(pack.revealRules ?? {}).map(([key, value]) => (
                <li key={key}>
                  {key}: {value as number}
                </li>
              ))}
              {Object.keys(pack.revealRules ?? {}).length === 0 && <li>No reveal rules configured.</li>}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Question Flow</p>
            <ol className="mt-3 space-y-3">
              {pack.flow.map((step: any, index: number) => (
                <li key={step.id ?? index} className="rounded-md border border-slate-200 p-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">
                    Step {index + 1}: {step.text}
                  </p>
                  <p className="text-xs text-slate-500">Type: {step.type}</p>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
