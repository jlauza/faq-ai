
// actions.ts
'use server';

import { z } from 'zod';
import {
  generateAnswerFromQuestion,
} from '@/ai/flows/generate-answer-from-question';
import {
  improveAnswerBasedOnFeedback,
} from '@/ai/flows/improve-answer-based-on-feedback';
import mockData from '@/lib/mock-faqs.json';

const questionSchema = z.object({
  question: z.string().min(10, 'Please ask a more detailed question.'),
});

const feedbackSchema = z.object({
    question: z.string(),
    originalAnswer: z.string(),
    feedback: z.string().min(10, 'Please provide more detailed feedback.'),
});

const voteSchema = z.object({
    id: z.string(),
    type: z.enum(['like', 'dislike']),
});

export type QuestionState = {
  question?: string;
  answer?: string;
  id?: string;
  likes?: number;
  dislikes?: number;
  error?: string;
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
      error: validatedFields.error.flatten().fieldErrors.question?.join(', '),
    };
  }
  
  const question = validatedFields.data.question;

  try {
    const result = await generateAnswerFromQuestion({ question });
    console.log(result);
    return { 
      question, 
      answer: result.answer,
      id: result.id,
      likes: result.likes,
      dislikes: result.dislikes,
    };
  } catch (e) {
    console.error(e);
    return {
      question,
      error: 'Sorry, I encountered an error while generating an answer. Please try again.',
    };
  }
}

export type FeedbackState = {
  improvedAnswer?: string;
  error?: string;
}

export async function submitFeedback(
    prevState: FeedbackState,
    formData: FormData
): Promise<FeedbackState> {
    const validatedFields = feedbackSchema.safeParse({
        question: formData.get('question'),
        originalAnswer: formData.get('originalAnswer'),
        feedback: formData.get('feedback'),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors.feedback?.join(', '),
        };
    }

    const { question, originalAnswer, feedback } = validatedFields.data;

    try {
        const result = await improveAnswerBasedOnFeedback({ question, originalAnswer, feedback });
        return { improvedAnswer: result.improvedAnswer };
    } catch(e) {
        console.error(e);
        return {
            error: 'Sorry, I encountered an error while improving the answer. Please try again.',
        };
    }
}

export async function updateVote(id: string, type: 'like' | 'dislike') {
  const validatedFields = voteSchema.safeParse({ id, type });
  if (!validatedFields.success) {
    console.error('Invalid vote data');
    return;
  }

  // NOTE: This is for demonstration only. 
  // In a real app, you would update a database here, not a JSON file.
  // This will not persist across server restarts or multiple users.
  const faq = mockData.faqs.find(f => f.id === id);
  if (faq) {
    if (type === 'like') {
      faq.likes += 1;
    } else {
      faq.dislikes += 1;
    }
    console.log(`Updated vote for ${id}:`, faq);
  } else {
    console.log(`FAQ with id ${id} not found.`);
  }

  // Since we can't reliably write to the file system on the server,
  // we're just logging the change. The UI has already updated instantly.
  return { success: true };
}
