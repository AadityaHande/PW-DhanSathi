"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Plus,
  LogIn,
  Loader2,
  Copy,
  Check,
  Target,
  Calendar,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllGroups } from "@/lib/local-store";
import type { SavingsGroup } from "@/lib/types";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function GroupsPage() {
  const router = useRouter();
  const { activeAddress, isConnecting } = useWallet();
  const { toast } = useToast();
  const [groups, setGroups] = useState<SavingsGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!activeAddress && !isConnecting) {
      router.push("/");
    }
  }, [activeAddress, isConnecting, router]);

  useEffect(() => {
    if (activeAddress) {
      const all = getAllGroups();
      // Show groups where user is a member
      const myGroups = all.filter((g) =>
        g.members.some((m) => m.address === activeAddress)
      );
      setGroups(myGroups);
      setIsLoading(false);
    }
  }, [activeAddress]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      toast({ title: "Invite code copied!", description: `Share code: ${code}` });
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const getTotalContributed = (group: SavingsGroup) =>
    group.members.reduce((sum, m) => sum + m.contributed, 0);

  const getProgress = (group: SavingsGroup) => {
    const total = getTotalContributed(group);
    return group.targetAmount > 0 ? Math.min((total / group.targetAmount) * 100, 100) : 0;
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
              <Users className="h-7 w-7 text-primary" />
              Group Savings
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Save together, achieve more — powered by Algorand blockchain
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/groups/join">
              <Button variant="outline" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Join
              </Button>
            </Link>
            <Link href="/groups/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="h-14 w-14 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Create a group savings goal or join one with an invite code.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/groups/join">
                  <Button variant="outline">
                    <LogIn className="h-4 w-4 mr-2" />
                    Join with Code
                  </Button>
                </Link>
                <Link href="/groups/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const totalContributed = getTotalContributed(group);
              const progress = getProgress(group);
              const isCompleted = progress >= 100;

              return (
                <Card key={group.id} className={cn(isCompleted && "border-green-500/50")}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{group.name}</CardTitle>
                        {group.description && (
                          <CardDescription className="mt-1 text-sm line-clamp-2">
                            {group.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isCompleted ? (
                          <Badge className="bg-green-500 text-white">Completed</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.members.length} members
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Group Progress</span>
                        <span className="font-medium">
                          {totalContributed.toFixed(2)} / {group.targetAmount} ALGO ({progress.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={progress} className={cn(isCompleted && "[&>div]:bg-green-500")} />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs">Target</p>
                          <p className="font-medium text-foreground">{group.targetAmount} ALGO</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs">Deadline</p>
                          <p className="font-medium text-foreground">
                            {format(new Date(group.deadline), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-xs">Saved</p>
                          <p className="font-medium text-foreground">{totalContributed.toFixed(2)} ALGO</p>
                        </div>
                      </div>
                    </div>

                    {/* Top contributors */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Top contributors</p>
                      <div className="space-y-1">
                        {[...group.members]
                          .sort((a, b) => b.contributed - a.contributed)
                          .slice(0, 3)
                          .map((member) => (
                            <div key={member.address} className="flex items-center justify-between text-sm">
                              <span className={cn("truncate", member.address === activeAddress && "font-semibold text-primary")}>
                                {member.nickname}
                                {member.address === activeAddress && " (You)"}
                              </span>
                              <span className="text-muted-foreground">{member.contributed.toFixed(2)} ALGO</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Invite code + actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Invite:</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{group.inviteCode}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyCode(group.inviteCode)}
                        >
                          {copiedCode === group.inviteCode ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <Link href={`/groups/${group.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
