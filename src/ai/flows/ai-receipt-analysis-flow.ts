'use server';
/**
 * @fileOverview An AI agent that analyzes a receipt image and suggests a micro-saving amount.
 *
 * - analyzeReceipt - A function that handles the AI receipt analysis process.
 * - ReceiptAnalysisInput - The input type for the analyzeReceipt function.
 * - ReceiptAnalysisOutput - The return type for the analyzeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceiptAnalysisInputSchema = z.object({
  imageDataUri: z.string().describe(
    "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  goalName: z.string().describe('The name of the savings goal this saving is for.'),
});
export type ReceiptAnalysisInput = z.infer<typeof ReceiptAnalysisInputSchema>;

const ReceiptAnalysisOutputSchema = z.object({
  suggestedAmount: z
    .number()
    .describe('The suggested micro-savings amount in ALGO.'),
  reason: z
    .string()
    .describe('A short, encouraging reason for this savings suggestion.'),
});
export type ReceiptAnalysisOutput = z.infer<typeof ReceiptAnalysisOutputSchema>;

export async function analyzeReceipt(
  input: ReceiptAnalysisInput
): Promise<ReceiptAnalysisOutput> {
  return receiptAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'receiptAnalysisPrompt',
  input: {schema: ReceiptAnalysisInputSchema},
  output: {schema: ReceiptAnalysisOutputSchema},
  prompt: `You are a helpful savings assistant for a student using a micro-savings app.
The user has uploaded a receipt and is saving for their goal: "{{goalName}}".

Analyze the receipt image provided. Based on the total amount or items, suggest a small, sensible micro-saving amount (in ALGO, e.g., 0.5, 1, or 2.5). Your goal is to encourage a small, achievable saving action.

For example, you could round up the change from the total, suggest saving 5% of the coffee price, or find a simple item and suggest saving its cost.

Provide the suggested amount and a short, one-sentence encouraging reason for why they should save it.

Receipt Image: {{media url=imageDataUri}}`,
});

const receiptAnalysisFlow = ai.defineFlow(
  {
    name: 'receiptAnalysisFlow',
    inputSchema: ReceiptAnalysisInputSchema,
    outputSchema: ReceiptAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to analyze receipt.');
    }
    return output;
  }
);
