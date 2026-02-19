"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Target,
  Calendar,
  Loader2,
  PieChart,
  Sparkles,
  Brain,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { getAllGoals, getAllDeposits } from "@/lib/local-store";
import { getGoalOnChainState } from "@/lib/blockchain";
import type { GoalWithOnChainData } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import { getSpendingInsights } from "@/ai/flows/ai-spending-insights-flow";
import type { SpendingInsightsOutput } from "@/ai/flows/ai-spending-insights-flow";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];

export default function AnalyticsPage() {
  const router = useRouter();
  const { activeAddress, isConnecting } = useWallet();
  const [goals, setGoals] = useState<GoalWithOnChainData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<SpendingInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Redirect if not connected
  useEffect(() => {
    if (!activeAddress && !isConnecting) {
      router.push("/");
    }
  }, [activeAddress, isConnecting, router]);

  // Load goals data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const storedGoals = getAllGoals();
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
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (activeAddress) {
      loadData();
    }
  }, [activeAddress]);

  // All deposits
  const deposits = useMemo(() => getAllDeposits(), []);

  const fetchAiInsights = useCallback(async () => {
    if (!activeAddress) return;
    setIsLoadingInsights(true);
    try {
      const totalSaved = goals.reduce((sum, g) => sum + (g.onChain?.totalSaved || 0) / 1_000_000, 0);
      const totalTarget = goals.reduce((sum, g) => sum + (g.onChain?.targetAmount || 0) / 1_000_000, 0);
      const completedGoals = goals.filter(g => g.onChain?.goalCompleted).length;
      const activeGoals = goals.filter(g => !g.onChain?.goalCompleted).length;
      const depositHistory = deposits.map(d => ({
        amount: d.amount,
        date: new Date(d.timestamp).toLocaleDateString(),
        goalName: d.goalName,
      }));
      const result = await getSpendingInsights({
        totalSaved, totalTarget, activeGoals, completedGoals, depositHistory,
      });
      setAiInsights(result);
    } catch (err) {
      console.error("Error fetching AI insights:", err);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [activeAddress, goals, deposits]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSaved = goals.reduce((sum, g) => sum + (g.onChain?.totalSaved || 0) / 1_000_000, 0);
    const totalTarget = goals.reduce((sum, g) => sum + (g.onChain?.targetAmount || 0) / 1_000_000, 0);
    const completedGoals = goals.filter(g => g.onChain?.goalCompleted).length;
    const activeGoals = goals.filter(g => !g.onChain?.goalCompleted).length;
    const totalDeposits = deposits.length;
    const avgDeposit = deposits.length > 0 
      ? deposits.reduce((sum, d) => sum + d.amount, 0) / deposits.length 
      : 0;

    return { totalSaved, totalTarget, completedGoals, activeGoals, totalDeposits, avgDeposit };
  }, [goals, deposits]);

  // Savings over time (cumulative)
  const savingsOverTime = useMemo(() => {
    if (deposits.length === 0) return [];

    const sorted = [...deposits].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let cumulative = 0;
    const data: { date: string; amount: number; cumulative: number }[] = [];

    sorted.forEach((dep) => {
      cumulative += dep.amount;
      const date = new Date(dep.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      data.push({
        date,
        amount: dep.amount,
        cumulative,
      });
    });

    return data;
  }, [deposits]);

  // Monthly deposits chart data
  const monthlyDeposits = useMemo(() => {
    const months: Record<string, number> = {};
    
    deposits.forEach((dep) => {
      const month = new Date(dep.timestamp).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      months[month] = (months[month] || 0) + dep.amount;
    });

    return Object.entries(months).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [deposits]);

  // Goals distribution for pie chart
  const goalsDistribution = useMemo(() => {
    return goals.map((goal) => ({
      name: goal.name,
      value: (goal.onChain?.totalSaved || 0) / 1_000_000,
      target: (goal.onChain?.targetAmount || 0) / 1_000_000,
    }));
  }, [goals]);

  // Goal progress data
  const goalProgressData = useMemo(() => {
    return goals.map((goal) => {
      const saved = (goal.onChain?.totalSaved || 0) / 1_000_000;
      const target = (goal.onChain?.targetAmount || 0) / 1_000_000;
      const remaining = Math.max(0, target - saved);
      return {
        name: goal.name.length > 15 ? goal.name.substring(0, 15) + "..." : goal.name,
        saved,
        remaining,
        progress: target > 0 ? Math.round((saved / target) * 100) : 0,
      };
    });
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
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Financial Analytics</h1>
          <p className="text-muted-foreground text-sm md:text-base">Track your savings patterns and progress</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Total Saved</span>
                  </div>
                  <p className="text-xl font-bold">{stats.totalSaved.toFixed(2)} ALGO</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-muted-foreground">Total Target</span>
                  </div>
                  <p className="text-xl font-bold">{stats.totalTarget.toFixed(2)} ALGO</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-muted-foreground">Total Deposits</span>
                  </div>
                  <p className="text-xl font-bold">{stats.totalDeposits}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">Avg Deposit</span>
                  </div>
                  <p className="text-xl font-bold">{stats.avgDeposit.toFixed(2)} ALGO</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-pink-400" />
                    <span className="text-xs text-muted-foreground">Active Goals</span>
                  </div>
                  <p className="text-xl font-bold">{stats.activeGoals}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-xl font-bold">{stats.completedGoals}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Savings Over Time */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Savings Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savingsOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={savingsOverTime}>
                        <defs>
                          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)} ALGO`, "Total"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="cumulative"
                          stroke="#22c55e"
                          strokeWidth={2}
                          fill="url(#colorCumulative)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No deposit data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Deposits */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Monthly Deposits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyDeposits.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyDeposits}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="month" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)} ALGO`, "Deposited"]}
                        />
                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No deposit data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Goal Progress */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-400" />
                    Goal Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goalProgressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={goalProgressData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#888" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(2)} ALGO`,
                            name === "saved" ? "Saved" : "Remaining",
                          ]}
                        />
                        <Bar dataKey="saved" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="remaining" stackId="a" fill="#333" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No goals yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Savings Distribution */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-pink-400" />
                    Savings Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goalsDistribution.length > 0 && goalsDistribution.some(g => g.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={goalsDistribution.filter(g => g.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                        >
                          {goalsDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)} ALGO`, "Saved"]}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No savings data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Spending Insights */}
            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Spending Insights
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchAiInsights}
                    disabled={isLoadingInsights || isLoading}
                  >
                    {isLoadingInsights ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    )}
                    {aiInsights ? "Refresh" : "Get Insights"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingInsights ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : aiInsights ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center shrink-0">
                          <span className="text-xl font-bold">{aiInsights.savingsScore}</span>
                        </div>
                        <div>
                          <p className="font-semibold">Savings Score</p>
                          <p className="text-xs text-muted-foreground">out of 100</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Analysis</p>
                        <p className="text-sm">{aiInsights.insight}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                        <p className="text-sm font-semibold text-primary mb-1">💡 Top Tip</p>
                        <p className="text-sm">{aiInsights.topTip}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground">Weekly Target</p>
                          <p className="text-lg font-bold">{aiInsights.weeklyTarget} ALGO</p>
                        </div>
                        {aiInsights.projectedCompletion && (
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Projected Done</p>
                            <p className="text-lg font-bold">
                              {new Date(aiInsights.projectedCompletion).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium mb-1">Gemini AI Insights</p>
                    <p className="text-sm">Click "Get Insights" to receive personalized AI analysis of your savings habits.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-400" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deposits.length > 0 ? (
                  <div className="divide-y divide-border">
                    {[...deposits].reverse().slice(0, 10).map((deposit, index) => (
                      <div key={index} className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <ArrowUpRight className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{deposit.goalName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(deposit.timestamp).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">+{deposit.amount} ALGO</p>
                          {deposit.txId && (
                            <a
                              href={`https://testnet.algoexplorer.io/tx/${deposit.txId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary"
                            >
                              View TX →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No transactions yet. Start by depositing to a goal!
                  </div>
                )}
              </CardContent>
            </Card>
          </>
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
