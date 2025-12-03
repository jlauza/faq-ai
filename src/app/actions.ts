
// actions.ts
'use server';

import { z } from 'zod';
import {
  generateAnswerFromQuestion,
} from '@/ai/flows/generate-answer-from-question';
// To switch back to Firebase, uncomment the line below.
import { updateFaqVote } from '@/lib/firebase/utils';
import { revalidatePath } from 'next/cache';

const questionSchema = z.object({
  question: z.string().min(10, 'Please ask a more detailed question.'),
});

const voteSchema = z.object({
    id: z.string(),
    type: z.enum(['like', 'dislike']),
});

export type QuestionState = {
  status: 'success' | 'error' | 'not_found' | 'idle';
  question?: string;
  answer?: string;
  id?: string;
  likes?: number;
  dislikes?: number;
  message?: string; // For errors or other info
};

export async function submitQuestion(
  prevState: QuestionState,
  formData: FormData
): Promise<QuestionState> {
  const validatedFields = questionSchema.safeParse({
    question: formData.get('question'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.question?.join(', '),
    };
  }
  
  const question = validatedFields.data.question;

  try {
    const result = await generateAnswerFromQuestion({ question });
    
    // If the answer indicates no SOP was found, treat it as an "error" for UI purposes
    if (result.answer === "There's no SOP recorded for this request yet.") {
        return {
            status: 'not_found',
            question,
            message: result.answer,
        }
    }

    return { 
      status: 'success',
      question, 
      answer: result.answer,
      id: result.id,
      likes: result.likes,
      dislikes: result.dislikes,
    };
  } catch (e) {
    console.error(e);
    return {
      status: 'error',
      question,
      message: 'Sorry, I encountered a system error. Please try again.',
    };
  }
}

export async function updateVote(id: string, type: 'like' | 'dislike') {
  const validatedFields = voteSchema.safeParse({ id, type });
  if (!validatedFields.success) {
    console.error('Invalid vote data');
    return { success: false, error: 'Invalid vote data' };
  }

  try {
    // --- MOCK IMPLEMENTATION (for demonstration) ---
    // This doesn't actually update the JSON file, it just simulates the action.
    // The UI updates optimistically.
    /*
    console.log(`Simulating vote update for id: ${id}, type: ${type}`);
    revalidatePath('/'); // This would refresh data if it were coming from a live source.
    return { success: true };
    */
    
    // --- FIREBASE IMPLEMENTATION ---
    // To switch to Firebase, comment out the mock block above and uncomment this block.
    // We only update votes for real FAQs, not temporary client-side ones
    if (!id.startsWith('temp-')) {
      await updateFaqVote(id, type);
      revalidatePath('/'); // This tells Next.js to refresh the data on the page
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to update vote for ${id}:`, error);
    return { success: false, error: 'Failed to update vote in database' };
  }
}
