"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import QuickActions from "@/components/dashboard/QuickActions";
import GoalsList from "@/components/dashboard/GoalsList";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { getAllGoals, getAllDeposits } from "@/lib/local-store";
import { getGoalOnChainState } from "@/lib/blockchain";
import type { Goal, GoalWithOnChainData } from "@/lib/types";

export default function Dashboard() {
  const router = useRouter();
  const { activeAddress, isConnecting } = useWallet();
  const [goals, setGoals] = useState<GoalWithOnChainData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeAddress && !isConnecting) {
      router.push("/");
    }
  }, [activeAddress, isConnecting, router]);

  const loadGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedGoals: Goal[] = getAllGoals();
      const goalsWithOnChain = await Promise.all(
        storedGoals.map(async (goal) => {
          try {
            const onChain = await getGoalOnChainState(goal.appId);
            return { ...goal, onChain } as GoalWithOnChainData;
          } catch {
            return { ...goal, onChain: { goalOwner: "", targetAmount: 0, totalSaved: 0, deadline: 0, goalCompleted: false, balance: 0 } } as GoalWithOnChainData;
          }
        })
      );
      setGoals(goalsWithOnChain);
    } catch (err) {
      console.error("Error loading goals:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeAddress) {
      loadGoals();
    }
  }, [loadGoals, activeAddress]);

  const stats = useMemo(() => {
    const totalSaved = goals.reduce((sum, g) => sum + (g.onChain?.totalSaved || 0) / 1_000_000, 0);
    const totalTarget = goals.reduce((sum, g) => sum + (g.onChain?.targetAmount || 0) / 1_000_000, 0);
    const completedGoals = goals.filter(g => g.onChain?.goalCompleted).length;
    const activeGoals = goals.filter(g => !g.onChain?.goalCompleted).length;
    const progressPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    return { totalSaved, totalTarget, completedGoals, activeGoals, progressPercent };
  }, [goals]);

  const recentDeposits = useMemo(() => {
    const allDeposits = getAllDeposits();
    const goalMap = new Map(goals.map(g => [g.id, g.name]));
    return allDeposits.slice(-5).reverse().map(d => ({ ...d, goalName: goalMap.get(d.goalId) || 'Unknown Goal' }));
  }, [goals]);

  if (!activeAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container py-6 px-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back!</h1>
          <p className="text-muted-foreground text-sm md:text-base">Here's your financial overview</p>
        </div>
        <FinancialOverview {...stats} />
        <QuickActions />
        <GoalsList goals={goals} isLoading={isLoading} loadGoals={loadGoals} />
        <RecentActivity deposits={recentDeposits} />
      </main>
      <footer className="border-t border-border py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Running on Algorand Testnet • Powered by DhanSathi</p>
        </div>
      </footer>
    </div>
  );
}
