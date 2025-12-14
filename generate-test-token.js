const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with service account
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

// Generate a custom token for testing
async function generateTestToken() {
  try {
    // Create a custom token for a test user
    const uid = "test-user-" + Date.now();
    const customToken = await admin.auth().createCustomToken(uid);

    console.log("Custom Token generated successfully:");
    console.log(customToken);

    // Also try to create a custom auth token (this would normally be done by exchanging the custom token)
    console.log(
      "\nNote: This is a custom token that needs to be exchanged for an ID token via Firebase Auth."
    );
    console.log("To get an ID token, you would need to:");
    console.log("1. Use this custom token to sign in via Firebase Auth SDK");
    console.log("2. Then call user.getIdToken() to get the actual ID token");
    console.log(
      "3. Use the ID token in the Authorization header as Bearer <token>"
    );
  } catch (error) {
    console.error("Error generating token:", error);
  } finally {
    // Close the app
    admin.app().delete();
  }
}

generateTestToken();
