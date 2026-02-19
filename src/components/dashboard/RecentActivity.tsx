import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface Deposit {
  amount: number;
  timestamp: number;
  goalName: string;
}

interface RecentActivityProps {
  deposits: Deposit[];
}

export default function RecentActivity({ deposits }: RecentActivityProps) {
  if (deposits.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {deposits.map((deposit, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Deposit to "{deposit.goalName}"</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(deposit.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-primary">+{deposit.amount} ALGO</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}