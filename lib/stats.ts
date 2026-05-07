import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  query, 
  limit, 
  getDocs,
  orderBy
} from 'firebase/firestore';

/**
 * Saves a song to the user's listening history
 */
export const saveListeningHistory = async (uid: string, song: any, seconds: number) => {
  if (!uid || !song || seconds <= 0) return;

  try {
    const historyRef = collection(db, 'users', uid, 'history');
    await addDoc(historyRef, {
      songId: song.id,
      title: song.title,
      artist: song.artist || 'Unknown Artist',
      audioUrl: song.audioUrl,
      playedAt: Date.now(),
      duration: seconds
    });
  } catch (error) {
    console.error('Error saving listening history:', error);
  }
};

/**
 * Updates the user's daily listening stats
 */
export const updateDailyStats = async (uid: string, seconds: number) => {
  if (!uid || seconds <= 0) return;

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const statsRef = doc(db, 'users', uid, 'dailyStats', today);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      await updateDoc(statsRef, {
        total: increment(seconds)
      });
    } else {
      await setDoc(statsRef, {
        total: seconds
      });
    }
  } catch (error) {
    console.error('Error updating daily stats:', error);
  }
};

/**
 * Fetches the user's weekly listening stats (sum of last 7 daily docs)
 */
export const getWeeklyStats = async (uid: string) => {
  if (!uid) return 0;

  try {
    const statsRef = collection(db, 'users', uid, 'dailyStats');
    const q = query(statsRef, orderBy('__name__', 'desc'), limit(7));
    const querySnapshot = await getDocs(q);
    
    let totalSeconds = 0;
    querySnapshot.forEach((doc) => {
      totalSeconds += doc.data().total || 0;
    });
    
    return totalSeconds;
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return 0;
  }
};

/**
 * Formats seconds into a human-readable duration (e.g., "5m 30s")
 */
export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};
