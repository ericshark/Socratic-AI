"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  const [forecastsState, setForecasts] = useState(forecasts);
  const [forecastInput, setForecastInput] = useState({ statement: "", probability: 0.5, dueAt: "" });
  const [reviewDate, setReviewDate] = useState<string>("");

  const nextStep =
    decision.pack?.flow?.find(
      (step) => !entries.some((entry) => entry.q === step.text) && step.type === "prompt",
    ) ?? decision.pack?.flow?.[entries.length];

  async function postJson<T>(url: string, body?: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.error ?? `Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      toast.error("Add an answer before submitting.");
      return;
    }
    startSubmit(async () => {
      try {
        const stepId = nextStep?.id ?? `custom-${entries.length + 1}`;
        const data = await postJson<{ map: DecisionMapInput; transcript: TranscriptEntry[] }>(
          `/api/decisions/${decision.id}/answer`,
          { stepId, answer: answer.trim() },
        );
        setMap(data.map);
        setEntries(data.transcript);
        setAnswer("");
        toast.success("Answer captured", { description: "Decision map updated." });
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const handleCheckReveal = () => {
    startSubmit(async () => {
      try {
        const data = await postJson<{ revealAllowed: boolean; status: Record<string, boolean> }>(
          `/api/decisions/${decision.id}/check-reveal`,
        );
        setRevealAllowed(data.revealAllowed);
        toast.info(
          data.revealAllowed
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
        const data = await postJson<{ markdown: string; critique: string }>(`/api/decisions/${decision.id}/draft`);
        setDraftMarkdown(data.markdown);
        setCriticNotes(data.critique);
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

  const handleScheduleReview = () => {
    if (!reviewDate) {
      toast.error("Pick a review date");
      return;
    }
    startSubmit(async () => {
      try {
        await postJson(`/api/reviews/${decision.id}/schedule`, { reviewAt: reviewDate });
        toast.success("Review scheduled");
        setReviewDate("");
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const handleAddForecast = () => {
    if (!forecastInput.statement || !forecastInput.dueAt) {
      toast.error("Add statement and due date");
      return;
    }
    startSubmit(async () => {
      try {
        const data = await postJson<{ forecast: Forecast }>(`/api/decisions/${decision.id}/forecast`, {
          statement: forecastInput.statement,
          probability: forecastInput.probability,
          dueAt: forecastInput.dueAt,
        });
        setForecasts([data.forecast, ...forecastsState]);
        setForecastInput({ statement: "", probability: 0.5, dueAt: "" });
        toast.success("Forecast saved");
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const handleMapAdd = (key: keyof DecisionMapInput, label: string) => {
    const value = window.prompt(`Add ${label}`);
    if (!value) return;

    let newItem: any = { text: value };
    switch (key) {
      case "assumptions":
        newItem = { text: value, confidence: 0.5 };
        break;
      case "options":
        newItem = { text: value };
        break;
      case "evidence":
        newItem = { text: value, weight: 0.3 };
        break;
      case "risks":
        newItem = { text: value };
        break;
      case "criteria": {
        const weight = Math.max(0.05, Number((1 / (map.criteria.length + 1)).toFixed(2)));
        newItem = { name: value, weight };
        break;
      }
      case "biasFlags":
        newItem = { type: value };
        break;
      default:
        break;
    }

    const next = {
      ...map,
      [key]: [...(map[key] as Array<any>), newItem],
    } as DecisionMapInput;
    syncMap(next);
  };

  const syncMap = (next: DecisionMapInput) => {
    startSubmit(async () => {
      try {
        const data = await postJson<{ map: DecisionMapInput }>(`/api/decisions/${decision.id}/map`, next);
        setMap(data.map);
        toast.success("Decision map updated");
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1.6fr_1fr]">
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{decision.title}</CardTitle>
            <CardDescription>{decision.problem}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-slate-500">
              <Badge variant="outline">{decision.depth}</Badge>
              <Badge variant={revealAllowed ? "success" : "outline"}>
                {revealAllowed ? "Reveal unlocked" : "Answer-Delay active"}
              </Badge>
              {decision.pack && <Badge variant="outline">{decision.pack.name}</Badge>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleCheckReveal} disabled={isSubmitting}>
                Check Reveal Rules
              </Button>
              <Button size="sm" onClick={handleRevealDraft} disabled={!revealAllowed || isSubmitting}>
                Reveal Draft
              </Button>
              <Button size="sm" variant="secondary" onClick={handleComposeBrief} disabled={isSubmitting}>
                Export Brief
              </Button>
              {brief?.pdfUrl && (
                <Button asChild size="sm" variant="ghost">
                  <Link href={brief.pdfUrl} target="_blank" rel="noopener noreferrer">
                    View PDF
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Schedule Review</CardTitle>
            <CardDescription>Set a follow-up date to revisit this decision.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} />
            <Button onClick={handleScheduleReview} disabled={isSubmitting}>
              Schedule Review
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Forecast</CardTitle>
            <CardDescription>Track calibration with automatic Brier scoring.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Pro tier hits 20% adoption in 90 days"
              value={forecastInput.statement}
              onChange={(event) =>
                setForecastInput((prev) => ({
                  ...prev,
                  statement: event.target.value,
                }))
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs uppercase text-slate-500">Probability</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={forecastInput.probability}
                  onChange={(event) =>
                    setForecastInput((prev) => ({
                      ...prev,
                      probability: Number(event.target.value),
                    }))
                  }
                />
                <p className="text-xs text-slate-500">{Math.round(forecastInput.probability * 100)}%</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase text-slate-500">Due Date</label>
                <Input
                  type="date"
                  value={forecastInput.dueAt}
                  onChange={(event) =>
                    setForecastInput((prev) => ({
                      ...prev,
                      dueAt: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button onClick={handleAddForecast} disabled={isSubmitting}>
              Add Forecast
            </Button>
            <div className="space-y-2 text-sm text-slate-600">
              {forecastsState.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 p-3">
                  <div className="font-medium">{item.statement}</div>
                  <div className="text-xs text-slate-500">
                    {Math.round(item.probability * 100)}% by {new Date(item.dueAt).toLocaleDateString()} ·{" "}
                    {item.outcome === null ? "Pending" : item.outcome === 1 ? "Met" : "Missed"}{" "}
                    {item.brier !== null && `· Brier ${item.brier.toFixed(2)}`}
                  </div>
                </div>
              ))}
              {forecastsState.length === 0 && <p className="text-xs text-slate-500">No forecasts yet.</p>}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Question Stream</CardTitle>
            <CardDescription>
              Answer the prompts to unlock reveal. Socratic coach keeps you in question mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div key={`${entry.q}-${index}`} className="rounded-md border border-slate-200 p-3 text-sm">
                  <p className="font-medium text-slate-900">{entry.q}</p>
                  <p className="mt-2 text-slate-600">{entry.a}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {entry.ts ? new Date(entry.ts).toLocaleString() : "Pending"}
                  </p>
                </div>
              ))}
            </div>
            {nextStep && (
              <div className="rounded-lg border border-dashed border-slate-300 p-4">
                <p className="text-sm font-medium text-slate-800">{nextStep.text}</p>
                <Textarea
                  className="mt-3"
                  rows={4}
                  placeholder="Capture your thinking..."
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                />
                <div className="mt-3 flex gap-2">
                  <Button onClick={handleSubmitAnswer} disabled={isSubmitting}>
                    Submit Answer
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {draftMarkdown && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Draft Decision Summary</CardTitle>
              <CardDescription>Refine and share after sanity checks.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-900/90 p-4 text-xs text-slate-100">
                {draftMarkdown}
              </pre>
              {criticNotes && (
                <div className="mt-4 space-y-2 text-sm text-rose-500">
                  <p className="font-semibold">Devil&apos;s Advocate</p>
                  <pre className="whitespace-pre-wrap text-xs text-rose-400">{criticNotes}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Decision Map</CardTitle>
            <CardDescription>Keep assumptions, options, evidence, and risks live.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="assumptions">
              <TabsList className="w-full flex-wrap">
                <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="criteria">Criteria</TabsTrigger>
                <TabsTrigger value="bias">Bias</TabsTrigger>
              </TabsList>
              <TabsContent value="assumptions">
                <MapList title="Assumptions" items={map.assumptions.map((item) => `${item.text} (${Math.round(item.confidence * 100)}%)`)} />
                <Button size="sm" variant="outline" className="mt-3" onClick={() => handleMapAdd("assumptions", "assumption")}>
                  Add Assumption
                </Button>
              </TabsContent>
              <TabsContent value="options">
                <MapList title="Options" items={map.options.map((item) => `${item.text}${item.notes ? ` — ${item.notes}` : ""}`)} />
                <Button size="sm" variant="outline" className="mt-3" onClick={() => handleMapAdd("options", "option")}>
                  Add Option
                </Button>
              </TabsContent>
              <TabsContent value="evidence">
                <MapList
                  title="Evidence"
                  items={map.evidence.map(
                    (item) =>
                      `${item.text}${item.weight ? ` (${Math.round(item.weight * 100)}%)` : ""}${item.link ? ` → ${item.link}` : ""}`,
                  )}
                />
                <Button size="sm" variant="outline" className="mt-3" onClick={() => handleMapAdd("evidence", "evidence")}>
                  Add Evidence
                </Button>
              </TabsContent>
              <TabsContent value="risks">
                <MapList
                  title="Risks"
                  items={map.risks.map((item) => `${item.text}${item.mitigation ? ` — Mitigation: ${item.mitigation}` : ""}`)}
                />
                <Button size="sm" variant="outline" className="mt-3" onClick={() => handleMapAdd("risks", "risk")}>
                  Add Risk
                </Button>
              </TabsContent>
              <TabsContent value="criteria">
                <MapList
                  title="Criteria"
                  items={map.criteria.map((item) => `${item.name} (${Math.round((item.weight ?? 0) * 100)}%)`)}
                />
                <Button size="sm" variant="outline" className="mt-3" onClick={() => handleMapAdd("criteria", "criterion")}>
                  Add Criterion
                </Button>
              </TabsContent>
              <TabsContent value="bias">
                <MapList
                  title="Bias Watch"
                  items={
                    map.biasFlags.length
                      ? map.biasFlags.map((flag) => `${flag.type}${flag.note ? ` — ${flag.note}` : ""}`)
                      : ["No bias flags yet."]
                  }
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MapList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2 text-sm">
      <p className="text-xs uppercase text-slate-500">{title}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-700">
            {item}
          </li>
        ))}
        {items.length === 0 && <li className="text-xs text-slate-500">No entries yet.</li>}
      </ul>
    </div>
  );
}
