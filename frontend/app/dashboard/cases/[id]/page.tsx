import { notFound } from "next/navigation";
import { cases, policies, toObjectId } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { serializeCase } from "@/lib/serialize";
import CaseDetailClient from "./CaseDetailClient";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: PageProps<"/dashboard/cases/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const oid = toObjectId(id);
  if (!oid) notFound();

  const casesCol = await cases();
  const caseDoc = await casesCol.findOne({ _id: oid, user_id: user._id });
  if (!caseDoc) notFound();

  const policiesCol = await policies();
  const policy = await policiesCol.findOne(
    { _id: caseDoc.policy_id },
    { projection: { insurer: 1, policy_name: 1 } },
  );

  return <CaseDetailClient initial={serializeCase(caseDoc, policy)} />;
}
