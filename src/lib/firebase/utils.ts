
'use server';

import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DocumentData } from 'firebase/firestore';

export interface Faq extends DocumentData {
  id: string;
  question: string;
  answer: string;
  likes: number;
  dislikes: number;
}

/**
 * Fetches all FAQs from the Firestore database.
 * @returns A promise that resolves to an array of FAQ objects.
 */
export async function fetchFaqs(): Promise<Faq[]> {
  try {
    const faqsCol = collection(db, 'faqs');
    const snapshot = await getDocs(faqsCol);
    if (snapshot.empty) {
      console.log('No FAQs found in the database.');
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Faq));
  } catch (err) {
    console.error('FIRESTORE READ "faqs" FAILED:', err);
    throw new Error('Failed to fetch FAQs from database.');
  }
}

/**
 * Fetches a single FAQ by its document ID.
 * @param id The document ID of the FAQ to fetch.
 * @returns A promise that resolves to the FAQ object or null if not found.
 */
export async function getFaqById(id: string): Promise<Faq | null> {
  try {
    const faqRef = doc(db, 'faqs', id);
    const docSnap = await getDoc(faqRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Faq;
    } else {
      console.warn(`FAQ with id ${id} not found.`);
      return null;
    }
  } catch (err) {
    console.error(`FIRESTORE READ "faqs/${id}" FAILED:`, err);
    throw new Error('Failed to fetch FAQ by ID from database.');
  }
}

/**
 * Updates the vote count for a specific FAQ in Firestore.
 * @param id The document ID of the FAQ to update.
 * @param type The type of vote, either 'like' or 'dislike'.
 */
export async function updateFaqVote(id: string, type: 'like' | 'dislike') {
  const faqRef = doc(db, 'faqs', id);
  const fieldToIncrement = type === 'like' ? 'likes' : 'dislikes';

  try {
    await updateDoc(faqRef, {
      [fieldToIncrement]: increment(1),
    });
  } catch (err) {
    console.error(`FIRESTORE UPDATE "faqs/${id}" FAILED:`, err);
    throw new Error('Failed to update vote in database.');
  }
}
