import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Capture assumptions fast",
    body: "List what must be true before you act and track confidence over time.",
  },
  {
    title: "Compare real options",
    body: "See alternatives side by side so tradeoffs stay visible to the team.",
  },
  {
    title: "Keep risks honest",
    body: "Surface doubts early and plan mitigations before you commit.",
  },
];

const steps = [
  "Frame the decision and stake your assumptions.",
  "Collect options, evidence, and risks in one pane.",
  "Review together, decide, and schedule the follow-up.",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
          Socratic
        </Link>
        <Button asChild variant="secondary" className="rounded-full px-5">
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-24 px-6 pb-24">
        <section className="space-y-10 pt-12 text-center md:text-left">
          <Badge className="mx-auto w-fit md:mx-0">Thinking assistant</Badge>
          <div className="space-y-6">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              Make the call with clarity, not guesswork.
            </h1>
            <p className="text-pretty text-base text-white/70 md:text-lg">
              Socratic keeps strategy conversations grounded in evidence. Capture what you know, flag what you
              don’t, and return to the work that matters.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-start">
            <Button asChild size="lg" className="px-8">
              <Link href="/auth/sign-in" className="flex items-center gap-2">
                Get started <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-sm text-white/60">No setup. Just sign in and start thinking aloud.</p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-white">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/70">{item.body}</CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">How it works</p>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="space-y-3 text-left">
                <span className="text-sm font-semibold text-white/60">Step {index + 1}</span>
                <p className="text-pretty text-sm text-white/80">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-white/5 py-8 text-center text-xs text-white/55">
        Built for teams who reason before they ship.
      </footer>
    </div>
  );
}
