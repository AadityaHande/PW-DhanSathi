// Local storage-based goal store — replaces Firebase when it is unreachable.
// Runs entirely in the browser; the data structure mirrors the Firestore schema.

import type { Goal, Deposit } from "./types";

const GOALS_KEY = "algosave_goals";

// ── helpers ──────────────────────────────────────────────────────────────────

function readGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGoals(goals: Goal[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

// ── public API ───────────────────────────────────────────────────────────────

export function getAllGoals(): Goal[] {
  return readGoals();
}

export function getGoalById(id: string): Goal | null {
  return readGoals().find((g) => g.id === id) ?? null;
}

export function saveGoal(data: { name: string; appId: number }): Goal {
  const goals = readGoals();
  const newGoal: Goal = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    appId: data.appId,
    createdAt: new Date().toISOString(),
    deposits: [],
  };
  goals.push(newGoal);
  writeGoals(goals);
  return newGoal;
}

export function addDepositToGoal(
  goalId: string,
  deposit: { amount: number; txId: string }
): Goal | null {
  const goals = readGoals();
  const idx = goals.findIndex((g) => g.id === goalId);
  if (idx === -1) return null;

  const newDeposit: Deposit = {
    amount: deposit.amount,
    timestamp: new Date().toISOString(),
    txId: deposit.txId,
  };

  goals[idx].deposits.push(newDeposit);
  writeGoals(goals);
  return goals[idx];
}

export function deleteGoal(goalId: string) {
  const goals = readGoals().filter((g) => g.id !== goalId);
  writeGoals(goals);
}
