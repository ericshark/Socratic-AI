import { describe, expect, it } from "vitest";

import { Mapper, buildAdapter } from "@llm/index";

const transcript = [
  { q: "What must be true?", a: "Customers adopt weekly" },
  { q: "What alternatives exist?", a: "Do nothing" },
];

describe("Mapper", () => {
  it("normalises transcript into decision map", async () => {
    const adapter = buildAdapter({ mock: true });
    const mapper = new Mapper(adapter);
    const map = await mapper.normalize(transcript);

    expect(Array.isArray(map.assumptions)).toBe(true);
    expect(map.assumptions.length).toBeGreaterThan(0);
    expect(map.options.length).toBeGreaterThan(0);
    expect(map.biasFlags.length).toBeGreaterThan(0);
  });
});
