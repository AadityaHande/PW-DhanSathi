import { Loader2, RefreshCw, PlusCircle } from "lucide-react";
import GoalCard from "@/components/goals/GoalCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { GoalWithOnChainData } from "@/lib/types";

interface GoalsListProps {
  goals: GoalWithOnChainData[];
  isLoading: boolean;
  loadGoals: () => void;
}

export default function GoalsList({ goals, isLoading, loadGoals }: GoalsListProps) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">Your Goals</h2>
        <div className="flex gap-2">
          <Button onClick={loadGoals} variant="ghost" size="sm" disabled={isLoading}>
            <RefreshCw className={`mr-1 md:mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/goals/new">
              <PlusCircle className="mr-1 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Goal</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading goals from blockchain...</p>
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
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
  );
}