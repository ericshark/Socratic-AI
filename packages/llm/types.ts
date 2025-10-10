export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
}

export interface LLMAdapter {
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<string>;
}
