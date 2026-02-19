"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PiggyBank } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useWallet } from "@/contexts/WalletContext";
import { depositToGoal } from "@/lib/blockchain";
import { addDepositToGoal } from "@/lib/local-store";

type DepositDialogProps = {
  goalId: string;
  goalName: string;
  appId: number;
  onDepositSuccess: () => void;
  trigger?: React.ReactNode;
  initialAmount?: number;
};

const DepositSchema = z.object({
  amount: z.coerce.number().gt(0, { message: "Deposit amount must be positive." }),
});

type DepositFormValues = z.infer<typeof DepositSchema>;

export function DepositDialog({ goalId, goalName, appId, onDepositSuccess, trigger, initialAmount }: DepositDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { activeAddress, signTransactions } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(DepositSchema),
    defaultValues: {
      amount: initialAmount || ("" as unknown as number),
    }
  });

  useEffect(() => {
    if (initialAmount) {
      form.setValue("amount", initialAmount);
    }
  }, [initialAmount, form, isOpen]);

  async function onSubmit(data: DepositFormValues) {
    if (!activeAddress) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make a deposit.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      toast({ title: "Processing Deposit", description: "Please check your wallet to approve the transaction." });
      
      const txId = await depositToGoal(appId, activeAddress, data.amount, signTransactions);

      toast({ title: "Deposit Successful!", description: "Your transaction has been confirmed." });

      // Save deposit to local storage
      addDepositToGoal(goalId, { amount: data.amount, txId });
      
      onDepositSuccess();
      setIsOpen(false);
      form.reset({ amount: "" as unknown as number });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Making Deposit",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const dialogTrigger = trigger || (
    <Button className="w-full" size="lg">
      <PiggyBank className="mr-2" /> Make a Deposit
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit to "{goalName}"</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to deposit. This will be recorded on-chain.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (ALGO)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="e.g., 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || !activeAddress}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Depositing..." : "Confirm Deposit"}
            </Button>
             {!activeAddress && <p className="text-center text-sm text-muted-foreground">Connect your wallet to make a deposit.</p>}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
