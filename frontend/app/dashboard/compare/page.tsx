import { cases, policies } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { serializeCase, serializePolicy } from "@/lib/serialize";
import CompareClient from "./CompareClient";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams,
}: PageProps<"/dashboard/compare">) {
  const user = await requireUser();
  const sp = await searchParams;
  const caseIdParam = typeof sp?.case === "string" ? sp.case : undefined;

  const casesCol = await cases();
  const caseList = await casesCol
    .find({ user_id: user._id })
    .sort({ created_at: -1 })
    .toArray();

  const policiesCol = await policies();
  const policyList = await policiesCol
    .find({ user_id: user._id })
    .sort({ created_at: -1 })
    .toArray();

  const policyById = new Map(
    policyList.map((p) => [p._id.toHexString(), p]),
  );

  const initialCases = caseList.map((c) =>
    serializeCase(c, policyById.get(c.policy_id.toHexString()) ?? null),
  );
  const initialPolicies = policyList.map(serializePolicy);

  const initialCaseId =
    caseIdParam && initialCases.some((c) => c.id === caseIdParam)
      ? caseIdParam
      : initialCases[0]?.id ?? null;

  return (
    <CompareClient
      cases={initialCases}
      policies={initialPolicies}
      initialCaseId={initialCaseId}
    />
  );
}
