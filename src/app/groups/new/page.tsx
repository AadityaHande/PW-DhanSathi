"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createGroup } from "@/lib/local-store";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function CreateGroupPage() {
  const router = useRouter();
  const { activeAddress } = useWallet();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddress) {
      toast({ variant: "destructive", title: "Wallet not connected" });
      return;
    }
    if (!name.trim() || !targetAmount || !deadline) {
      toast({ variant: "destructive", title: "Please fill in all required fields" });
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      toast({ variant: "destructive", title: "Invalid target amount" });
      return;
    }

    setIsSubmitting(true);
    try {
      const group = createGroup({
        name: name.trim(),
        description: description.trim(),
        targetAmount: target,
        deadline: deadline.toISOString(),
        createdBy: activeAddress,
      });

      toast({
        title: "Group Created! 🎉",
        description: `Share invite code: ${group.inviteCode}`,
      });
      router.push("/groups");
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Failed to create group" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container py-6 px-4 md:py-8 max-w-xl mx-auto">
        <div className="mb-6">
          <Link href="/groups">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Create Group Savings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set a shared savings goal for your group
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Group Details</CardTitle>
            <CardDescription>
              An invite code will be generated automatically — share it with friends to join.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., College Trip Fund"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you saving for?"
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Amount (ALGO) *</Label>
                <Input
                  id="target"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g., 50"
                />
              </div>

              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "Pick a deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Create Group
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
