import CreateGoalForm from "@/components/goals/CreateGoalForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function NewGoalPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="shadow-lg">
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
  );
}
