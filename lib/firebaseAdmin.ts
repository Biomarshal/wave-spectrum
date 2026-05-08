import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminConfig),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

export async function verifyAdmin(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    console.log('[Auth Debug] Auth header exists:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Auth Debug] Missing or invalid auth header');
      return { error: 'Missing or invalid auth header' };
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Debugging Token Info (Optional: only if you really need to see the raw token)
    // console.log('[Auth Debug] ID Token length:', idToken.length);

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (err: any) {
      console.error('[Auth Debug] Token verification failed:', err.message);
      return { error: `Token verification failed: ${err.message}` };
    }

    const uid = decodedToken.uid;
    console.log('[Auth Debug] Decoded UID:', uid);
    console.log('[Auth Debug] Project ID in token:', (decodedToken as any).firebase?.identities ? 'Exists' : 'Check project ID');
    
    // Check if the project ID matches
    const expectedProjectId = process.env.FIREBASE_PROJECT_ID;
    console.log('[Auth Debug] Expected Project ID:', expectedProjectId);

    const userDocRef = adminDb.collection('users').doc(uid);
    console.log('[Auth Debug] Fetching doc at path:', `users/${uid}`);
    
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
      console.error('[Auth Debug] User document does not exist in Firestore for UID:', uid);
      return { error: `User document not found for UID: ${uid}` };
    }

    const userData = userDoc.data();
    console.log('[Auth Debug] Fetched user data:', JSON.stringify(userData));
    console.log('[Auth Debug] User role:', userData?.role);

    if (!userData || userData.role !== 'admin') {
      console.error('[Auth Debug] Forbidden: User is not an admin. Role:', userData?.role);
      return { error: `Access denied: Role is ${userData?.role || 'undefined'}` };
    }

    return { uid, ...userData };
  } catch (error: any) {
    console.error('[Auth Debug] Verify admin unexpected error:', error);
    return { error: error.message || 'Internal verification error' };
  }
}


