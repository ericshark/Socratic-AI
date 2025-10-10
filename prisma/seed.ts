/* eslint-disable no-console */
import { DecisionDepth, DecisionStatus, PrismaClient, TeamRoundPhase, TeamRole } from "@prisma/client";

const prisma = new PrismaClient();

const basePacks = [
  {
    slug: "product-should-we-build-x",
    name: "Should we build X?",
    category: "product",
    description: "Decide whether to build a new feature or product.",
    revealRules: {
      minAssumptions: 3,
      minAlternatives: 1,
      minTopRisks: 1,
    },
    flow: [
      { id: "p1", type: "prompt", text: "Who is this for and what job are they hiring it for?" },
      { id: "p2", type: "prompt", text: "What must be true for this to be a win? List 3." },
      { id: "p3", type: "prompt", text: "What is the best plausible alternative (incl. do nothing)?" },
      { id: "p4", type: "prompt", text: "Top 3 risks and cheap tests for each." },
      { id: "p5", type: "prompt", text: "Define success in 30/90 days and a falsification trigger." },
      { id: "p6", type: "prompt", text: "Write a 2-step validation plan for next 7 days." },
    ],
  },
  {
    slug: "hiring-senior-engineer",
    name: "Should we hire this senior engineer?",
    category: "hiring",
    description: "Evaluate senior engineering candidates with structured diligence.",
    revealRules: {
      minAssumptions: 3,
      minAlternatives: 2,
      minTopRisks: 1,
    },
    flow: [
      { id: "h1", type: "prompt", text: "What outcomes does this role own in the next 180 days?" },
      { id: "h2", type: "prompt", text: "List their superpowers and evidence backing each." },
      { id: "h3", type: "prompt", text: "What failure modes worry you?" },
      { id: "h4", type: "prompt", text: "Who is the alternative candidate or plan?" },
      { id: "h5", type: "prompt", text: "Define onboarding proof points and exit criteria." },
    ],
  },
  {
    slug: "strategy-market-entry",
    name: "Market Entry Strategy",
    category: "strategy",
    description: "Frame a go-to-market decision with clear options and risks.",
    revealRules: {
      minAssumptions: 4,
      minAlternatives: 2,
      minTopRisks: 2,
    },
    flow: [
      { id: "s1", type: "prompt", text: "What shifts in the market make this urgent?" },
      { id: "s2", type: "prompt", text: "What must be true for this to be our best play?" },
      { id: "s3", type: "prompt", text: "List the credible strategies competing for focus." },
      { id: "s4", type: "prompt", text: "Map the risks by impact/likelihood and owners." },
      { id: "s5", type: "prompt", text: "What experiments validate or kill this fast?" },
    ],
  },
  {
    slug: "learning-upskill-plan",
    name: "Learning Roadmap",
    category: "learning",
    description: "Design a learning plan with milestones and accountability.",
    revealRules: {
      minAssumptions: 2,
      minAlternatives: 1,
      minTopRisks: 1,
    },
    flow: [
      { id: "l1", type: "prompt", text: "What capability gap are we closing?" },
      { id: "l2", type: "prompt", text: "Which experiences or projects accelerate learning?" },
      { id: "l3", type: "prompt", text: "Who keeps score and how often?" },
      { id: "l4", type: "prompt", text: "What could derail this and how do we mitigate?" },
    ],
  },
  {
    slug: "code-review-decision",
    name: "Critical Code Review",
    category: "code review",
    description: "Stress-test an architectural decision before shipping.",
    revealRules: {
      minAssumptions: 3,
      minAlternatives: 1,
      minTopRisks: 2,
    },
    flow: [
      { id: "c1", type: "prompt", text: "Summarise the change and user impact in plain language." },
      { id: "c2", type: "prompt", text: "Which assumptions about scale or load are we making?" },
      { id: "c3", type: "prompt", text: "What safer alternative did we reject and why?" },
      { id: "c4", type: "prompt", text: "List failure modes and blast radius if they happen." },
      { id: "c5", type: "prompt", text: "Define the rollback plan and monitoring hooks." },
    ],
  },
];

async function seedQuestionPacks() {
  for (const pack of basePacks) {
    await prisma.questionPack.upsert({
      where: { slug: pack.slug },
      update: {
        name: pack.name,
        category: pack.category,
        description: pack.description,
        flow: pack.flow,
        revealRules: pack.revealRules,
      },
      create: {
        slug: pack.slug,
        name: pack.name,
        category: pack.category,
        description: pack.description,
        flow: pack.flow,
        revealRules: pack.revealRules,
      },
    });
  }
}

async function seedDemoWorkspace() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@socratic.local" },
    update: {},
    create: {
      email: "demo@socratic.local",
      name: "Demo Coach",
      image: "https://avatars.githubusercontent.com/u/000000?v=4",
    },
  });

  const demoTeam = await prisma.team.upsert({
    where: { id: "demo-team" },
    update: {},
    create: {
      id: "demo-team",
      name: "Socratic Demo Team",
    },
  });

  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: demoTeam.id,
        userId: demoUser.id,
      },
    },
    update: {
      role: TeamRole.owner,
    },
    create: {
      userId: demoUser.id,
      teamId: demoTeam.id,
      role: TeamRole.owner,
    },
  });

  const pack = await prisma.questionPack.findUnique({
    where: { slug: "product-should-we-build-x" },
  });

  const demoDecision = await prisma.decision.upsert({
    where: { id: "demo-decision" },
    update: {},
    create: {
      id: "demo-decision",
      title: "Should we launch Focus Mode?",
      problem:
        "Design a killer Focus Mode for Socratic that helps PMs run async decision reviews without losing context.",
      depth: DecisionDepth.quick,
      status: DecisionStatus.in_progress,
      revealAllowed: false,
      userId: demoUser.id,
      teamId: demoTeam.id,
      packId: pack?.id,
    },
    include: {
      map: true,
    },
  });

  await prisma.decisionMap.upsert({
    where: { decisionId: demoDecision.id },
    update: {
      assumptions: [
        { text: "Teams want async reviews to save meeting time", confidence: 0.6 },
        { text: "Updates need lightweight structure", confidence: 0.7 },
        { text: "Leaders will contribute if prompts are sharp", confidence: 0.5 },
      ],
      options: [
        {
          text: "Ship Focus Mode with timed prompts",
          notes: "Lean MVP using existing question packs.",
        },
        {
          text: "Bundle with Slack workflow",
          notes: "Higher effort but unlocks alerts.",
        },
      ],
      evidence: [
        { text: "12/15 beta teams asked for async flow", weight: 0.7 },
        {
          text: "Competitor InsightLoop drives 30% upgrades with similar feature",
          link: "https://example.com/insightloop",
          weight: 0.4,
        },
      ],
      risks: [
        {
          text: "No engagement -> feature graveyard",
          mitigation: "Seed templates & notifications",
        },
        {
          text: "Scope creep delays launch",
          mitigation: "Two-sprint guardrail",
        },
      ],
      criteria: [
        { name: "Adoption", weight: 0.4 },
        { name: "Build Effort", weight: 0.2 },
        { name: "Revenue", weight: 0.4 },
      ],
      biasFlags: [{ type: "single-option", note: "Need at least two real alternatives" }],
    },
    create: {
      decisionId: demoDecision.id,
      assumptions: [
        { text: "Teams want async reviews to save meeting time", confidence: 0.6 },
        { text: "Updates need lightweight structure", confidence: 0.7 },
        { text: "Leaders will contribute if prompts are sharp", confidence: 0.5 },
      ],
      options: [
        {
          text: "Ship Focus Mode with timed prompts",
          notes: "Lean MVP using existing question packs.",
        },
        {
          text: "Bundle with Slack workflow",
          notes: "Higher effort but unlocks alerts.",
        },
      ],
      evidence: [
        { text: "12/15 beta teams asked for async flow", weight: 0.7 },
        {
          text: "Competitor InsightLoop drives 30% upgrades with similar feature",
          link: "https://example.com/insightloop",
          weight: 0.4,
        },
      ],
      risks: [
        {
          text: "No engagement -> feature graveyard",
          mitigation: "Seed templates & notifications",
        },
        {
          text: "Scope creep delays launch",
          mitigation: "Two-sprint guardrail",
        },
      ],
      criteria: [
        { name: "Adoption", weight: 0.4 },
        { name: "Build Effort", weight: 0.2 },
        { name: "Revenue", weight: 0.4 },
      ],
      biasFlags: [{ type: "single-option", note: "Need at least two real alternatives" }],
    },
  });

  await prisma.teamRound.upsert({
    where: { id: "demo-round" },
    update: {
      phase: TeamRoundPhase.merge,
      entries: {
        demoUser: {
          assumptions: [
            { text: "Decision rooms already overloaded", confidence: 0.5 },
          ],
          options: [
            {
              text: "Launch with highlight summary AI",
              confidence: 0.4,
            },
          ],
        },
      },
      heatmap: {
        assumptions: {
          variance: 0.3,
          hotspots: ["Engagement", "Pricing"],
        },
      },
    },
    create: {
      id: "demo-round",
      decisionId: demoDecision.id,
      phase: TeamRoundPhase.merge,
      entries: {
        demoUser: {
          assumptions: [
            { text: "Decision rooms already overloaded", confidence: 0.5 },
          ],
          options: [
            {
              text: "Launch with highlight summary AI",
              confidence: 0.4,
            },
          ],
        },
      },
      heatmap: {
        assumptions: {
          variance: 0.3,
          hotspots: ["Engagement", "Pricing"],
        },
      },
    },
  });
}

async function main() {
  console.info("🌱 Seeding Socratic data");
  await seedQuestionPacks();
  await seedDemoWorkspace();
  console.info("✅ Seed completed");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.();
  });
