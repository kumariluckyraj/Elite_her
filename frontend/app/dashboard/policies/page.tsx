import { policies } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { serializePolicy } from "@/lib/serialize";
import PoliciesClient from "./PoliciesClient";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const user = await requireUser();
  const col = await policies();
  const docs = await col
    .find({ user_id: user._id })
    .sort({ created_at: -1 })
    .toArray();

  return <PoliciesClient initial={docs.map(serializePolicy)} />;
}
