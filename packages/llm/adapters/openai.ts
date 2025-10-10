import type { ChatMessage, ChatOptions, LLMAdapter } from "../types";

export class OpenAIAdapter implements LLMAdapter {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly model = "gpt-4o-mini",
  ) {
    if (!this.apiKey) {
      throw new Error(
        "Missing OPENAI_API_KEY (PLACEHOLDER). Set .env or disable OpenAI in Settings → LLM Providers.",
      );
    }
  }

  async chat(messages: ChatMessage[], opts: ChatOptions = {}) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model ?? this.model,
        temperature: opts.temperature ?? 0.2,
        messages,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${detail}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }

    return content;
  }
}
