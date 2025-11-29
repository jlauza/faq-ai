
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating answers to user questions using a retrieval tool.
 *
 * - generateAnswerFromQuestion - A function that accepts a question and returns an AI-generated answer.
 * - GenerateAnswerFromQuestionInput - The input type for the generateAnswerFromQuestion function.
 * - GenerateAnswerFromQuestionOutput - The return type for the generateAnswerFromQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// To switch back to Firebase, uncomment the line below and comment out the mock data import.
// import { fetchFaqs, getFaqById } from '@/lib/firebase/utils';
import mockData from '@/lib/mock-faqs.json';
import { Faq } from '@/lib/firebase/utils';


const GetRelevantInformationInputSchema = z.object({
  question: z
    .string()
    .describe('The question to retrieve relevant information for.'),
});

const GetRelevantInformationOutputSchema = z.string().describe('A JSON string of relevant information retrieved from a data source.');

const getRelevantInformation = ai.defineTool(
  {
    name: 'getRelevantInformation',
    description: 'Retrieves relevant information from a data source based on the given question.',
    inputSchema: GetRelevantInformationInputSchema,
    outputSchema: GetRelevantInformationOutputSchema,
  },
  async ({question}) => {
    // In a real app, you might use a vector database for this.
    // For this example, we'll fetch all FAQs and let the model find the best one.
    try {
      // --- MOCK DATA IMPLEMENTATION ---
      // To switch to Firebase, comment out this block and uncomment the Firebase block below.
      const faqs: Faq[] = mockData.faqs;
      if (!faqs || faqs.length === 0) {
        return "No relevant information found in the mock database.";
      }
      const questionWords = question.toLowerCase().split(/\s+/);
      const relevantFaqs = faqs.filter(faq => {
        const faqContent = (faq.question + ' ' + faq.answer).toLowerCase();
        return questionWords.some(word => faqContent.includes(word));
      });

      if (relevantFaqs.length === 0) {
        return "No relevant information found.";
      }
      return JSON.stringify(relevantFaqs);

      // --- FIREBASE IMPLEMENTATION ---
      // To switch back to Firebase, uncomment this block and comment out the mock data block above.
      /*
      const faqs = await fetchFaqs();
      if (!faqs || faqs.length === 0) {
        return "No relevant information found in the database.";
      }
       // Simple keyword matching to find relevant FAQs.
      const questionWords = question.toLowerCase().split(/\s+/);
      const relevantFaqs = faqs.filter(faq => {
          const faqContent = (faq.question + ' ' + faq.answer).toLowerCase();
          return questionWords.some(word => faqContent.includes(word));
      });

      if (relevantFaqs.length === 0) {
        return "No relevant information found.";
      }
      
      // Convert the array of objects to a JSON string for the AI model.
      return JSON.stringify(relevantFaqs);
      */
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      return "Failed to retrieve information from the data source.";
    }
  }
);

const GenerateAnswerFromQuestionInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
});
export type GenerateAnswerFromQuestionInput = z.infer<typeof GenerateAnswerFromQuestionInputSchema>;

const GenerateAnswerFromQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
  id: z.string().optional().describe('The ID of the source FAQ.'),
  likes: z.number().optional().describe('The number of likes for the source FAQ.'),
  dislikes: z.number().optional().describe('The number of dislikes for the source FAQ.'),
});
export type GenerateAnswerFromQuestionOutput = z.infer<typeof GenerateAnswerFromQuestionOutputSchema>;

export async function generateAnswerFromQuestion(
  input: GenerateAnswerFromQuestionInput
): Promise<GenerateAnswerFromQuestionOutput> {
  return generateAnswerFromQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerFromQuestionPrompt',
  input: {schema: z.object({question: z.string()})},
  output: {
    schema: z.object({
      answer: z.string().describe('The AI-generated answer to the question.'),
      sourceId: z.string().optional().describe('The ID of the most relevant source FAQ document.'),
    }),
  },
  tools: [getRelevantInformation],
  prompt: `Answer the following question using the relevant information provided by the getRelevantInformation tool. Also provide the ID of the source FAQ that was most relevant to the question.

Question: {{{question}}}
`,
  system: `You are an AI assistant that answers questions based on retrieved information. Use the getRelevantInformation tool to find the most up-to-date information related to the question. The information is a JSON string of FAQs. Find the most relevant FAQ to answer the question. If no relevant FAQ is found, say that you could not find an answer. Your primary goal is to provide a helpful answer, and secondarily to identify the single best source ID from the retrieved information.`, 
});


const generateAnswerFromQuestionFlow = ai.defineFlow(
  {
    name: 'generateAnswerFromQuestionFlow',
    inputSchema: GenerateAnswerFromQuestionInputSchema,
    outputSchema: GenerateAnswerFromQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.sourceId) {
      // If the AI can't find an answer, return its response directly.
      return {
        answer: output?.answer || "I'm sorry, but I couldn't find an answer to your question in the available information.",
      };
    }

    try {
      // --- MOCK DATA IMPLEMENTATION ---
      // To switch to Firebase, comment out this block and uncomment the Firebase block below.
      const faqs: Faq[] = mockData.faqs;
      const sourceFaq = faqs.find(faq => faq.id === output.sourceId);
      
      // --- FIREBASE IMPLEMENTATION ---
      // To switch back to Firebase, uncomment this line and comment out the mock data block above.
      // const sourceFaq = await getFaqById(output.sourceId);

      return {
        answer: output.answer,
        id: sourceFaq?.id,
        likes: sourceFaq?.likes,
        dislikes: sourceFaq?.dislikes,
      };
    } catch (error) {
      console.error("Error fetching source FAQ by ID:", error);
      // Fallback to the AI's answer even if we can't get the vote counts
      return {
        answer: output.answer,
      };
    }
  }
);
