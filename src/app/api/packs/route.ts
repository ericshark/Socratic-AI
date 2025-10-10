import { NextRequest } from "next/server";

import { questionPackSchema } from "@core/index";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { ApiError, handleError } from "@/server/errors";
import { json, parseJsonBody } from "@/server/http";

export async function GET() {
  try {
    const packs = await prisma.questionPack.findMany({
      orderBy: { name: "asc" },
    });

    return json({ packs });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = await parseJsonBody(request, questionPackSchema);

    const pack = await prisma.questionPack.upsert({
      where: { slug: body.slug },
      update: {
        name: body.name,
        category: body.category,
        description: body.description,
        flow: body.flow,
        revealRules: body.revealRules,
        authorId: session.user.id,
      },
      create: {
        slug: body.slug,
        name: body.name,
        category: body.category,
        description: body.description,
        flow: body.flow,
        revealRules: body.revealRules,
        authorId: session.user.id,
      },
    });

    return json({ pack });
  } catch (error) {
    return handleError(error);
  }
}
