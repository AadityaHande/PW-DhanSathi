"use client";

import { useEffect, useState } from "react";
import type { Goal } from "@/lib/types";
import { getGoalById } from "@/lib/local-store";
import GoalDetailsClient from "@/components/goals/GoalDetailsClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function GoalPage() {
  const params = useParams();
  const id = params.id as string;
  const [goal, setGoal] = useState<Goal | null | undefined>(undefined);

  useEffect(() => {
    const found = getGoalById(id);
    setGoal(found);
  }, [id]);

  if (goal === undefined) {
    return (
      <div className="container mx-auto flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold">Goal not found</h2>
        <p className="mt-2 text-muted-foreground">
          This goal doesn't exist or was removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <GoalDetailsClient goal={goal} />
    </div>
  );
}
