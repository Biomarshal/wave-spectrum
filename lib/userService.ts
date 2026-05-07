import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: 'listener' | 'admin';
  createdAt: number;
}

export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as UserProfile));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
