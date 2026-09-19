import { buildDashboard } from "@/lib/dashboard";

export const runtime = "nodejs";

export async function GET() {
  const payload = await buildDashboard();
  return Response.json(payload);
}
