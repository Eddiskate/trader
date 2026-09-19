import { buildDashboard } from "@/lib/dashboard";
import { deleteTrade } from "@/lib/store";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id) {
    return Response.json({ error: "Brak identyfikatora wymiany." }, { status: 400 });
  }
  await deleteTrade(id);
  return Response.json(await buildDashboard());
}
