import { z } from "zod";

import { ApiError } from "@/server/errors";

export async function parseJsonBody<T extends z.ZodTypeAny>(request: Request, schema: T) {
  const data = await request.json().catch(() => {
    throw new ApiError(400, "Invalid JSON body");
  });

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(400, "Validation failed", result.error.flatten());
  }

  return result.data;
}

export function json<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}
