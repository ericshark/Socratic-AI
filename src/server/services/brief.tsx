import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { decisionMapSchema, forecastInputSchema } from "@core/index";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 12, fontFamily: "Helvetica" },
  heading: { fontSize: 18, marginBottom: 12, fontWeight: 700 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 600, marginBottom: 6 },
  bullet: { marginBottom: 4 },
});

interface ComposeBriefInput {
  decision: {
    id: string;
    title: string;
    problem: string;
    revealAllowed: boolean;
  };
  map: ReturnType<typeof decisionMapSchema.parse>;
  forecasts: Array<ReturnType<typeof forecastInputSchema.parse> & { outcome?: number | null }>;
}

function formatList(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

export function buildMarkdown({ decision, map, forecasts }: ComposeBriefInput) {
  const md: string[] = [];
  md.push(`# ${decision.title}`);
  md.push("\n## Context\n" + decision.problem);

  md.push(
    "\n## Assumptions\n" +
      formatList(
        map.assumptions.map(
          (item) => `${item.text} (${Math.round(item.confidence * 100)}% confidence)`,
        ),
      ),
  );
  md.push(
    "\n## Options\n" +
      formatList(map.options.map((item) => `${item.text}${item.notes ? ` — ${item.notes}` : ""}`)),
  );
  md.push(
    "\n## Evidence\n" +
      formatList(
        map.evidence.map(
          (item) =>
            `${item.text}${
              item.weight ? ` (${Math.round(item.weight * 100)}% weight)` : ""
            }${item.link ? ` → ${item.link}` : ""}`,
        ),
      ),
  );
  md.push(
    "\n## Risks\n" +
      formatList(
        map.risks.map(
          (item) => `${item.text}${item.mitigation ? ` — Mitigation: ${item.mitigation}` : ""}`,
        ),
      ),
  );
  md.push(
    "\n## Criteria\n" +
      formatList(
        map.criteria.map(
          (item) => `${item.name} (${Math.round((item.weight ?? 0) * 100)}%)`,
        ),
      ),
  );
  md.push(
    "\n## Bias Watch\n" +
      formatList(
        map.biasFlags.map((flag) => `${flag.type}${flag.note ? ` — ${flag.note}` : ""}`),
      ),
  );

  md.push(
    "\n## Decision Draft\n" +
      (decision.revealAllowed
        ? "Draft unlocked. Summarise key takeaways before sharing."
        : "Answer-Delay guard is active. Meet reveal rules to unlock the draft."),
  );

  md.push(
    "\n## Validation Plan\n" +
      formatList(
        map.risks
          .slice(0, 3)
          .map(
            (risk) =>
              `Pressure test "${risk.text}" with ${risk.mitigation ?? "a targeted experiment"}`,
          ),
      ),
  );

  const forecastLines = forecasts.length
    ? forecasts.map((forecast) => {
        const dueDate = new Date(forecast.dueAt).toLocaleDateString();
        const badge =
          forecast.outcome === 1 ? " ✅" : forecast.outcome === 0 ? " ❌" : "";
        return `${forecast.statement} — ${(forecast.probability * 100).toFixed(
          0,
        )}% by ${dueDate}${badge}`;
      })
    : ["No forecasts captured"];

  md.push("\n## Forecasts & Review Dates\n" + formatList(forecastLines));

  md.push("\n---\nNext review: Set via Socratic → Reviews");

  return md.join("\n\n");
}

export async function savePdf(decisionId: string, markdown: string) {
  const directory = join(process.cwd(), "public", "briefs");
  await mkdir(directory, { recursive: true });

  const lines = markdown.split(/\n+/);

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          {lines.map((line, index) => {
            if (line.startsWith("##")) {
              return (
                <Text key={index} style={styles.sectionTitle}>
                  {line.replace(/^##\s?/, "")}
                </Text>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <Text key={index} style={styles.bullet}>
                  {line}
                </Text>
              );
            }
            return (
              <Text key={index}>
                {line}
              </Text>
            );
          })}
        </View>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);
  const filename = `${decisionId}.pdf`;
  await writeFile(join(directory, filename), buffer);
  return `/briefs/${filename}`;
}

export async function composeDecisionBrief(input: ComposeBriefInput) {
  const markdown = buildMarkdown(input);
  const pdfUrl = await savePdf(input.decision.id, markdown);
  return { markdown, pdfUrl };
}
