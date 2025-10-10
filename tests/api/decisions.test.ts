import { describe, expect, it, vi } from "vitest";
import { POST as createDecision } from "@/app/api/decisions/route";

vi.mock("@/server/auth", () => ({
  auth: vi.fn(),
}));

const { auth } = await import("@/server/auth");
const mockedAuth = auth as unknown as vi.MockedFunction<typeof auth>;

describe("POST /api/decisions", () => {
  it("returns 401 when unauthenticated", async () => {
    mockedAuth.mockResolvedValue(null as any);
    const request = new Request("http://localhost/api/decisions", {
      method: "POST",
      body: JSON.stringify({ title: "T", problem: "P", depth: "quick" }),
      headers: { "content-type": "application/json" },
    });

    const response = await createDecision(request as any);
    expect(response.status).toBe(401);
  });
});
