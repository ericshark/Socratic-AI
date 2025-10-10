"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { questionPackSchema } from "@core/index";

const flowStepSchema = questionPackSchema.shape.flow.element;

type FormValues = {
  slug: string;
  name: string;
  category: string;
  description: string;
  revealRules: Record<string, number>;
  flow: Array<typeof flowStepSchema._type>;
};

export function CreatePackForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(questionPackSchema),
    defaultValues: {
      slug: "",
      name: "",
      category: "",
      description: "",
      revealRules: {
        minAssumptions: 3,
        minAlternatives: 1,
        minTopRisks: 1,
      },
      flow: [
        { id: "step-1", type: "prompt", text: "What decision are you making?" },
        { id: "step-2", type: "prompt", text: "What must be true for success?" },
      ],
    },
  });

  const flowArray = useFieldArray({ control: form.control, name: "flow" });

  async function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const response = await fetch("/api/packs", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const detail = await response.json().catch(() => ({}));
          throw new Error(detail.error ?? "Failed to save pack");
        }
        toast.success("Pack saved", { description: "Now available in the new decision wizard." });
        router.push("/app/packs");
        router.refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="slug">
            Pack Slug
          </label>
          <Input
            id="slug"
            placeholder="product-should-we-build-x"
            {...form.register("slug")}
            aria-invalid={Boolean(form.formState.errors.slug)}
          />
          {form.formState.errors.slug && (
            <p className="text-xs text-rose-500">{form.formState.errors.slug.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="category">
            Category
          </label>
          <Input
            id="category"
            placeholder="product"
            {...form.register("category")}
            aria-invalid={Boolean(form.formState.errors.category)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">
          Name
        </label>
        <Input
          id="name"
          placeholder="Should we build X?"
          {...form.register("name")}
          aria-invalid={Boolean(form.formState.errors.name)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe what this pack is optimised for"
          {...form.register("description")}
          aria-invalid={Boolean(form.formState.errors.description)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reveal Rules</CardTitle>
          <CardDescription>Answer-Delay guard uses these thresholds before drafts unlock.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {Object.entries(form.watch("revealRules")).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-xs uppercase text-slate-500" htmlFor={key}>
                {key}
              </label>
              <Input
                id={key}
                type="number"
                min={0}
                value={value}
                onChange={(event) => form.setValue(`revealRules.${key}` as const, Number(event.target.value))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question Flow</CardTitle>
          <CardDescription>Define the Socratic prompts that coach the team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {flowArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between text-xs uppercase text-slate-500">
                <span>Step {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-500"
                  onClick={() => flowArray.remove(index)}
                  disabled={flowArray.fields.length <= 1}
                >
                  Remove
                </Button>
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-[1fr,120px]">
                <Input
                  placeholder="What assumption needs to be true?"
                  {...form.register(`flow.${index}.text` as const)}
                />
                <select
                  className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                  {...form.register(`flow.${index}.type` as const)}
                >
                  <option value="prompt">Prompt</option>
                  <option value="check">Check</option>
                  <option value="branch">Branch</option>
                </select>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              flowArray.append({ id: `step-${flowArray.fields.length + 1}`, type: "prompt", text: "" })
            }
          >
            Add Question Step
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save Question Pack"}
      </Button>
    </form>
  );
}
