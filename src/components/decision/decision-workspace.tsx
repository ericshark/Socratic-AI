"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DecisionMapInput } from "@core/index";

interface DecisionWorkspaceProps {
  decision: {
    id: string;
    title: string;
    problem: string;
    depth: string;
  };
  initialMap: DecisionMapInput;
}

type MapSectionKey = "assumptions" | "options" | "evidence" | "risks" | "criteria";

export function DecisionWorkspace({ decision, initialMap }: DecisionWorkspaceProps) {
  const [map, setMap] = useState<DecisionMapInput>(initialMap);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assumptionDraft, setAssumptionDraft] = useState("");
  const [optionDraft, setOptionDraft] = useState("");
  const [evidenceDraft, setEvidenceDraft] = useState("");
  const [riskDraft, setRiskDraft] = useState("");
  const [criteriaDraft, setCriteriaDraft] = useState("");
  const [reviewAt, setReviewAt] = useState("");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const persistMap = useCallback(
    async (updates: Partial<DecisionMapInput>) => {
      setSaving(true);
      setError(null);
      try {
        const response = await fetch(`/api/decisions/${decision.id}/map`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(updates),
        });

        const detail = (await response.json().catch(() => ({}))) as {
          map?: DecisionMapInput;
          error?: string;
        };

        if (!response.ok || !detail.map) {
          throw new Error(detail.error ?? "Unable to save decision map");
        }

        setMap(detail.map);
      } catch (err) {
        setError((err as Error).message ?? "Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [decision.id],
  );

  const handleAddAssumption = async () => {
    const value = assumptionDraft.trim();
    if (!value) return;
    await persistMap({ assumptions: [...map.assumptions, { text: value, confidence: 0.5 }] });
    setAssumptionDraft("");
  };

  const handleAddOption = async () => {
    const value = optionDraft.trim();
    if (!value) return;
    await persistMap({ options: [...map.options, { text: value }] });
    setOptionDraft("");
  };

  const handleAddEvidence = async () => {
    const value = evidenceDraft.trim();
    if (!value) return;
    await persistMap({ evidence: [...map.evidence, { text: value }] });
    setEvidenceDraft("");
  };

  const handleAddRisk = async () => {
    const value = riskDraft.trim();
    if (!value) return;
    await persistMap({ risks: [...map.risks, { text: value }] });
    setRiskDraft("");
  };

  const handleAddCriterion = async () => {
    const value = criteriaDraft.trim();
    if (!value) return;
    await persistMap({ criteria: [...map.criteria, { name: value }] });
    setCriteriaDraft("");
  };

  const removeItem = async (section: MapSectionKey, index: number) => {
    const current = map[section] ?? [];
    const next = current.filter((_, itemIndex) => itemIndex !== index);
    await persistMap({ [section]: next } as Partial<DecisionMapInput>);
  };

  const scheduleReview = useCallback(
    async (dateValue: string) => {
      if (!dateValue) {
        setReviewMessage("Pick a review date first.");
        return;
      }

      setReviewMessage(null);
      try {
        const response = await fetch(`/api/reviews/${decision.id}/schedule`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reviewAt: dateValue }),
        });
        if (!response.ok) {
          throw new Error("Could not schedule review");
        }
        setReviewMessage("Review reminder saved.");
        setReviewAt("");
      } catch (err) {
        setReviewMessage((err as Error).message ?? "Could not schedule review");
      }
    },
    [decision.id],
  );

  const stats = useMemo(
    () => [
      { label: "Assumptions", value: map.assumptions.length },
      { label: "Options", value: map.options.length },
      { label: "Evidence", value: map.evidence.length },
      { label: "Risks", value: map.risks.length },
    ],
    [map.assumptions.length, map.options.length, map.evidence.length, map.risks.length],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="space-y-6">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-xs uppercase tracking-[0.3em]">
                {decision.depth}
              </Badge>
              {saving ? <span className="text-xs text-white/60">Saving…</span> : null}
              {error ? <span className="text-xs text-rose-300">{error}</span> : null}
            </div>
            <CardTitle className="text-2xl font-semibold text-white">{decision.title}</CardTitle>
            <CardDescription className="text-sm text-white/65">{decision.problem}</CardDescription>
          </CardHeader>
        </Card>

        <CaptureSection
          title="Assumptions"
          placeholder="What must be true?"
          value={assumptionDraft}
          onChange={setAssumptionDraft}
          onSubmit={handleAddAssumption}
          items={map.assumptions.map((item) => `${item.text} (${Math.round(item.confidence * 100)}%)`)}
          onRemove={(index) => void removeItem("assumptions", index)}
        />

        <CaptureSection
          title="Options"
          placeholder="What alternatives are you considering?"
          value={optionDraft}
          onChange={setOptionDraft}
          onSubmit={handleAddOption}
          items={map.options.map((item) => item.text)}
          onRemove={(index) => void removeItem("options", index)}
        />

        <CaptureSection
          title="Evidence"
          placeholder="Add supporting or challenging evidence"
          value={evidenceDraft}
          onChange={setEvidenceDraft}
          onSubmit={handleAddEvidence}
          textarea
          items={map.evidence.map((item) => item.text)}
          onRemove={(index) => void removeItem("evidence", index)}
        />

        <CaptureSection
          title="Risks"
          placeholder="Call out the risks or unknowns"
          value={riskDraft}
          onChange={setRiskDraft}
          onSubmit={handleAddRisk}
          items={map.risks.map((item) => item.text)}
          onRemove={(index) => void removeItem("risks", index)}
        />

        <CaptureSection
          title="Criteria"
          placeholder="What matters most when you decide?"
          value={criteriaDraft}
          onChange={setCriteriaDraft}
          onSubmit={handleAddCriterion}
          items={map.criteria.map((item) => item.name)}
          onRemove={(index) => void removeItem("criteria", index)}
        />
      </section>

      <aside className="space-y-6">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Progress snapshot</CardTitle>
            <CardDescription className="text-sm text-white/65">Keep every pillar filled before you call it.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {map.biasFlags.length ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Bias checks</p>
                <ul className="space-y-2 text-sm text-white/75">
                  {map.biasFlags.map((flag, index) => (
                    <li key={`${flag.type}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <span className="font-medium text-white">{flag.type}</span>
                      {flag.note ? <span className="ml-2 text-white/70">— {flag.note}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <CalendarDays className="size-4" />
              Next review
            </CardTitle>
            <CardDescription className="text-sm text-white/65">
              Pick a follow-up date so the decision stays alive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="date"
              value={reviewAt}
              onChange={(event) => setReviewAt(event.target.value)}
              className="bg-white/10"
            />
            <Button type="button" onClick={() => scheduleReview(reviewAt)} className="w-full">
              Save review reminder
            </Button>
            {reviewMessage ? <p className="text-xs text-white/60">{reviewMessage}</p> : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function CaptureSection({
  title,
  placeholder,
  value,
  onChange,
  onSubmit,
  items,
  onRemove,
  textarea,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  items: string[];
  onRemove: (index: number) => void;
  textarea?: boolean;
}) {
  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {textarea ? (
            <Textarea
              rows={3}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              className="bg-white/10"
            />
          ) : (
            <Input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              className="bg-white/10"
            />
          )}
          <Button type="button" size="sm" onClick={() => void handleSubmit()} className="flex items-center gap-2">
            <Plus className="size-4" /> Add
          </Button>
        </div>

        {items.length ? (
          <ul className="space-y-3 text-sm text-white/80">
            {items.map((item, index) => (
              <li key={`${title}-${index}`} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-pretty">{item}</p>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemove(index)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-white/55">Nothing captured yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

