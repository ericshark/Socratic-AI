import { readFileSync } from "node:fs";

const cache = new Map<string, string>();

function loadPrompt(name: string) {
  if (!cache.has(name)) {
    const url = new URL(name, import.meta.url);
    const content = readFileSync(url, "utf-8");
    cache.set(name, content);
  }
  return cache.get(name)!;
}

export const QUESTION_PROMPT = loadPrompt("./questions.md");
export const MAPPER_PROMPT = loadPrompt("./mapper.md");
export const CRITIC_PROMPT = loadPrompt("./critic.md");
export const BRIEF_PROMPT = loadPrompt("./brief.md");
