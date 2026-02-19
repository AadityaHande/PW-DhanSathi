'use server';

import { ai, isAIConfigured } from '../genkit';

interface FinancialAdviceInput {
  userMessage: string;
  context?: {
    totalSaved?: number;
    totalTarget?: number;
    activeGoals?: number;
    completedGoals?: number;
    recentDeposits?: { amount: number; date: string }[];
  };
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

// Fallback responses when AI is not configured
const FALLBACK_RESPONSES: Record<string, string> = {
  save: "To save more effectively, try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Start small and increase gradually!",
  student: "As a student, start with small amounts - even ₹100/week adds up! Use apps to track spending, avoid impulse purchases, and consider part-time work or freelancing.",
  motivated: "Stay motivated by visualizing your goals, celebrating small wins, and tracking your progress. Remember: every deposit brings you closer to your dream!",
  multiple: "Having multiple goals is great! Prioritize by urgency and importance. Focus on emergency fund first, then work on other goals simultaneously.",
  budget: "Create a simple budget: list all income, track expenses for a week, identify non-essentials to cut, and automate your savings on payday.",
  default: "Great question! The key to financial success is consistency. Set clear goals, track your progress, and make saving a habit. Even small amounts add up over time!",
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('save more') || lowerMessage.includes('saving')) return FALLBACK_RESPONSES.save;
  if (lowerMessage.includes('student')) return FALLBACK_RESPONSES.student;
  if (lowerMessage.includes('motivated') || lowerMessage.includes('motivation')) return FALLBACK_RESPONSES.motivated;
  if (lowerMessage.includes('multiple') || lowerMessage.includes('goals')) return FALLBACK_RESPONSES.multiple;
  if (lowerMessage.includes('budget') || lowerMessage.includes('tight income')) return FALLBACK_RESPONSES.budget;
  return FALLBACK_RESPONSES.default;
}

export async function getFinancialAdvice(input: FinancialAdviceInput) {
  const systemPrompt = `You are DhanSathi AI, a friendly and knowledgeable financial advisor specializing in personal savings and financial goal planning. You help users with:

1. Savings Strategies: Tips on how to save more effectively
2. Goal Planning: Helping users set realistic financial goals
3. Budgeting Advice: Smart spending and budget management
4. Motivation: Encouraging users to stick to their savings plans
5. Financial Literacy: Explaining financial concepts in simple terms

Guidelines:
- Be warm, supportive, and encouraging
- Give practical, actionable advice
- Keep responses concise but helpful (2-3 paragraphs max)
- Use simple language, avoid jargon
- Reference the user's actual data when available
- Use INR or ALGO as currency context
- Be culturally aware for Indian users

${input.context ? `
User's Current Financial Status:
- Total Saved: ${input.context.totalSaved?.toFixed(2) || 0} ALGO
- Total Target: ${input.context.totalTarget?.toFixed(2) || 0} ALGO
- Active Goals: ${input.context.activeGoals || 0}
- Completed Goals: ${input.context.completedGoals || 0}
${input.context.recentDeposits?.length ? `- Recent Deposits: ${input.context.recentDeposits.map(d => `${d.amount} ALGO on ${d.date}`).join(', ')}` : ''}
` : ''}`;

  const conversationContext = input.conversationHistory?.map(msg => 
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n\n') || '';

  const prompt = `${systemPrompt}

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}User's question: ${input.userMessage}

Provide helpful, specific financial advice:`;

  try {
    const { text } = await ai.generate({ prompt });
    
    return {
      success: true,
      data: {
        response: text || "I'm here to help! Could you please rephrase your question?",
        suggestions: [],
        category: 'general' as const,
      },
    };
  } catch (error) {
    console.error('Error generating financial advice:', error);
    // Return fallback on error
    return {
      success: true,
      data: {
        response: getFallbackResponse(input.userMessage),
        suggestions: ["How can I save more?", "Budgeting tips"],
        category: 'general' as const,
      },
    };
  }
}

// Quick tips generator for dashboard
export async function getQuickSavingsTip(context?: {
  totalSaved?: number;
  progressPercent?: number;
}) {
  const prompt = `Generate a short, motivating savings tip (1-2 sentences) for a user who has saved ${context?.totalSaved?.toFixed(2) || 0} ALGO and is ${context?.progressPercent || 0}% towards their goal. Be encouraging and specific.`;

  try {
    const { text } = await ai.generate({ prompt });
    return { success: true, tip: text };
  } catch (error) {
    return { 
      success: true, 
      tip: "Every small deposit brings you closer to your goal. Keep going!" 
    };
  }
}
