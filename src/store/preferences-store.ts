import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  answerDelayEnabled: boolean;
  defaultDepth: "quick" | "standard" | "deep";
  enableVoiceCapture: boolean;
  toggleAnswerDelay: (value?: boolean) => void;
  setDefaultDepth: (depth: PreferencesState["defaultDepth"]) => void;
  toggleVoiceCapture: (value?: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      answerDelayEnabled: true,
      defaultDepth: "standard",
      enableVoiceCapture: false,
      toggleAnswerDelay(value) {
        set((state) => ({
          answerDelayEnabled: value ?? !state.answerDelayEnabled,
        }));
      },
      setDefaultDepth(depth) {
        set({ defaultDepth: depth });
      },
      toggleVoiceCapture(value) {
        set((state) => ({
          enableVoiceCapture: value ?? !state.enableVoiceCapture,
        }));
      },
    }),
    {
      name: "socratic-preferences",
    },
  ),
);
