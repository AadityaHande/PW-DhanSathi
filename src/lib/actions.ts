"use server";

import { z } from "zod";
import { db } from "./firebase";
import { addDoc, collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Goal, Deposit } from "./types";
import { depositToGoal } from "./blockchain";

const SaveGoalMetadataSchema = z.object({
  name: z.string().min(3),
  appId: z.number().gt(0),
});

export async function saveGoalMetadata(data: { name: string; appId: number }) {
  const validatedFields = SaveGoalMetadataSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Invalid goal metadata.");
  }

  const { name, appId } = validatedFields.data;

  try {
    const goalsCollection = collection(db, "goals");
    await addDoc(goalsCollection, {
      name,
      appId,
      createdAt: serverTimestamp(),
      deposits: [],
    });
  } catch (e) {
    console.error("Error saving goal metadata:", e);
    throw new Error("Database error: Failed to save goal.");
  }

  revalidatePath("/");
}


const AddDepositSchema = z.object({
  goalId: z.string().min(1),
  appId: z.coerce.number().gt(0),
  amount: z.coerce.number().gt(0, { message: "Deposit amount must be positive." }),
  sender: z.string().min(1),
});

export async function addDeposit(prevState: any, formData: FormData) {
  const validatedFields = AddDepositSchema.safeParse({
    goalId: formData.get("goalId"),
    appId: formData.get("appId"),
    amount: formData.get("amount"),
    sender: formData.get("sender"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const { goalId, appId, amount, sender } = validatedFields.data;
  const goalRef = doc(db, "goals", goalId);

  try {
    // This is a placeholder for the real transaction signing that happens on client
    // The server action now primarily serves to update the deposit history cache in Firebase
    const txId = formData.get("txId") as string;
    
    await runTransaction(db, async (transaction) => {
      const goalDoc = await transaction.get(goalRef);
      if (!goalDoc.exists()) {
        throw new Error("Goal does not exist!");
      }

      const goalData = goalDoc.data() as Omit<Goal, 'id'>;
      
      const newDeposit: Omit<Deposit, 'timestamp'> & { timestamp: any } = {
        amount,
        timestamp: serverTimestamp(),
        txId,
      };

      transaction.update(goalRef, {
        deposits: [...goalData.deposits, newDeposit],
      });
    });

  } catch (e) {
    console.error("Error adding deposit:", e);
    // In a real app, you might want to handle cases where on-chain succeeds but firebase fails
    return { message: "Database error: Failed to cache deposit history." };
  }

  revalidatePath("/");
  revalidatePath(`/goals/${goalId}`);
  
  return { message: "Deposit cached successfully!" };
}
