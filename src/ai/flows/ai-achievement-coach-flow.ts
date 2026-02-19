'use server';
/**
 * @fileOverview An AI agent that provides personalized congratulatory messages and micro-tips for savings achievements.
 *
 * - getAchievementCoachAdvice - A function that handles the generation of achievement-based advice.
 * - AchievementCoachInput - The input type for the getAchievementCoachAdvice function.
 * - AchievementCoachOutput - The return type for the getAchievementCoachAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AchievementCoachInputSchema = z.object({
  achievementName: z.string().describe('The name of the achievement unlocked (e.g., "First Deposit", "50% Saver", "Goal Completed").'),
  goalName: z.string().describe('The name of the savings goal.'),
  currentSaved: z.number().describe('The current amount saved towards the goal.'),
  targetAmount: z.number().describe('The target amount for the savings goal.'),
  progressPercentage: z.number().describe('The current progress towards the goal in percentage (0-100).'),
});
export type AchievementCoachInput = z.infer<typeof AchievementCoachInputSchema>;

const AchievementCoachOutputSchema = z.object({
  congratulatoryMessage: z.string().describe('A personalized congratulatory message for unlocking the achievement, explaining the on-chain event in simple terms.'),
  microTip: z.string().describe('A relevant micro-tip or next step to help the user continue their savings journey.'),
});
export type AchievementCoachOutput = z.infer<typeof AchievementCoachOutputSchema>;

export async function getAchievementCoachAdvice(input: AchievementCoachInput): Promise<AchievementCoachOutput> {
  return achievementCoachFlow(input);
}

const achievementCoachPrompt = ai.definePrompt({
  name: 'achievementCoachPrompt',
  input: {schema: AchievementCoachInputSchema},
  output: {schema: AchievementCoachOutputSchema},
  prompt: `You are an encouraging financial coach for students. Your goal is to motivate them by explaining their on-chain progress in simple, easy-to-understand language.

A student has just unlocked the "{{achievementName}}" milestone for their savings goal: "{{goalName}}". This is a permanent, verifiable event on the Algorand blockchain.

Their current on-chain status is:
- Saved: {{{currentSaved}}} ALGO
- Target: {{{targetAmount}}} ALGO
- Progress: {{{progressPercentage}}}%

Based on this achievement:
1.  Craft a personalized, congratulatory message. Explain what this milestone means and reassure them that their progress is permanently recorded and secured on the blockchain.
2.  Provide a relevant, actionable micro-tip to help them continue saving.

Example:
Achievement: "First Deposit"
Goal: "New Laptop"

Congratulatory Message: "Incredible start! You've officially made your first deposit for your 'New Laptop' goal. This transaction is now a permanent part of your savings history on the Algorand blockchain, and a huge first step towards your target!"
Micro Tip: "To keep the momentum going, try naming a day of the week 'Savings Sunday' and make a small deposit every week."`,
});

const achievementCoachFlow = ai.defineFlow(
  {
    name: 'achievementCoachFlow',
    inputSchema: AchievementCoachInputSchema,
    outputSchema: AchievementCoachOutputSchema,
  },
  async input => {
    const {output} = await achievementCoachPrompt(input);
    if (!output) {
      throw new Error('Failed to generate achievement coach advice.');
    }
    return output;
  }
);
