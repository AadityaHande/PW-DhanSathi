import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { GoalWithOnChainData } from '@/lib/types';
import { formatCurrency, formatDateFromTimestamp, microAlgosToAlgos } from '@/lib/utils';
import { ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateFinancialHealth } from '@/lib/financial-health';
import { FinancialHealthIndicator } from './FinancialHealthIndicator';

type GoalCardProps = {
  goal: GoalWithOnChainData;
};

export default function GoalCard({ goal }: GoalCardProps) {
  const { onChain } = goal;

  const targetAmount = microAlgosToAlgos(onChain.targetAmount);
  const currentSaved = microAlgosToAlgos(onChain.totalSaved);

  const progress =
    targetAmount > 0 ? (currentSaved / targetAmount) * 100 : 0;
  
  const status = onChain.goalCompleted ? "completed" : "active";

  const { score } = calculateFinancialHealth(goal);

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-headline text-xl">{goal.name}</CardTitle>
          <Badge
            variant={status === 'completed' ? 'default' : 'secondary'}
            className={cn(
              status === 'completed' && 'bg-accent text-accent-foreground'
            )}
          >
            {status === 'completed' ? (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            ) : null}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="flex items-center pt-1 text-sm">
          <Calendar className="mr-2 h-4 w-4" />
          Deadline: {formatDateFromTimestamp(onChain.deadline)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="flex items-end justify-between rounded-lg bg-secondary/50 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Saved</p>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(currentSaved)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-sm font-medium">
              {formatCurrency(targetAmount)}
            </p>
          </div>
        </div>
         <div className="flex items-center justify-center gap-2 pt-2">
            <p className="text-xs text-muted-foreground">Financial Health:</p>
            <FinancialHealthIndicator score={score} />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href={`/goals/${goal.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
