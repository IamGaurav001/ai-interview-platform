import admin from "firebase-admin";



if (!admin.apps.length) {
  try {
    
    
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log("✅ Firebase Admin initialized with environment variables");
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log("✅ Firebase Admin initialized with service account file");
    } else {
      
      
      console.warn("⚠️  Firebase Admin: No credentials found. Using project ID only.");
      console.warn("⚠️  Token verification will fail. Please set up Firebase Admin credentials.");
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "ai-interview-coach-71c37",
      });
    }
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error.message);
    console.error("❌ Authentication will not work until Firebase Admin is properly configured.");
    
    try {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "ai-interview-coach-71c37",
      });
    } catch (fallbackError) {
      console.error("❌ Failed to initialize Firebase Admin:", fallbackError.message);
    }
  }
}

export default admin;

