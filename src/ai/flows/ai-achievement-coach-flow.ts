'use server';
/**
 * @fileOverview An AI agent that provides personalized congratulatory messages and micro-tips for savings achievements.
 */

import { ai, isAIConfigured } from '@/ai/genkit';

export interface AchievementCoachInput {
  achievementName: string;
  goalName: string;
  currentSaved: number;
  targetAmount: number;
  progressPercentage: number;
}

export interface AchievementCoachOutput {
  congratulatoryMessage: string;
  microTip: string;
}

// Fallback messages when AI is not configured
const FALLBACK_MESSAGES: Record<string, { message: string; tip: string }> = {
  'First Deposit': {
    message: "Amazing start! You've made your first deposit. This is now permanently recorded on the Algorand blockchain!",
    tip: "Try setting up a weekly savings habit - even small amounts add up over time!"
  },
  '50% Saver': {
    message: "Halfway there! You've saved 50% of your goal. Your progress is secured on the blockchain!",
    tip: "You're doing great! Consider increasing your deposits slightly to reach your goal faster."
  },
  'Goal Completed': {
    message: "Congratulations! You've completed your savings goal! This achievement is permanently recorded on the Algorand blockchain!",
    tip: "Consider setting a new goal to keep your savings momentum going!"
  },
  'default': {
    message: "Great progress on your savings journey! Every deposit is securely recorded on the blockchain.",
    tip: "Keep up the consistent saving - you're building a great financial habit!"
  }
};

export async function getAchievementCoachAdvice(input: AchievementCoachInput): Promise<AchievementCoachOutput> {
  // If AI is not configured, return fallback
  if (!isAIConfigured || !ai) {
    const fallback = FALLBACK_MESSAGES[input.achievementName] || FALLBACK_MESSAGES.default;
    return {
      congratulatoryMessage: fallback.message.replace('your goal', `your "${input.goalName}" goal`),
      microTip: fallback.tip,
    };
  }

  const prompt = `You are an encouraging financial coach for students. A student has just unlocked the "${input.achievementName}" milestone for their savings goal: "${input.goalName}".

Current status:
- Saved: ${input.currentSaved} ALGO
- Target: ${input.targetAmount} ALGO
- Progress: ${input.progressPercentage}%

Generate:
1. A congratulatory message (2-3 sentences) explaining this achievement and that it's recorded on the blockchain
2. A relevant micro-tip to help them continue saving

Respond in JSON format: {"congratulatoryMessage": "...", "microTip": "..."}`;

  try {
    const { text } = await ai.generate({ prompt });
    const parsed = JSON.parse(text || '{}');
    return {
      congratulatoryMessage: parsed.congratulatoryMessage || FALLBACK_MESSAGES.default.message,
      microTip: parsed.microTip || FALLBACK_MESSAGES.default.tip,
    };
  } catch (error) {
    const fallback = FALLBACK_MESSAGES[input.achievementName] || FALLBACK_MESSAGES.default;
    return {
      congratulatoryMessage: fallback.message,
      microTip: fallback.tip,
    };
  }
}
