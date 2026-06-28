/**
 * Seed a staff account for the assessment dashboard.
 * Run after migrations: npx tsx scripts/seed-staff.ts
 */
import "dotenv/config";
import { auth } from "../lib/auth";

async function main() {
  const email = process.env.STAFF_EMAIL ?? "staff@example.com";
  const password = process.env.STAFF_PASSWORD ?? "StaffPass123!";
  const name = "Assessment Staff";

  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    if (result) {
      console.log(`Staff account created: ${email}`);
      console.log(`Password: ${password}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("already") || message.includes("exists")) {
      console.log(`Staff account already exists: ${email}`);
    } else {
      console.error("Failed to seed staff:", error);
      process.exit(1);
    }
  }
}

main();
