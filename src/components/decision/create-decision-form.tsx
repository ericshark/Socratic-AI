"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDecisionSchema, type QuestionPackInput } from "@core/index";

const depthOptions = [
  { value: "quick", label: "Quick" },
  { value: "standard", label: "Standard" },
  { value: "deep", label: "Deep" },
] as const;

type FormValues = {
  title: string;
  problem: string;
  depth: "quick" | "standard" | "deep";
  packSlug?: string;
  teamId?: string;
};

interface CreateDecisionFormProps {
  packs: Array<Pick<QuestionPackInput, "slug" | "name" | "category" | "description">>;
  teams: Array<{ id: string; name: string }>;
  defaultDepth?: FormValues["depth"];
}

export function CreateDecisionForm({ packs, teams, defaultDepth = "standard" }: CreateDecisionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checkingReveal, setCheckingReveal] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createDecisionSchema.partial({ teamId: true, packSlug: true })),
    defaultValues: {
      title: "",
      problem: "",
      depth: defaultDepth,
      packSlug: packs.at(0)?.slug,
      teamId: teams.at(0)?.id,
    },
  });

  async function onSubmit(values: FormValues) {
    setCheckingReveal(true);
    try {
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.error ?? "Failed to create decision");
      }

      const result = (await response.json()) as { decisionId: string };
      toast.success("Decision created", {
        description: "Let's start the Socratic flow.",
      });

      startTransition(() => {
        router.push(`/app/decisions/${result.decisionId}`);
        router.refresh();
      });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setCheckingReveal(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="title">
          Decision Title
        </label>
        <Input
          id="title"
          placeholder="Should we..."
          {...form.register("title")}
          aria-invalid={Boolean(form.formState.errors.title)}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-rose-600">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="problem">
          Problem Context
        </label>
        <Textarea
          id="problem"
          rows={5}
          placeholder="Describe the decision, what’s at stake, and what success looks like."
          {...form.register("problem")}
        />
        {form.formState.errors.problem && (
          <p className="text-xs text-rose-600">{form.formState.errors.problem.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="pack">
            Question Pack
          </label>
          <select
            id="pack"
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            {...form.register("packSlug")}
          >
            {packs.map((pack) => (
              <option key={pack.slug} value={pack.slug}>
                {pack.name} · {pack.category}
              </option>
            ))}
            <option value="">Custom (no pack)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="depth">
            Depth
          </label>
          <select
            id="depth"
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            {...form.register("depth")}
          >
            {depthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {teams.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="team">
            Team (optional)
          </label>
          <select
            id="team"
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            {...form.register("teamId")}
          >
            <option value="">Personal decision</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Answer-Delay guard is enabled by default. Configure in Settings.</span>
      </div>

      <Button type="submit" disabled={isPending || checkingReveal} className="w-full">
        {checkingReveal ? "Creating decision…" : "Start Socratic Flow"}
      </Button>
    </form>
  );
}
