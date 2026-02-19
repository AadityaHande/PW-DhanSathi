'use server';
/**
 * @fileOverview An AI agent that suggests a realistic target amount, suitable deadline,
 * and a personalized savings plan based on a user's goal description.
 *
 * - aiGoalPlanning - A function that handles the AI goal planning process.
 * - AIGoalPlanningInput - The input type for the aiGoalPlanning function.
 * - AIGoalPlanningOutput - The return type for the aiGoalPlanning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGoalPlanningInputSchema = z.object({
  goalDescription: z
    .string()
    .describe('A detailed description of the user\u2019s savings goal.'),
});
export type AIGoalPlanningInput = z.infer<typeof AIGoalPlanningInputSchema>;

const AIGoalPlanningOutputSchema = z.object({
  suggestedTargetAmount: z
    .number()
    .describe('A realistic target amount for the goal, in ALGO.'),
  suggestedDeadline: z
    .string()
    .describe('A suitable deadline for the goal, in YYYY-MM-DD format.'),
  suggestedSavingsPlan: z
    .string()
    .describe(
      'A personalized weekly/monthly savings plan to achieve the goal.'
    ),
});
export type AIGoalPlanningOutput = z.infer<typeof AIGoalPlanningOutputSchema>;

export async function aiGoalPlanning(
  input: AIGoalPlanningInput
): Promise<AIGoalPlanningOutput> {
  return aiGoalPlanningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiGoalPlanningPrompt',
  input: {schema: AIGoalPlanningInputSchema},
  output: {schema: AIGoalPlanningOutputSchema},
  prompt: `As an expert financial advisor, your task is to help a student set achievable financial objectives for a savings goal.
Based on the following goal description, suggest a realistic target amount in ALGO, a suitable deadline in YYYY-MM-DD format, and a personalized weekly/monthly savings plan.

Goal Description: {{{goalDescription}}}`,
});

const aiGoalPlanningFlow = ai.defineFlow(
  {
    name: 'aiGoalPlanningFlow',
    inputSchema: AIGoalPlanningInputSchema,
    outputSchema: AIGoalPlanningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
