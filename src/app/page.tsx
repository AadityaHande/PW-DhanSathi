import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ShieldCheck, Lock, BarChart, BrainCircuit } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Goal, GoalWithOnChainData } from '@/lib/types';
import GoalCard from '@/components/goals/GoalCard';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getGoalOnChainState } from '@/lib/blockchain';
import ReceiptSavingsCard from '@/components/goals/ReceiptSavingsCard';

async function getGoals(): Promise<GoalWithOnChainData[]> {
  const goalsCollection = collection(db, 'goals');
  const q = query(goalsCollection, orderBy('createdAt', 'desc'));
  const goalsSnapshot = await getDocs(q);
  const goalsList = goalsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Goal));

  const goalsWithOnChainData = await Promise.all(
    goalsList.map(async (goal) => {
      const onChainState = await getGoalOnChainState(goal.appId);
      return { ...goal, onChain: onChainState };
    })
  );

  return goalsWithOnChainData;
}

export default async function Home() {
  const goals = await getGoals();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-dashboard');

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 rounded-xl bg-card p-8 text-center shadow-lg">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
            Welcome to AlgoSave
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your personal piggy bank on the blockchain. Start saving for your
            dreams, one micro-deposit at a time.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/goals/new">
              <PlusCircle className="mr-2" />
              Create New Goal
            </Link>
          </Button>
        </div>
        {heroImage && (
          <div className="relative mt-8 h-48 w-full overflow-hidden rounded-lg md:h-64">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          </div>
        )}
      </section>
      
      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Why Blockchain?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                  <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Immutable Record</h3>
                  <p className="text-muted-foreground">Every deposit is a permanent transaction on the Algorand blockchain. Your savings history is tamper-proof and transparent.</p>
              </div>
              <div className="flex flex-col items-center">
                  <Lock className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Discipline-as-a-Service</h3>
                  <p className="text-muted-foreground">Your savings are locked in a smart contract. Withdrawals are only possible after you meet your goal or the deadline passes—it's discipline, enforced by code.</p>
              </div>
              <div className="flex flex-col items-center">
                  <BarChart className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Decentralized Trust</h3>
                  <p className="text-muted-foreground">AlgoSave operates without a central authority. The rules are code, ensuring fairness and removing the need to trust a third party.</p>
              </div>
          </div>
        </section>
        <div className="lg:col-span-2">
            <ReceiptSavingsCard goals={goals} />
        </div>
      </div>

      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="font-headline text-3xl font-semibold">Your Goals</h2>
        <Button asChild variant="outline">
          <Link href="/goals/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
          </Link>
        </Button>
      </div>

      {goals.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
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
    <footer className="py-4 mt-8 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>Running on Algorand Testnet</p>
        </div>
    </footer>
    </>
  );
}
