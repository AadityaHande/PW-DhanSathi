"use client";

import CreateGoalForm from "@/components/goals/CreateGoalForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ArrowLeft, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/contexts/WalletContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewGoalPage() {
  const { activeAddress, disconnectWallet } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!activeAddress) {
      router.push("/");
    }
  }, [activeAddress, router]);

  if (!activeAddress) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">DhanSathi</span>
            </div>
          </div>
          <Button onClick={disconnectWallet} variant="outline" size="sm">
            <Wallet className="mr-2 h-4 w-4" />
            {`${activeAddress.substring(0, 6)}...${activeAddress.substring(activeAddress.length - 4)}`}
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="shadow-lg bg-card border-border">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="font-headline text-2xl">Create a New Savings Goal</CardTitle>
                <CardDescription>What are you saving for? Let's set it up!</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CreateGoalForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
