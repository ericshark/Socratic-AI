"use client";

import { usePreferencesStore } from "@/store/preferences-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const depthOptions = [
  { value: "quick", label: "Quick" },
  { value: "standard", label: "Standard" },
  { value: "deep", label: "Deep" },
] as const;

export function SettingsPreferences() {
  const answerDelayEnabled = usePreferencesStore((state) => state.answerDelayEnabled);
  const toggleAnswerDelay = usePreferencesStore((state) => state.toggleAnswerDelay);
  const defaultDepth = usePreferencesStore((state) => state.defaultDepth);
  const setDefaultDepth = usePreferencesStore((state) => state.setDefaultDepth);
  const enableVoiceCapture = usePreferencesStore((state) => state.enableVoiceCapture);
  const toggleVoiceCapture = usePreferencesStore((state) => state.toggleVoiceCapture);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="font-medium text-white">Focus reminders</p>
          <p className="text-xs text-white/55">
            Nudge the team to fill assumptions, options, and risks before making the call.
          </p>
        </div>
        <Switch checked={answerDelayEnabled} onCheckedChange={(checked) => toggleAnswerDelay(checked)} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-medium text-white">Default depth</p>
        <p className="text-xs text-white/55">Choose the default flow intensity for new decisions.</p>
        <Tabs defaultValue={defaultDepth} className="mt-3">
          <TabsList>
            {depthOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value} onClick={() => setDefaultDepth(option.value)}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {depthOptions.map((option) => (
            <TabsContent key={option.value} value={option.value}>
              <p className="text-xs text-white/55">
                {option.value === "quick"
                  ? "6 core prompts to frame a decision quickly."
                  : option.value === "standard"
                    ? "Balanced workflow with guardrails before reveal."
                    : "Expanded questioning with critic and mapper loops."}
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="font-medium text-white">Voice capture (placeholder)</p>
          <p className="text-xs text-white/55">
            Record quick notes in the problem pane. Requires browser permission (feature flagged).
          </p>
        </div>
        <Switch checked={enableVoiceCapture} onCheckedChange={(checked) => toggleVoiceCapture(checked)} />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          toggleAnswerDelay(true);
          setDefaultDepth("standard");
          toggleVoiceCapture(false);
        }}
        className="rounded-full border-white/20 px-5"
      >
        Reset to defaults
      </Button>
    </div>
  );
}
