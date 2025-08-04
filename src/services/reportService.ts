import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export interface ReportData {
  excuse: string;
  userId: string;
  userEmail?: string;
  category: string;
  credibility: string;
  tone: string;
  reportedAt: Date;
  status: 'pending' | 'reviewed' | 'resolved';
}

export const reportService = {
  async reportExcuse(
    excuse: string,
    userId: string,
    userEmail: string,
    category: string,
    credibility: string,
    tone: string
  ): Promise<void> {
    try {
      // Vérifier que l'utilisateur est authentifié
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non authentifié');
      }
      
      // Utiliser l'ID de l'utilisateur authentifié pour plus de sécurité
      const actualUserId = currentUser.uid;
      
      console.log('🔍 Tentative de signalement:', {
        excuse: excuse.substring(0, 50) + '...',
        userId: actualUserId,
        userEmail,
        category,
        credibility,
        tone
      });
      
      await addDoc(collection(db, 'reports'), {
        excuse,
        userId: actualUserId,
        userEmail,
        category,
        credibility,
        tone,
        reportedAt: serverTimestamp(),
        status: 'pending'
      });
      
      console.log('✅ Signalement enregistré avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du signalement:', error);
      throw error;
    }
  },

  async getUserReports(userId: string): Promise<ReportData[]> {
    try {
      const q = query(
        collection(db, 'reports'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const reports: ReportData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          excuse: data.excuse,
          userId: data.userId,
          userEmail: data.userEmail,
          category: data.category,
          credibility: data.credibility,
          tone: data.tone,
          reportedAt: data.reportedAt?.toDate() || new Date(),
          status: data.status
        });
      });
      
      return reports;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des signalements:', error);
      throw error;
    }
  }
}; 