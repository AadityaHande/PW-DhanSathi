"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PlusCircle,
  ShieldCheck,
  Lock,
  BarChart,
  Wallet,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { Goal, GoalWithOnChainData } from "@/lib/types";
import GoalCard from "@/components/goals/GoalCard";
import { getGoalOnChainState } from "@/lib/blockchain";
import { getAllGoals } from "@/lib/local-store";
import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const [goals, setGoals] = useState<GoalWithOnChainData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeAddress, connectWallet, disconnectWallet, isConnecting } =
    useWallet();

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
    loadGoals();
  }, [loadGoals]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="mb-12 rounded-xl bg-card p-8 text-center shadow-lg">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
              Welcome to AlgoSave
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Your personal piggy bank on the blockchain. Start saving for your
              dreams, one micro-deposit at a time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/goals/new">
                  <PlusCircle className="mr-2" />
                  Create New Goal
                </Link>
              </Button>
              {activeAddress ? (
                <Button onClick={disconnectWallet} variant="outline" size="lg">
                  <Wallet className="mr-2 h-4 w-4" />
                  {`${activeAddress.substring(0, 6)}...${activeAddress.substring(
                    activeAddress.length - 4
                  )}`}
                </Button>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  variant="outline"
                  size="lg"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Connect Pera Wallet"}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Why Blockchain */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">
            Why Blockchain?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Immutable Record</h3>
              <p className="text-muted-foreground">
                Every deposit is a permanent transaction on the Algorand
                blockchain. Your savings history is tamper-proof and transparent.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Lock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Discipline-as-a-Service
              </h3>
              <p className="text-muted-foreground">
                Your savings are locked in a smart contract. Withdrawals are
                only possible after you meet your goal or the deadline passes.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <BarChart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Decentralized Trust
              </h3>
              <p className="text-muted-foreground">
                AlgoSave operates without a central authority. The rules are
                code, ensuring fairness and removing the need to trust a third
                party.
              </p>
            </div>
          </div>
        </section>

        {/* Goals List */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="font-headline text-3xl font-semibold">Your Goals</h2>
          <div className="flex gap-2">
            <Button onClick={loadGoals} variant="ghost" size="sm" disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild variant="outline">
              <Link href="/goals/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Loading goals from blockchain...
            </p>
          </div>
        ) : goals.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
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
      </div>
      <footer className="py-4 mt-8 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Running on Algorand Testnet</p>
        </div>
      </footer>
    </>
  );
}
