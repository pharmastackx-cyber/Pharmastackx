
import * as admin from 'firebase-admin';

// Check if the SDK has already been initialized
if (!admin.apps.length) {
  const serviceAccountStr = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

  if (!serviceAccountStr) {
    throw new Error('The GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable is not set.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountStr);

    // Vercel can sometimes escape newlines. This line ensures the private key is correctly formatted.
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    // Log a more descriptive error to help with debugging
    console.error("Firebase Admin Initialization Error:", error.message);
    throw new Error("Failed to parse or initialize Firebase Admin SDK. Check the GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable.");
  }
}

/**
 * Returns the initialized Firebase Admin SDK instance.
 * @returns {admin.app.App} The Firebase Admin SDK instance.
 */
export function getFirebaseAdmin() {
  return admin;
}
