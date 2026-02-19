"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Target,
  Bot,
  ArrowUpRight,
} from "lucide-react";
import type { Goal, GoalWithOnChainData } from "@/lib/types";
import GoalCard from "@/components/goals/GoalCard";
import Navbar from "@/components/layout/Navbar";
import { getGoalOnChainState } from "@/lib/blockchain";
import { getAllGoals, getAllDeposits } from "@/lib/local-store";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithOnChainData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeAddress, isConnecting } = useWallet();

  // Redirect to landing if not connected
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
            return {
              ...goal,
              onChain: {
                goalOwner: "",
                targetAmount: 0,
                totalSaved: 0,
                deadline: 0,
                goalCompleted: false,
                balance: 0,
              },
            } as GoalWithOnChainData;
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

  // Calculate stats
  const stats = useMemo(() => {
    const totalSaved = goals.reduce((sum, g) => sum + (g.onChain?.totalSaved || 0) / 1_000_000, 0);
    const totalTarget = goals.reduce((sum, g) => sum + (g.onChain?.targetAmount || 0) / 1_000_000, 0);
    const completedGoals = goals.filter(g => g.onChain?.goalCompleted).length;
    const activeGoals = goals.filter(g => !g.onChain?.goalCompleted).length;
    const progressPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    
    return { totalSaved, totalTarget, completedGoals, activeGoals, progressPercent };
  }, [goals]);

  // Get recent deposits for transaction history
  const recentDeposits = useMemo(() => {
    const allDeposits = getAllDeposits();
    return allDeposits.slice(-5).reverse();
  }, []);

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
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back!</h1>
          <p className="text-muted-foreground text-sm md:text-base">Here's your financial overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.totalSaved.toFixed(2)} ALGO</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Target</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.totalTarget.toFixed(2)} ALGO</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Progress</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.progressPercent}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Goals</p>
                  <p className="text-lg md:text-2xl font-bold">
                    {stats.completedGoals > 0 ? (
                      <span className="text-primary">{stats.completedGoals} ✓</span>
                    ) : stats.activeGoals} 
                    <span className="text-sm text-muted-foreground ml-1">
                      {stats.completedGoals > 0 ? `completed` : `active`}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Only visible on desktop as mobile has bottom nav */}
        <div className="hidden md:grid grid-cols-3 gap-4 mb-8">
          <Button asChild size="lg" className="h-auto py-4">
            <Link href="/goals/new" className="flex flex-col items-center gap-2">
              <PlusCircle className="h-6 w-6" />
              <span>Create New Goal</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-auto py-4">
            <Link href="/analytics" className="flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-auto py-4">
            <Link href="/advisor" className="flex flex-col items-center gap-2">
              <Bot className="h-6 w-6" />
              <span>AI Financial Advisor</span>
            </Link>
          </Button>
        </div>

        {/* Goals Section */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold">Your Goals</h2>
          <div className="flex gap-2">
            <Button onClick={loadGoals} variant="ghost" size="sm" disabled={isLoading}>
              <RefreshCw className={`mr-1 md:mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/goals/new">
                <PlusCircle className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Goal</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading goals from blockchain...</p>
          </div>
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 text-6xl">🏦</div>
            <h3 className="text-2xl font-semibold">No Goals Yet!</h3>
            <p className="mt-2 text-muted-foreground">
              Ready to start saving? Create your first goal to get started.
            </p>
            <Button asChild className="mt-6">
              <Link href="/goals/new">Create Your First Goal</Link>
            </Button>
          </div>
        )}

        {/* Recent Activity */}
        {recentDeposits.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentDeposits.map((deposit, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Deposit</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(deposit.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-primary">+{deposit.amount} ALGO</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Running on Algorand Testnet • Powered by DhanSathi</p>
        </div>
      </footer>
    </div>
  );
}
