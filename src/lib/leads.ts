import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Lead } from "@/lib/firestore-schema";

export async function captureLead(input: { email: string; name?: string; source: string; magnetSlug?: string }) {
  const lead: Lead = { ...input, createdAt: Date.now() };
  await addDoc(collection(db, "leads"), lead);
}
