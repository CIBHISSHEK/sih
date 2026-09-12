import fs from "fs";
import path from "path";
import { initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "../env";

// Firebase Admin is only needed to verify ID tokens from real phone-number
// sign-in (see routes/auth.ts `/firebase-login`). It's initialised lazily and
// optionally — if no service account is configured, the app still runs fine
// with the mock OTP flow, it just can't accept Firebase-verified logins.
let app: App | null | undefined;

function loadApp(): App | null {
  if (app !== undefined) return app;

  if (!env.FIREBASE_SERVICE_ACCOUNT_PATH && !env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.log("No Firebase service account configured — real-phone login is disabled (mock OTP still works).");
    app = null;
    return app;
  }

  try {
    let serviceAccount: Record<string, unknown>;
    if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      const resolvedPath = path.isAbsolute(env.FIREBASE_SERVICE_ACCOUNT_PATH)
        ? env.FIREBASE_SERVICE_ACCOUNT_PATH
        : path.resolve(__dirname, "../../../..", env.FIREBASE_SERVICE_ACCOUNT_PATH);
      serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    }
    app = initializeApp({ credential: cert(serviceAccount as never) });
    console.log("Firebase Admin initialised — real-phone login via Firebase is enabled.");
  } catch (err) {
    console.error("Failed to initialise Firebase Admin — real-phone login disabled:", err);
    app = null;
  }

  return app;
}

export function isFirebaseConfigured(): boolean {
  return loadApp() !== null;
}

// Returns the verified E.164 phone number (e.g. "+919876543210") or null if
// the token is invalid/expired/not configured — callers fall back to a 503,
// never a crash.
export async function verifyFirebaseIdToken(idToken: string): Promise<string | null> {
  const firebaseApp = loadApp();
  if (!firebaseApp) return null;

  try {
    const decoded = await getAuth(firebaseApp).verifyIdToken(idToken);
    return decoded.phone_number ?? null;
  } catch (err) {
    console.error("Firebase ID token verification failed:", err);
    return null;
  }
}
