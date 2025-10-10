import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-grid opacity-75" aria-hidden />
      <div className="pointer-events-none absolute -top-24 right-20 -z-10 size-[32rem] rounded-full bg-gradient-to-br from-primary/30 via-sky-500/25 to-transparent blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-[28rem] rounded-full bg-gradient-to-tr from-rose-500/20 via-primary/35 to-transparent blur-3xl" aria-hidden />

      <header className="container-tight flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
          <Sparkles className="size-4 text-primary" /> Socratic
        </Link>
        <nav className="flex items-center gap-3 text-sm text-white/60">
          <Link
            href="/app/decisions/demo-decision?demo=1"
            className="hidden rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white md:block"
          >
            Explore demo
          </Link>
          <Button
            asChild
            variant="ghost"
            className="rounded-full border border-white/10 px-5 py-2 text-white/80 hover:border-white/30 hover:text-white"
          >
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
        </nav>
      </header>

      <main className="container-tight flex flex-1 flex-col gap-20 pb-24">
        <section className="grid items-center gap-16 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-8">
            <Badge>AI Thinking Coach</Badge>
            <div className="space-y-6">
              <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
                Ask sharper questions. Make braver bets.
              </h1>
              <p className="text-lg text-white/70 md:text-xl">
                Socratic guides teams through deliberate reasoning rituals—question packs, answer-delay guardrails, and decision briefs that are ready to share.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/auth/sign-in" className="flex items-center gap-2">
                  Sign in to Socratic <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/20 bg-transparent px-8 text-base text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Link href="/app/decisions/demo-decision?demo=1">Try the quick flow</Link>
              </Button>
            </div>
            <Separator className="max-w-md opacity-60" />
            <div className="grid gap-4 md:grid-cols-3">
              {sellingPoints.map((point) => (
                <Card key={point.title} className="border-white/10 bg-white/5 p-5">
                  <CardHeader className="p-0">
                    <CardTitle className="text-sm font-semibold text-white/80">
                      {point.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-white/60">
                      {point.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
          <Card className="relative overflow-hidden border-white/10 bg-card/80 p-0">
            <div className="absolute -right-24 top-10 size-48 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 blur-3xl" aria-hidden />
            <CardHeader className="space-y-3 p-10 pb-6">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">Decision workspace</p>
              <CardTitle className="text-3xl text-white">Coach the thinking, not the answer.</CardTitle>
              <CardDescription className="text-white/65">
                Sprints stay aligned when assumptions, evidence, and risks live in one map. Socratic keeps everyone honest about tradeoffs.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-10 pt-0 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Map</p>
                <p className="mt-2 text-sm text-white">
                  • Assumptions, options, evidence, and bias flags stay linked.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Heatmaps</p>
                <p className="mt-2 text-sm text-white">
                  • Async rounds reveal where alignment breaks before decisions lock.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Briefs</p>
                <p className="mt-2 text-sm text-white">
                  • Export polished narratives, schedule reviews, and track forecasts.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-white/5 py-8 text-center text-sm text-white/60 backdrop-blur-xl">
        Socratic — coach the thinking, not the answer.
      </footer>
    </div>
  );
}
