"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2, ArrowLeft } from "lucide-react";
import { getGroupByInviteCode, joinGroup } from "@/lib/local-store";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function JoinGroupPage() {
  const router = useRouter();
  const { activeAddress } = useWallet();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddress) {
      toast({ variant: "destructive", title: "Wallet not connected" });
      return;
    }
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast({ variant: "destructive", title: "Please enter an invite code" });
      return;
    }

    setIsSubmitting(true);
    try {
      const group = getGroupByInviteCode(trimmed);
      if (!group) {
        toast({ variant: "destructive", title: "Invalid invite code", description: "No group found with that code." });
        setIsSubmitting(false);
        return;
      }

      joinGroup(group.id, activeAddress);
      toast({ title: `Joined "${group.name}"! 🎉`, description: "You are now a member of this savings group." });
      router.push("/groups");
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Failed to join group" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container py-6 px-4 md:py-8 max-w-sm mx-auto">
        <div className="mb-6">
          <Link href="/groups">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Join a Group</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter the invite code shared by the group creator.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enter Invite Code</CardTitle>
            <CardDescription>
              Codes are 6 characters, e.g. <code className="font-mono">AB12CD</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Invite Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="AB12CD"
                  maxLength={10}
                  className="font-mono text-center text-lg tracking-widest uppercase"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || !code.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Join Group
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
