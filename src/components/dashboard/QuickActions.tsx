import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, BarChart3, Bot } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="hidden md:grid grid-cols-3 gap-4 mb-8">
      <Button asChild size="lg" className="h-auto py-4">
        <Link href="/goals/new" className="flex flex-col items-center gap-2">
          <PlusCircle className="h-6 w-6" />
          <span>Create New Goal</span>
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="h-auto py-4">
        <Link href="/analytics" className="flex flex-col items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <span>View Analytics</span>
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="h-auto py-4">
        <Link href="/advisor" className="flex flex-col items-center gap-2">
          <Bot className="h-6 w-6" />
          <span>AI Financial Advisor</span>
        </Link>
      </Button>
    </div>
  );
}