import { db } from "@/lib/firebase";
import type { Goal } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import GoalDetailsClient from "@/components/goals/GoalDetailsClient";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

async function getGoal(id: string): Promise<Goal | null> {
  const goalRef = doc(db, 'goals', id);
  const goalSnap = await getDoc(goalRef);

  if (!goalSnap.exists()) {
    return null;
  }

  // The document from firestore only has metadata now
  return { id: goalSnap.id, ...goalSnap.data() } as Goal;
}

type GoalPageProps = {
  params: { id: string };
};

export default async function GoalPage({ params }: GoalPageProps) {
  const goal = await getGoal(params.id);

  if (!goal) {
    notFound();
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
