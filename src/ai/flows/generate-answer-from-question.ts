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
import mockData from '@/lib/mock-faqs.json';

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
    const faqs = mockData.faqs;
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
  }
);

const GenerateAnswerFromQuestionInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
});
export type GenerateAnswerFromQuestionInput = z.infer<typeof GenerateAnswerFromQuestionInputSchema>;

const GenerateAnswerFromQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type GenerateAnswerFromQuestionOutput = z.infer<typeof GenerateAnswerFromQuestionOutputSchema>;

export async function generateAnswerFromQuestion(
  input: GenerateAnswerFromQuestionInput
): Promise<GenerateAnswerFromQuestionOutput> {
  return generateAnswerFromQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerFromQuestionPrompt',
  input: {schema: GenerateAnswerFromQuestionInputSchema},
  output: {schema: GenerateAnswerFromQuestionOutputSchema},
  tools: [getRelevantInformation],
  prompt: `Answer the following question using the relevant information provided by the getRelevantInformation tool.

Question: {{{question}}}

Answer: `,
  system: `You are an AI assistant that answers questions based on retrieved information. Use the getRelevantInformation tool to find the most up-to-date information related to the question. The information is a JSON string of FAQs. Find the most relevant FAQ to answer the question. If no relevant FAQ is found, say that you could not find an answer.`, 
});

const generateAnswerFromQuestionFlow = ai.defineFlow(
  {
    name: 'generateAnswerFromQuestionFlow',
    inputSchema: GenerateAnswerFromQuestionInputSchema,
    outputSchema: GenerateAnswerFromQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
