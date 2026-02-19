"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Loader2,
  ArrowLeft,
  Copy,
  Check,
  TrendingUp,
  Target,
  Calendar,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getGroupById, updateGroupContribution } from "@/lib/local-store";
import type { SavingsGroup } from "@/lib/types";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { activeAddress, isConnecting } = useWallet();
  const { toast } = useToast();

  const [group, setGroup] = useState<SavingsGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [contributeAmount, setContributeAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);

  useEffect(() => {
    if (!activeAddress && !isConnecting) {
      router.push("/");
    }
  }, [activeAddress, isConnecting, router]);

  useEffect(() => {
    if (id) {
      const g = getGroupById(id);
      setGroup(g);
      setIsLoading(false);
    }
  }, [id]);

  const handleCopyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode).then(() => {
      setCopiedCode(true);
      toast({ title: "Invite code copied!", description: `Share code: ${group.inviteCode}` });
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddress || !group) return;
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid amount" });
      return;
    }

    setIsContributing(true);
    try {
      updateGroupContribution(group.id, activeAddress, amount);
      const updated = getGroupById(group.id);
      setGroup(updated);
      setContributeAmount("");
      toast({
        title: "Contribution recorded! 🎉",
        description: `${amount} ALGO added to "${group.name}"`,
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to record contribution" });
    } finally {
      setIsContributing(false);
    }
  };

  const getTotalContributed = (g: SavingsGroup) =>
    g.members.reduce((sum, m) => sum + m.contributed, 0);

  const getProgress = (g: SavingsGroup) => {
    const total = getTotalContributed(g);
    return g.targetAmount > 0 ? Math.min((total / g.targetAmount) * 100, 100) : 0;
  };

  if (!activeAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <main className="container py-6 px-4 max-w-xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">Group not found.</p>
              <Link href="/groups">
                <Button className="mt-4">Back to Groups</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const totalContributed = getTotalContributed(group);
  const progress = getProgress(group);
  const isCompleted = progress >= 100;
  const isMember = group.members.some((m) => m.address === activeAddress);
  const myContribution = group.members.find((m) => m.address === activeAddress)?.contributed ?? 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container py-6 px-4 md:py-8 max-w-2xl mx-auto space-y-6">
        <div>
          <Link href="/groups">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="text-muted-foreground text-sm mt-1">{group.description}</p>
              )}
            </div>
            {isCompleted ? (
              <Badge className="bg-green-500 text-white">Completed</Badge>
            ) : (
              <Badge variant="secondary">Active</Badge>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Group Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{totalContributed.toFixed(2)} ALGO raised</span>
                <span className="text-muted-foreground">of {group.targetAmount} ALGO ({progress.toFixed(0)}%)</span>
              </div>
              <Progress value={progress} className={cn(isCompleted && "[&>div]:bg-green-500")} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-medium">{group.targetAmount} ALGO</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="font-medium">{format(new Date(group.deadline), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Your share</p>
                  <p className="font-medium">{myContribution.toFixed(2)} ALGO</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contribute */}
        {isMember && !isCompleted && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Record Contribution
              </CardTitle>
              <CardDescription>
                Track your ALGO contribution to this group goal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContribute} className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="Amount in ALGO"
                  className="flex-1"
                />
                <Button type="submit" disabled={isContributing || !contributeAmount}>
                  {isContributing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Members */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Members ({group.members.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {group.inviteCode}
                </code>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyCode}>
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {[...group.members]
                .sort((a, b) => b.contributed - a.contributed)
                .map((member, idx) => (
                  <li
                    key={member.address}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      member.address === activeAddress && "bg-primary/5"
                    )}
                  >
                    <span className="w-5 text-xs text-muted-foreground font-mono">{idx + 1}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.nickname.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.nickname}
                        {member.address === activeAddress && (
                          <Badge variant="outline" className="ml-2 text-xs py-0">You</Badge>
                        )}
                        {member.address === group.createdBy && (
                          <Badge variant="secondary" className="ml-1 text-xs py-0">Creator</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{member.address.slice(0, 10)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {member.contributed.toFixed(2)} ALGO
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.targetAmount > 0
                          ? `${((member.contributed / group.targetAmount) * 100).toFixed(0)}%`
                          : "–"}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
