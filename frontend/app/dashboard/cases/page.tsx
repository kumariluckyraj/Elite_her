import { cases, policies } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { serializeCase } from "@/lib/serialize";
import CasesClient, { type PolicyOption } from "./CasesClient";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const user = await requireUser();

  const policiesCol = await policies();
  const policyDocs = await policiesCol
    .find(
      { user_id: user._id },
      { projection: { insurer: 1, policy_name: 1, created_at: 1 } },
    )
    .sort({ created_at: -1 })
    .toArray();

  const policyById = new Map(policyDocs.map((p) => [p._id.toHexString(), p]));

  const casesCol = await cases();
  const list = await casesCol
    .find({ user_id: user._id })
    .sort({ created_at: -1 })
    .toArray();

  const initial = list.map((c) =>
    serializeCase(c, policyById.get(c.policy_id.toHexString()) ?? null),
  );

  const policyOptions: PolicyOption[] = policyDocs.map((p) => ({
    id: p._id.toHexString(),
    insurer: p.insurer,
    policy_name: p.policy_name,
  }));

  return <CasesClient initial={initial} policies={policyOptions} />;
}
