"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { DecisionMapInput, QuestionPackInput } from "@core/index";

type TranscriptEntry = { q: string; a: string; ts?: string };

interface Forecast {
  id: string;
  statement: string;
  probability: number;
  dueAt: string;
  outcome: number | null;
  brier: number | null;
}

interface QuestionSuggestion {
  id: string;
  role: string;
  text: string;
}

interface DecisionWorkspaceProps {
  decision: {
    id: string;
    title: string;
    problem: string;
    depth: string;
    status: string;
    revealAllowed: boolean;
    pack?: QuestionPackInput & { id: string; revealRules: Record<string, number> };
  };
  initialMap: DecisionMapInput;
  transcript: TranscriptEntry[];
  forecasts: Forecast[];
  brief?: { markdown: string; pdfUrl?: string | null };
}

export function DecisionWorkspace({ decision, initialMap, transcript, forecasts, brief }: DecisionWorkspaceProps) {
  const router = useRouter();
  const [map, setMap] = useState(initialMap);
  const [entries, setEntries] = useState(transcript);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, startSubmit] = useTransition();
  const [revealAllowed, setRevealAllowed] = useState(decision.revealAllowed);
  const [draftMarkdown, setDraftMarkdown] = useState<string | null>(null);
  const [criticNotes, setCriticNotes] = useState<string | null>(null);
  const [aiPrompts, setAiPrompts] = useState<QuestionSuggestion[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  const selectedPromptRef = useRef<string | null>(null);
  useEffect(() => {
    selectedPromptRef.current = selectedPromptId;
  }, [selectedPromptId]);

  const packPrompt = useMemo(() => {
    if (!decision.pack?.flow?.length) {
      return null;
    }
    const answered = new Set(entries.map((entry) => entry.q.trim()));
    const nextPackPrompt =
      decision.pack.flow.find((step) => step.type === "prompt" && !answered.has(step.text.trim())) ??
      decision.pack.flow[Math.min(entries.length, decision.pack.flow.length - 1)];

    return nextPackPrompt
      ? { id: nextPackPrompt.id, role: nextPackPrompt.type, text: nextPackPrompt.text }
      : null;
  }, [decision.pack, entries]);

  const selectedPrompt = useMemo(
    () => aiPrompts.find((prompt) => prompt.id === selectedPromptId) ?? null,
    [aiPrompts, selectedPromptId],
  );

  const activePrompt = selectedPrompt ?? packPrompt ?? {
    id: `reflection-${entries.length + 1}`,
    role: "coach",
    text: "What feels most uncertain or worthy of deeper exploration right now?",
  };

  const loadPrompts = useCallback(
    async (options?: { preserveSelection?: boolean }) => {
      const preserveSelection = options?.preserveSelection ?? false;
      setLoadingPrompts(true);
      setPromptError(null);

      try {
        const response = await fetch(`/api/decisions/${decision.id}/questions`, { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          questions?: QuestionSuggestion[];
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to fetch AI prompts");
        }

        const questions = payload.questions ?? [];
        setAiPrompts(questions);

        if (preserveSelection && selectedPromptRef.current && questions.some((q) => q.id === selectedPromptRef.current)) {
          setSelectedPromptId(selectedPromptRef.current);
        } else if (questions.length > 0) {
          setSelectedPromptId(questions[0].id);
        } else {
          setSelectedPromptId(null);
        }
      } catch (error) {
        setPromptError((error as Error).message ?? "Failed to load AI prompts");
        setAiPrompts([]);
        setSelectedPromptId(null);
      } finally {
        setLoadingPrompts(false);
      }
    },
    [decision.id],
  );

  useEffect(() => {
    void loadPrompts();
  }, [loadPrompts]);

  async function postJson<T>(url: string, body?: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    const detail = (await response.json().catch(() => ({}))) as { error?: string } & T;
    if (!response.ok) {
      throw new Error(detail.error ?? `Request failed: ${response.status}`);
    }

    return detail as T;
  }

  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      toast.error("Add an answer before submitting.");
      return;
    }

    const promptToAnswer = activePrompt;
    startSubmit(async () => {
      try {
        const payload = await postJson<{ map: DecisionMapInput; transcript: TranscriptEntry[] }>(
          `/api/decisions/${decision.id}/answer`,
          {
            stepId: promptToAnswer.id,
            answer: answer.trim(),
          },
        );
        setMap(payload.map);
        setEntries(payload.transcript);
        setAnswer("");
        setSelectedPromptId(null);
        toast.success("Answer captured", { description: "Decision map updated." });
        await loadPrompts();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const handleCheckReveal = () => {
    startSubmit(async () => {
      try {
        const payload = await postJson<{ revealAllowed: boolean }>(
          `/api/decisions/${decision.id}/check-reveal`,
        );
        setRevealAllowed(payload.revealAllowed);
        toast.info(
          payload.revealAllowed
            ? "Reveal unlocked. You can now generate the draft."
            : "Keep filling assumptions, alternatives, and risks before reveal.",
        );
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const handleRevealDraft = () => {
    startSubmit(async () => {
      try {
        const payload = await postJson<{ markdown: string; critique: string }>(
          `/api/decisions/${decision.id}/draft`,
        );
        setDraftMarkdown(payload.markdown);
        setCriticNotes(payload.critique);
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const handleComposeBrief = () => {
    startSubmit(async () => {
      try {
        await postJson(`/api/decisions/${decision.id}/brief`);
        toast.success("Decision brief exported");
        router.refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const mapSections = useMemo(
    () => [
      {
        title: "Assumptions",
        items: map.assumptions.map((item) => `${item.text} (${Math.round(item.confidence * 100)}% confidence)`),
      },
      {
        title: "Options",
        items: map.options.map((item) => item.text),
      },
      {
        title: "Evidence",
        items: map.evidence.map((item) =>
          `${item.text}${item.weight ? ` (${Math.round(item.weight * 100)}% strength)` : ""}`,
        ),
      },
      {
        title: "Risks",
        items: map.risks.map((item) =>
          `${item.text}${item.mitigation ? ` — Mitigation: ${item.mitigation}` : ""}`,
        ),
      },
      {
        title: "Criteria",
        items: map.criteria.map((item) => `${item.name} (${Math.round((item.weight ?? 0) * 100)}% weight)`),
      },
      {
        title: "Bias Flags",
        items: map.biasFlags.map((flag) => `${flag.type}${flag.note ? ` — ${flag.note}` : ""}`),
      },
      {
        title: "Forecasts",
        items: forecasts.map(
          (forecast) =>
            `${forecast.statement} — ${(forecast.probability * 100).toFixed(0)}% by ${new Date(
              forecast.dueAt,
            ).toLocaleDateString()}`,
        ),
      },
    ],
    [map, forecasts],
  );

  const currentQuestionText = activePrompt.text;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="space-y-6">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit">{decision.depth}</Badge>
              <CardTitle className="text-2xl text-white">{decision.title}</CardTitle>
              <CardDescription className="text-white/70">{decision.problem}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/45">
              <Badge variant={revealAllowed ? "success" : "outline"}>
                {revealAllowed ? "Reveal ready" : "Answer-delay active"}
              </Badge>
              {decision.pack && <Badge variant="outline">{decision.pack.name}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleCheckReveal} disabled={isSubmitting}>
              Check reveal guardrails
            </Button>
            <Button size="sm" onClick={handleRevealDraft} disabled={!revealAllowed || isSubmitting}>
              Generate AI draft
            </Button>
            <Button size="sm" variant="secondary" onClick={handleComposeBrief} disabled={isSubmitting}>
              Save brief to workspace
            </Button>
            {brief?.pdfUrl && (
              <Button asChild size="sm" variant="ghost">
                <Link href={brief.pdfUrl} target="_blank" rel="noopener noreferrer">
                  View latest PDF
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-white">AI Coach</CardTitle>
                <CardDescription className="text-white/70">
                  Select a prompt, capture your answer, and let the map update automatically.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => loadPrompts({ preserveSelection: true })}
                disabled={loadingPrompts}
              >
                {loadingPrompts ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => setSelectedPromptId(prompt.id)}
                  className={cn("rounded-full border px-3 py-1 text-left text-xs transition", selectedPromptId === prompt.id ? "border-primary/80 bg-primary/30 text-white" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white")}
                >
                  <span className="line-clamp-2 leading-relaxed">{prompt.text}</span>
                </button>
              ))}
              {aiPrompts.length === 0 && !promptError && !loadingPrompts && (
                <p className="text-xs text-white/50">Prompts appear once you start answering.</p>
              )}
            </div>
            {promptError ? <p className="text-xs text-rose-300">{promptError}</p> : null}
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Current prompt</p>
              <p className="mt-2 text-lg font-semibold text-white">{currentQuestionText}</p>
            </div>
            <div className="space-y-3">
              <Textarea
                rows={5}
                placeholder="Capture your thinking..."
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                className="bg-white/10"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSubmitAnswer} disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Submit answer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => loadPrompts()}
                  disabled={loadingPrompts}
                >
                  New ideas
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Conversation history</p>
              {entries.length === 0 ? (
                <p className="text-sm text-white/60">
                  Once you answer a prompt, the full conversation appears here.
                </p>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry, index) => (
                    <div key={`${entry.q}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/45">{entry.q}</p>
                      <p className="mt-2 text-sm text-white/80">{entry.a}</p>
                      {entry.ts ? (
                        <p className="mt-2 text-xs text-white/50">{new Date(entry.ts).toLocaleString()}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {draftMarkdown && (
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white">Draft decision summary</CardTitle>
              <CardDescription className="text-white/70">Refine and share after a quick review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/60 p-4 text-xs text-white/90">
                {draftMarkdown}
              </pre>
              {criticNotes ? (
                <div className="space-y-2 text-sm text-rose-300">
                  <p className="font-semibold">Devil&apos;s advocate</p>
                  <pre className="whitespace-pre-wrap text-xs text-rose-200/80">{criticNotes}</pre>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </section>

      <aside className="space-y-6">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Live decision map</CardTitle>
            <CardDescription className="text-white/70">
              Highlights update automatically from your answers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {mapSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">{section.title}</p>
                {section.items.length ? (
                  <ul className="space-y-2 text-sm text-white/80">
                    {section.items.map((item, index) => (
                      <li
                        key={`${section.title}-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-white/50">Nothing captured yet.</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

