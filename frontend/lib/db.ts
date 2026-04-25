import { MongoClient, ObjectId, type Db, type Collection } from "mongodb";

const URI = (process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017").trim();
const DB_NAME = (process.env.MONGODB_DB ?? "claimshield").trim();

declare global {
  // eslint-disable-next-line no-var
  var __claimshield_mongo:
    | { client: MongoClient; clientPromise: Promise<MongoClient> }
    | undefined;
}

function getClient(): Promise<MongoClient> {
  if (globalThis.__claimshield_mongo) {
    return globalThis.__claimshield_mongo.clientPromise;
  }
  const client = new MongoClient(URI);
  const clientPromise = client.connect().then(async (c) => {
    await ensureIndexes(c.db(DB_NAME));
    return c;
  });
  globalThis.__claimshield_mongo = { client, clientPromise };
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const c = await getClient();
  return c.db(DB_NAME);
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("policies").createIndex({ user_id: 1, created_at: -1 }),
    db.collection("cases").createIndex({ user_id: 1, created_at: -1 }),
    db.collection("cases").createIndex({ policy_id: 1 }),
  ]);
}

export type UserDoc = {
  _id: ObjectId;
  email: string;
  password_hash: string;
  created_at: Date;
};

export type EmbeddedDoc = {
  _id: ObjectId;
  doc_type: string;
  original_name: string;
  stored_path: string;
  size_bytes: number;
  mime_type: string | null;
  uploaded_at: Date;
};

export type PolicyDoc = {
  _id: ObjectId;
  user_id: ObjectId;
  insurer: string;
  policy_name: string | null;
  policy_number: string | null;
  sum_insured: string | null;
  valid_till: string | null;
  status: string;
  created_at: Date;
  documents: EmbeddedDoc[];
};

export type CaseDoc = {
  _id: ObjectId;
  user_id: ObjectId;
  policy_id: ObjectId;
  patient_name: string;
  hospital: string | null;
  diagnosis: string | null;
  admission_date: string | null;
  risk_score: string | null;
  status: string;
  created_at: Date;
  documents: EmbeddedDoc[];
};

export async function users(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>("users");
}
export async function policies(): Promise<Collection<PolicyDoc>> {
  return (await getDb()).collection<PolicyDoc>("policies");
}
export async function cases(): Promise<Collection<CaseDoc>> {
  return (await getDb()).collection<CaseDoc>("cases");
}

export function toObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export { ObjectId };
