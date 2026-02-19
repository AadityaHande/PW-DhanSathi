"use client";

import type { Goal, OnChainGoal, GoalWithOnChainData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateFromTimestamp, microAlgosToAlgos, toDate } from '@/lib/utils';
import { Calendar, Target, PiggyBank, Award, CheckCircle2, History, Bot, Milestone, Wallet, AlertTriangle, ExternalLink, HeartPulse, Lock } from 'lucide-react';
import { DepositDialog } from './DepositDialog';
import { SavingsChart } from './SavingsChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getAchievementCoachAdvice } from '@/ai/flows/ai-achievement-coach-flow';
import { getGoalOnChainState, withdrawFromGoal } from '@/lib/blockchain';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { calculateFinancialHealth } from '@/lib/financial-health';
import { FinancialHealthIndicator } from './FinancialHealthIndicator';
import { getGoalById } from '@/lib/local-store';

type GoalDetailsClientProps = {
  goal: Goal;
};

type AchievementInfo = {
  message: string;
  tip: string;
} | null;

export default function GoalDetailsClient({ goal: initialGoal }: GoalDetailsClientProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [onChainGoal, setOnChainGoal] = useState<OnChainGoal | null>(null);
  const [isFetchingOnChain, setIsFetchingOnChain] = useState(true);
  const [achievementInfo, setAchievementInfo] = useState<AchievementInfo | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [latestTxId, setLatestTxId] = useState<string | null>(null);

  const { activeAddress, signTransactions } = useWallet();
  const { toast } = useToast();

  const fetchOnChainData = useCallback(async () => {
    setIsFetchingOnChain(true);
    try {
      const data = await getGoalOnChainState(goal.appId);
      setOnChainGoal(data);
      
      // Reload goal from localStorage
      const updatedGoal = getGoalById(goal.id);
      if (updatedGoal) {
        setGoal(updatedGoal);

        if (updatedGoal.deposits && updatedGoal.deposits.length > 0) {
          const sortedDeposits = [...updatedGoal.deposits].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setLatestTxId(sortedDeposits[0].txId);
        }
      }
      
    } catch (error) {
      console.error("Failed to fetch on-chain data:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not load on-chain goal data." });
    } finally {
      setIsFetchingOnChain(false);
    }
  }, [goal.appId, goal.id, toast]);

  useEffect(() => {
    fetchOnChainData();
  }, [fetchOnChainData]);

  const fullGoalData: GoalWithOnChainData | null = useMemo(() => {
    if (!onChainGoal) return null;
    return { ...goal, onChain: onChainGoal };
  }, [goal, onChainGoal]);
  
  const { score: healthScore, feedback: healthFeedback } = useMemo(() => {
      if (!fullGoalData) return { score: 0, feedback: [] };
      return calculateFinancialHealth(fullGoalData);
  }, [fullGoalData]);

  const handleFetchAdvice = async () => {
    if (!onChainGoal) return;
    setIsLoadingAdvice(true);
    setAchievementInfo(null);

    const progress = (microAlgosToAlgos(onChainGoal.totalSaved) / microAlgosToAlgos(onChainGoal.targetAmount)) * 100;
    const achievements = getAchievements(onChainGoal);
    if (achievements.length === 0) {
      setIsLoadingAdvice(false);
      return;
    }

    try {
      const lastAchievement = achievements[achievements.length - 1];
      const advice = await getAchievementCoachAdvice({
        achievementName: lastAchievement,
        goalName: goal.name,
        currentSaved: microAlgosToAlgos(onChainGoal.totalSaved),
        targetAmount: microAlgosToAlgos(onChainGoal.targetAmount),
        progressPercentage: progress
      });
      setAchievementInfo({ message: advice.congratulatoryMessage, tip: advice.microTip });
    } catch (error) {
      console.error("Failed to get achievement advice:", error);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const handleWithdraw = async () => {
    if (!activeAddress || !onChainGoal) {
      toast({ variant: 'destructive', title: "Cannot Withdraw", description: "Please connect your wallet." });
      return;
    }
    setIsWithdrawing(true);
    try {
      toast({ title: "Processing Withdrawal", description: "Please check your wallet to approve." });
      const txId = await withdrawFromGoal(goal.appId, activeAddress, signTransactions);
      toast({ title: "Withdrawal Successful!", description: `TxID: ${txId.substring(0, 10)}...` });
      setLatestTxId(txId);
      await fetchOnChainData();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Withdrawal Failed", description: error instanceof Error ? error.message : "An unknown error occurred." });
    } finally {
      setIsWithdrawing(false);
    }
  };


  if (isFetchingOnChain) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!onChainGoal || !fullGoalData) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-center"><AlertTriangle className="mr-2 text-destructive" /> Failed to Load Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load the on-chain data for this goal. The contract may not be accessible or there might be a network issue.</p>
          <Button onClick={fetchOnChainData} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const targetAmount = microAlgosToAlgos(onChainGoal.targetAmount);
  const currentSaved = microAlgosToAlgos(onChainGoal.totalSaved);
  const progress = targetAmount > 0 ? (currentSaved / targetAmount) * 100 : 0;
  const status = onChainGoal.goalCompleted ? "completed" : "active";
  
  const sortedDeposits = Array.isArray(goal.deposits) ? [...goal.deposits].sort((a, b) => {
      const dateA = toDate(a.timestamp).getTime();
      const dateB = toDate(b.timestamp).getTime();
      return dateB - dateA;
  }) : [];
  

  const getAchievements = (onchainData: OnChainGoal) => {
    const ach: string[] = [];
    if (goal.deposits?.length > 0) ach.push("First Deposit");
    if (onchainData.totalSaved > 0 && onchainData.totalSaved >= onchainData.targetAmount / 2) ach.push("50% Saver");
    if (onchainData.goalCompleted) ach.push("Goal Completed");
    return ach;
  };
  const achievements = getAchievements(onChainGoal);

  const canWithdraw = onChainGoal.goalCompleted || (onChainGoal.deadline > 0 && Date.now() / 1000 > onChainGoal.deadline);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-headline text-3xl">{goal.name}</CardTitle>
              <CardDescription className="mt-2 flex items-center text-base">
                <Calendar className="mr-2 h-4 w-4" />
                Deadline: {formatDateFromTimestamp(onChainGoal.deadline)}
              </CardDescription>
               <div className="mt-1 flex items-center text-xs text-muted-foreground">
                 <Badge variant="outline">App ID: {goal.appId}</Badge>
                 <Badge variant="outline" className="ml-2">Network: Testnet</Badge>
              </div>
            </div>
             <Badge
              variant={status === 'completed' ? 'default' : 'secondary'}
              className={cn(
                'py-2 px-4 text-sm',
                status === 'completed' && 'bg-accent text-accent-foreground'
              )}
            >
              {status === 'completed' ? (
                <CheckCircle2 className="mr-1 h-4 w-4" />
              ) : null}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-sm">
              <span>{formatCurrency(currentSaved)} / {formatCurrency(targetAmount)}</span>
              <span>{progress.toFixed(2)}%</span>
            </div>
            <Progress value={progress} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                      <p className="text-sm text-muted-foreground">Target</p>
                      <p className="text-lg font-semibold">{formatCurrency(targetAmount)}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                  <PiggyBank className="h-8 w-8 text-accent" />
                  <div>
                      <p className="text-sm text-muted-foreground">Saved</p>
                      <p className="text-lg font-semibold">{formatCurrency(currentSaved)}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                  <Milestone className="h-8 w-8 text-yellow-500" />
                  <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-lg font-semibold">{formatCurrency(Math.max(0, targetAmount - currentSaved))}</p>
                  </div>
              </div>
          </div>
           {status !== 'completed' && <DepositDialog goalId={goal.id} goalName={goal.name} appId={goal.appId} onDepositSuccess={fetchOnChainData} />}
           
           {!canWithdraw && onChainGoal.balance > 0 && (
            <Card className="bg-muted/50 border-dashed">
                <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Lock className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Vault is Locked</CardTitle>
                        <CardDescription className="text-xs">
                            Funds are secured on-chain until conditions are met.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                        This is <strong>Discipline-as-a-Service</strong>. The smart contract enforces your savings plan, removing the temptation to withdraw early. The vault will unlock when the goal is complete or after {formatDateFromTimestamp(onChainGoal.deadline)}.
                    </p>
                </CardContent>
            </Card>
           )}

           {canWithdraw && onChainGoal.balance > 0 && (
             <Button onClick={handleWithdraw} disabled={isWithdrawing || !activeAddress} className="w-full" variant="outline">
                {isWithdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2" />}
                {isWithdrawing ? "Withdrawing..." : `Withdraw ${formatCurrency(microAlgosToAlgos(onChainGoal.balance))}`}
              </Button>
           )}
        </CardContent>
      </Card>
      
      {latestTxId && (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Last Transaction</span>
                     <Link href={`https://testnet.explorer.perawallet.app/tx/${latestTxId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center text-xs">
                        View on Explorer <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <p className="text-xs font-mono break-all bg-muted p-2 rounded-md">{latestTxId}</p>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Milestone className="mr-2" /> Savings Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsChart goal={goal} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><History className="mr-2"/> Deposit History</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedDeposits.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Transaction ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDeposits.map((deposit, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDateFromTimestamp(deposit.timestamp)}</TableCell>
                        <TableCell>{formatCurrency(deposit.amount)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          <Link href={`https://testnet.explorer.perawallet.app/tx/${deposit.txId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" title={deposit.txId}>
                            {deposit.txId.substring(0, 12)}...
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground">No deposits made yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><HeartPulse className="mr-2" /> Financial Health</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{healthScore}</span>
                    <span className="text-muted-foreground">/ 100</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    {healthFeedback.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Award className="mr-2" /> Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {achievements.length > 0 ? (
                achievements.map((ach, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2 p-2 text-sm bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Award className="mr-2 h-4 w-4" /> {ach}
                  </Badge>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">No achievements unlocked yet. Keep saving!</p>
              )}
            </CardContent>
          </Card>

           {achievements.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Bot className="mr-2" /> AI Coach</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {achievementInfo && !isLoadingAdvice ? (
                        <div className="space-y-3 text-sm">
                            <p className="italic">"{achievementInfo.message}"</p>
                            <p><strong className="text-primary">Micro-tip:</strong> {achievementInfo.tip}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Get personalized advice from our AI coach based on your latest achievement!
                        </p>
                    )}
                    <Button onClick={handleFetchAdvice} disabled={isLoadingAdvice} className="w-full">
                        {isLoadingAdvice ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Getting advice...</> : "Get AI Coach Tip"}
                    </Button>
                </CardContent>
            </Card>
           )}
        </div>
      </div>
    </div>
  );
}
