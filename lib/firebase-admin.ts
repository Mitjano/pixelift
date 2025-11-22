import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App;
let adminDb: Firestore;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    // No storageBucket - we store Replicate URLs directly in Firestore
    // This prevents WEBP decoder errors from Firebase Storage
  });
  adminDb = getFirestore(app);
} else {
  app = getApps()[0];
  adminDb = getFirestore(app);
}

export { app, adminDb };
