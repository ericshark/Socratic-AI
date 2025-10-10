export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return new Response(JSON.stringify({ error: error.message, details: error.details }), {
      status: error.status,
      headers: { "content-type": "application/json" },
    });
  }

  console.error("API Error", error);
  return new Response(JSON.stringify({ error: "Unexpected server error" }), {
    status: 500,
    headers: { "content-type": "application/json" },
  });
}
