import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sellingPoints = [
  {
    title: "Guided Socratic Questions",
    description: "Paced prompts that delay answers until assumptions, options, and evidence are mapped.",
  },
  {
    title: "Decision Maps",
    description: "Track assumptions, evidence, risks, and bias flags in one live workspace.",
  },
  {
    title: "Team Heatmaps",
    description: "Async rounds highlight alignment gaps before you lock a call.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="container-tight flex flex-col gap-6 pb-16 pt-24 text-center">
        <span className="mx-auto rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-widest text-white/70">
          AI Thinking Coach
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Ask sharper questions. Make braver bets.
        </h1>
        <p className="mx-auto max-w-2xl text-pretty text-lg text-slate-300 md:text-xl">
          Socratic guides teams through deep reasoning with question packs, answer-delay guardrails, and decision briefs you can ship.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-8 text-base font-semibold">
            <Link href="/auth/sign-in">Sign in to Socratic</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 border-white/20 bg-transparent px-8 text-base text-white hover:bg-white/10">
            <Link href="/app/decisions/demo-decision?demo=1">Try Quick Flow</Link>
          </Button>
        </div>
      </header>

      <main className="container-tight flex flex-1 flex-col gap-12 pb-24">
        <section className="grid gap-6 md:grid-cols-3">
          {sellingPoints.map((point) => (
            <Card key={point.title} className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">
                  {point.title}
                </CardTitle>
                <CardDescription className="text-sm text-white/70">
                  {point.description}
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Guardrails over Gut Feel</CardTitle>
              <CardDescription className="text-white/70">
                Answer-Delay enforces the ritual: fill assumptions, options, and top risks before drafts unlock.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>• Question packs tuned for product, hiring, strategy, learning, and code reviews.</p>
              <p>• Mapper normalises transcripts into a decision map with bias flags.</p>
              <p>• Critic highlights blind spots so the team pressure tests together.</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Export Ready</CardTitle>
              <CardDescription className="text-white/70">
                Generate Markdown and PDF briefs, schedule follow-ups, and push summaries to Notion or Slack (placeholders today).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>• Decision Brief composer wraps context, evidence, and forecasts into a single artifact.</p>
              <p>• Forecasting captures calibration with automatic Brier scoring.</p>
              <p>• Team heatmaps surface disagreement before the merge step.</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/20 py-8 text-center text-sm text-white/60">
        Socratic — coach the thinking, not the answer.
      </footer>
    </div>
  );
}
