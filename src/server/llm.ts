import { createLLMServices } from "@llm/index";

import { env } from "@/env";

export const llm = createLLMServices({
  apiKey: env.OPENAI_API_KEY,
  mock: !env.OPENAI_API_KEY,
});
