// Grants (or revokes) the "admin" custom claim on a Firebase Auth user by e-mail.
// Usage:
//   bun scripts/set-admin-role.mjs someone@example.com
//   bun scripts/set-admin-role.mjs someone@example.com --revoke
//
// Requires FIREBASE_SERVICE_ACCOUNT in the environment (see .env.example).
// Role lives ONLY in the custom claim, never in Firestore — see the note in
// src/lib/firestore-schema.ts on why `profiles/{uid}` never stores it.
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

async function main() {
  const [email, flag] = process.argv.slice(2);
  if (!email) {
    console.error("Usage: bun scripts/set-admin-role.mjs <email> [--revoke]");
    process.exit(1);
  }
  const revoke = flag === "--revoke";

  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const app = initializeApp({ credential: cert(sa) });
  const auth = getAuth(app);

  const user = await auth.getUserByEmail(email);
  const nextClaims = { ...user.customClaims, role: revoke ? "cliente" : "admin" };
  await auth.setCustomUserClaims(user.uid, nextClaims);

  console.log(
    `${revoke ? "Revoked" : "Granted"} admin role for ${email} (uid: ${user.uid}). ` +
      "The user must sign out and back in (or wait for their ID token to refresh) for it to take effect.",
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
