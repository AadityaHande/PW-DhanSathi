import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, BarChart3 } from "lucide-react";

interface FinancialOverviewProps {
  totalSaved: number;
  totalTarget: number;
  progressPercent: number;
  activeGoals: number;
  completedGoals: number;
}

export default function FinancialOverview({ 
  totalSaved, totalTarget, progressPercent, activeGoals, completedGoals 
}: FinancialOverviewProps) {
  const stats = [
    {
      title: "Total Saved",
      value: `${totalSaved.toFixed(2)} ALGO`,
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Total Target",
      value: `${totalTarget.toFixed(2)} ALGO`,
      icon: Target,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
    },
    {
      title: "Progress",
      value: `${progressPercent}%`,
      icon: BarChart3,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Goals",
      value: completedGoals > 0 ? (
        <><span className="text-primary">{completedGoals} ✓</span> <span className="text-sm text-muted-foreground ml-1">completed</span></>
      ) : (
        <>{activeGoals} <span className="text-sm text-muted-foreground ml-1">active</span></>
      ),
      icon: Target,
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-card border-border">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
                <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}