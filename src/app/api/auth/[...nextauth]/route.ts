export const runtime = "nodejs";

import { authHandlers } from "@/server/auth";

export const GET = authHandlers.GET;
export const POST = authHandlers.POST;
