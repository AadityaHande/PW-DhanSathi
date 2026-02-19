"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { getFinancialAdvice } from "@/ai/flows/ai-financial-advisor-flow";
import { getAllGoals, getAllDeposits } from "@/lib/local-store";
import { getGoalOnChainState } from "@/lib/blockchain";
import Navbar from "@/components/layout/Navbar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "How can I save more effectively?",
  "What's a good savings strategy for students?",
  "How do I stay motivated to save?",
  "Should I have multiple savings goals?",
  "Tips for budgeting on a tight income?",
];

export default function AdvisorPage() {
  const router = useRouter();
  const { activeAddress, isConnecting } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<{
    totalSaved: number;
    totalTarget: number;
    activeGoals: number;
    completedGoals: number;
    recentDeposits: { amount: number; date: string }[];
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect if not connected
  useEffect(() => {
    if (!activeAddress && !isConnecting) {
      router.push("/");
    }
  }, [activeAddress, isConnecting, router]);

  // Load user's financial context
  useEffect(() => {
    async function loadContext() {
      try {
        const goals = getAllGoals();
        const deposits = getAllDeposits();
        
        let totalSaved = 0;
        let totalTarget = 0;
        let completedGoals = 0;
        
        for (const goal of goals) {
          try {
            const onChain = await getGoalOnChainState(goal.appId);
            totalSaved += (onChain.totalSaved || 0) / 1_000_000;
            totalTarget += (onChain.targetAmount || 0) / 1_000_000;
            if (onChain.goalCompleted) completedGoals++;
          } catch {
            // Skip goals that can't be fetched
          }
        }

        setUserContext({
          totalSaved,
          totalTarget,
          activeGoals: goals.length - completedGoals,
          completedGoals,
          recentDeposits: deposits.slice(-5).map(d => ({
            amount: d.amount,
            date: new Date(d.timestamp).toLocaleDateString(),
          })),
        });
      } catch (error) {
        console.error("Error loading context:", error);
      }
    }

    if (activeAddress) {
      loadContext();
    }
  }, [activeAddress]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm DhanSathi AI, your personal financial advisor. I'm here to help you with savings strategies, goal planning, and budgeting advice. How can I assist you today?",
        suggestions: ["How can I save more?", "Help me set a goal", "Budgeting tips"],
        timestamp: new Date(),
      }]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .filter(m => m.id !== "welcome")
        .slice(-10)
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const result = await getFinancialAdvice({
        userMessage: text,
        context: userContext || undefined,
        conversationHistory,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.success && result.data 
          ? result.data.response 
          : "I apologize, but I'm having trouble generating advice right now. Please try again.",
        suggestions: result.success && result.data?.suggestions ? result.data.suggestions : undefined,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, something went wrong. Please try again later.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />

      {/* Chat Area */}
      <div className="flex-1 container max-w-4xl py-4 md:py-6 px-4 flex flex-col">
        {/* Context Card */}
        {userContext && (
          <Card className="mb-4 bg-secondary/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Your Financial Snapshot</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Saved</p>
                  <p className="font-semibold">{userContext.totalSaved.toFixed(2)} ALGO</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target</p>
                  <p className="font-semibold">{userContext.totalTarget.toFixed(2)} ALGO</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Active Goals</p>
                  <p className="font-semibold">{userContext.activeGoals}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-semibold">{userContext.completedGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1 px-2 bg-background/50"
                          onClick={() => handleSend(suggestion)}
                          disabled={isLoading}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        <div className="py-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-muted-foreground">Quick questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((question, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSend(question)}
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask me about savings, budgeting, or financial goals..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
