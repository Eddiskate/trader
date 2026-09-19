import { buildDashboard } from "@/lib/dashboard";
import { setWatched } from "@/lib/store";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const body = (await request.json()) as { watched?: string[] };
  if (!Array.isArray(body.watched)) {
    return Response.json({ error: "Podaj listę walut." }, { status: 400 });
  }
  await setWatched(body.watched);
  return Response.json(await buildDashboard());
}
