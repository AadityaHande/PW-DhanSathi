'use server';
/**
 * @fileOverview AI Spending Insights — analyzes spending patterns and provides
 * personalized recommendations to help users save more effectively.
 */

import { ai } from '@/ai/genkit';

export interface SpendingInsightsInput {
  totalSaved: number;
  totalTarget: number;
  activeGoals: number;
  completedGoals: number;
  depositHistory: { amount: number; date: string; goalName: string }[];
  savingsRate?: number; // percentage of income saved
}

export interface SpendingInsightsOutput {
  savingsScore: number; // 0-100
  insight: string;
  topTip: string;
  weeklyTarget: number; // suggested weekly saving in ALGO
  projectedCompletion?: string; // ISO date string
}

function getFallbackInsights(input: SpendingInsightsInput): SpendingInsightsOutput {
  const totalRemaining = input.totalTarget - input.totalSaved;
  const weeklyTarget = Math.max(0.1, totalRemaining / 12);
  const score = Math.min(
    100,
    Math.round(
      (input.completedGoals * 20) +
      (input.activeGoals * 5) +
      (input.totalSaved > 0 ? Math.min(50, input.totalSaved * 5) : 0)
    )
  );

  return {
    savingsScore: score,
    insight: `You've saved ${input.totalSaved.toFixed(2)} ALGO across ${input.activeGoals + input.completedGoals} goals. ${input.completedGoals > 0 ? `Great job completing ${input.completedGoals} goal${input.completedGoals > 1 ? 's' : ''}!` : 'Keep going — every deposit counts!'}`,
    topTip: 'Try the 24-hour rule: wait a day before any non-essential purchase. Transfer the saved amount directly to your goal.',
    weeklyTarget: parseFloat(weeklyTarget.toFixed(3)),
  };
}

export async function getSpendingInsights(
  input: SpendingInsightsInput
): Promise<SpendingInsightsOutput> {
  const recentDeposits = input.depositHistory.slice(-10);
  const totalDeposits = input.depositHistory.length;
  const avgDeposit =
    totalDeposits > 0
      ? input.depositHistory.reduce((s, d) => s + d.amount, 0) / totalDeposits
      : 0;

  const prompt = `You are DhanSathi AI, a financial wellness coach. Analyze this user's savings data and provide actionable insights.

User Savings Profile:
- Total Saved: ${input.totalSaved.toFixed(3)} ALGO
- Total Target: ${input.totalTarget.toFixed(3)} ALGO
- Active Goals: ${input.activeGoals}
- Completed Goals: ${input.completedGoals}
- Total Deposits: ${totalDeposits}
- Average Deposit: ${avgDeposit.toFixed(3)} ALGO
- Recent Deposits: ${recentDeposits.map(d => `${d.amount} ALGO for "${d.goalName}" on ${d.date}`).join('; ') || 'None yet'}

Provide a JSON response with:
1. savingsScore: integer 0-100 based on their savings habits
2. insight: 2-3 sentence analysis of their savings pattern (encouraging but honest)
3. topTip: one specific, actionable tip to improve savings (1-2 sentences)
4. weeklyTarget: suggested weekly ALGO savings amount (number, 2 decimal places)
5. projectedCompletion: estimated date to reach all goals in YYYY-MM-DD format (optional)

JSON format: {"savingsScore": 75, "insight": "...", "topTip": "...", "weeklyTarget": 0.5, "projectedCompletion": "2026-06-01"}`;

  try {
    const { text } = await ai.generate({ prompt });
    const parsed = JSON.parse(text || '{}');
    return {
      savingsScore: typeof parsed.savingsScore === 'number' ? Math.min(100, Math.max(0, parsed.savingsScore)) : getFallbackInsights(input).savingsScore,
      insight: parsed.insight || getFallbackInsights(input).insight,
      topTip: parsed.topTip || getFallbackInsights(input).topTip,
      weeklyTarget: typeof parsed.weeklyTarget === 'number' ? parsed.weeklyTarget : getFallbackInsights(input).weeklyTarget,
      projectedCompletion: parsed.projectedCompletion,
    };
  } catch {
    return getFallbackInsights(input);
  }
}
