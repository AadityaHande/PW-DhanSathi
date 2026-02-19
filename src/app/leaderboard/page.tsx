"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Star, Loader2, RefreshCw, Crown, TrendingUp, Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getLeaderboard,
  upsertLeaderboardEntry,
  getAllGoals,
  getNickname,
  setNickname,
} from "@/lib/local-store";
import { getGoalOnChainState } from "@/lib/blockchain";
import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const router = useRouter();
  const { activeAddress, isConnecting } = useWallet();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNicknameInput] = useState("");
  const [isSavingNickname, setIsSavingNickname] = useState(false);

  useEffect(() => {
    if (!activeAddress && !isConnecting) {
      router.push("/");
    }
  }, [activeAddress, isConnecting, router]);

  useEffect(() => {
    if (activeAddress) {
      setNicknameInput(getNickname(activeAddress));
    }
  }, [activeAddress]);

  const refreshLeaderboard = useCallback(async () => {
    if (!activeAddress) return;
    setIsLoading(true);
    try {
      // Compute current user's stats from on-chain data and update leaderboard
      const goals = getAllGoals();
      let totalSaved = 0;
      let completedGoals = 0;
      let activeGoals = 0;

      for (const goal of goals) {
        try {
          const onChain = await getGoalOnChainState(goal.appId);
          totalSaved += (onChain.totalSaved || 0) / 1_000_000;
          if (onChain.goalCompleted) completedGoals++;
          else activeGoals++;
        } catch {
          // skip unreachable goals
        }
      }

      const score = Math.round(totalSaved * 10 + completedGoals * 50 + activeGoals * 5);

      upsertLeaderboardEntry({
        address: activeAddress,
        nickname: getNickname(activeAddress),
        totalSaved,
        completedGoals,
        activeGoals,
        score,
      });

      setEntries(getLeaderboard());
    } catch (err) {
      console.error("Error refreshing leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeAddress]);

  useEffect(() => {
    if (activeAddress) {
      refreshLeaderboard();
    }
  }, [refreshLeaderboard, activeAddress]);

  const handleSaveNickname = async () => {
    if (!activeAddress || !nickname.trim()) return;
    setIsSavingNickname(true);
    setNickname(activeAddress, nickname.trim());
    await refreshLeaderboard();
    setIsSavingNickname(false);
  };

  const getRankIcon = (rank: number, badge: LeaderboardEntry["badge"]) => {
    if (badge === "gold") return <Crown className="h-5 w-5 text-yellow-500" />;
    if (badge === "silver") return <Medal className="h-5 w-5 text-gray-400" />;
    if (badge === "bronze") return <Medal className="h-5 w-5 text-amber-600" />;
    return <Star className="h-5 w-5 text-muted-foreground" />;
  };

  const getBadgeStyle = (badge: LeaderboardEntry["badge"]) => {
    switch (badge) {
      case "gold": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "silver": return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300";
      case "bronze": return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300";
      default: return "";
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container py-6 px-4 md:py-8 max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-7 w-7 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Top savers on DhanSathi — powered by Algorand blockchain
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshLeaderboard} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Nickname Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Display Name</CardTitle>
            <CardDescription>Set a nickname to appear on the leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={nickname}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Enter nickname..."
                className="flex-1"
                maxLength={20}
              />
              <Button onClick={handleSaveNickname} disabled={isSavingNickname || !nickname.trim()}>
                {isSavingNickname ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 podium */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[entries[1], entries[0], entries[2]].map((entry, i) => {
              const positions = [1, 0, 2];
              const heights = ["h-24", "h-32", "h-20"];
              return (
                <Card
                  key={entry.address}
                  className={cn(
                    "flex flex-col items-center justify-end p-3 text-center",
                    heights[i],
                    entry.address === activeAddress && "border-primary border-2",
                    getBadgeStyle(entry.badge)
                  )}
                >
                  <div className="mb-1">{getRankIcon(entry.rank, entry.badge)}</div>
                  <p className="text-xs font-semibold truncate w-full">{entry.nickname}</p>
                  <p className="text-xs text-muted-foreground">{entry.totalSaved.toFixed(2)} ALGO</p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Full leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Savers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No entries yet. Be the first on the leaderboard!</p>
                <p className="text-xs mt-1">Create a savings goal to join.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {entries.map((entry) => (
                  <li
                    key={entry.address}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 transition-colors",
                      entry.address === activeAddress && "bg-primary/5"
                    )}
                  >
                    <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                      {entry.rank}
                    </span>
                    <div className="flex items-center justify-center w-7">
                      {getRankIcon(entry.rank, entry.badge)}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {entry.nickname.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {entry.nickname}
                        {entry.address === activeAddress && (
                          <Badge variant="outline" className="ml-2 text-xs py-0">You</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {entry.address.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {entry.totalSaved.toFixed(2)} ALGO
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                        <span className="flex items-center gap-0.5">
                          <Target className="h-3 w-3" /> {entry.activeGoals}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> {entry.completedGoals}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={cn("text-xs", getBadgeStyle(entry.badge))}>
                        {entry.score} pts
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Scores: 10 pts/ALGO saved · 50 pts/completed goal · 5 pts/active goal
        </p>
      </main>
    </div>
  );
}
