import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
  }),
});

const db = getFirestore(app);

async function deleteWebpRecords() {
  try {
    console.log('🔍 Searching for WEBP records in processedImages collection...');

    const snapshot = await db.collection('processedImages').get();

    let deletedCount = 0;
    let totalCount = snapshot.size;

    console.log(`📊 Found ${totalCount} total records`);

    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore batch limit

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const hasWebp =
        data.originalPath?.includes('.webp') ||
        data.processedPath?.includes('.webp') ||
        data.originalFilename?.toLowerCase().includes('.webp');

      if (hasWebp) {
        console.log(`❌ Deleting WEBP record: ${doc.id} (${data.originalFilename})`);
        batch.delete(doc.ref);
        deletedCount++;
        batchCount++;

        // Commit batch if we hit the limit
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          console.log(`💾 Committed batch of ${batchCount} deletions`);
          batchCount = 0;
        }
      }
    }

    // Commit any remaining deletions
    if (batchCount > 0) {
      await batch.commit();
      console.log(`💾 Committed final batch of ${batchCount} deletions`);
    }

    console.log(`\n✅ Successfully deleted ${deletedCount} WEBP records out of ${totalCount} total records`);
    console.log(`📈 Remaining records: ${totalCount - deletedCount}`);

  } catch (error) {
    console.error('❌ Error deleting WEBP records:', error);
    process.exit(1);
  }
}

deleteWebpRecords()
  .then(() => {
    console.log('\n🎉 Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
