// Local storage-based goal store — replaces Firebase when it is unreachable.
// Runs entirely in the browser; the data structure mirrors the Firestore schema.

import type { Goal, Deposit, GoalNFT, SavingsGroup, GroupMember, LeaderboardEntry } from "./types";

const GOALS_KEY = "algosave_goals";
const NFTS_KEY = "algosave_nfts";

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

export function getAllDeposits(): (Deposit & { goalId: string; goalName: string })[] {
  const goals = readGoals();
  const allDeposits: (Deposit & { goalId: string; goalName: string })[] = [];
  
  for (const goal of goals) {
    for (const deposit of goal.deposits || []) {
      allDeposits.push({
        ...deposit,
        goalId: goal.id,
        goalName: goal.name,
      });
    }
  }
  
  // Sort by timestamp
  return allDeposits.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

// ── NFT storage ──────────────────────────────────────────────────────────────

function readNFTs(): Record<string, GoalNFT> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NFTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeNFTs(nfts: Record<string, GoalNFT>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NFTS_KEY, JSON.stringify(nfts));
}

/** Save a minted NFT record, keyed by goal ID. */
export function saveGoalNFT(goalId: string, nft: GoalNFT) {
  const nfts = readNFTs();
  nfts[goalId] = nft;
  writeNFTs(nfts);
}

/** Retrieve the NFT record for a goal, or null if not minted yet. */
export function getGoalNFT(goalId: string): GoalNFT | null {
  return readNFTs()[goalId] ?? null;
}

// ── Group Savings ─────────────────────────────────────────────────────────────

const GROUPS_KEY = "algosave_groups";
const PROFILE_KEY = "algosave_profile";

function readGroups(): SavingsGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGroups(groups: SavingsGroup[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function getAllGroups(): SavingsGroup[] {
  return readGroups();
}

export function getGroupById(id: string): SavingsGroup | null {
  return readGroups().find((g) => g.id === id) ?? null;
}

export function getGroupByInviteCode(code: string): SavingsGroup | null {
  return readGroups().find((g) => g.inviteCode === code) ?? null;
}

export function createGroup(data: Omit<SavingsGroup, "id" | "createdAt" | "inviteCode" | "members">): SavingsGroup {
  const groups = readGroups();
  const uuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const inviteCode = uuid.replace(/-/g, "").slice(0, 6).toUpperCase();
  const newGroup: SavingsGroup = {
    ...data,
    id: `group_${uuid}`,
    createdAt: new Date().toISOString(),
    inviteCode,
    members: [
      {
        address: data.createdBy,
        nickname: getNickname(data.createdBy),
        contributed: 0,
        joinedAt: new Date().toISOString(),
      },
    ],
  };
  groups.push(newGroup);
  writeGroups(groups);
  return newGroup;
}

export function joinGroup(groupId: string, memberAddress: string): SavingsGroup | null {
  const groups = readGroups();
  const idx = groups.findIndex((g) => g.id === groupId);
  if (idx === -1) return null;
  const alreadyMember = groups[idx].members.some((m) => m.address === memberAddress);
  if (alreadyMember) return groups[idx];
  groups[idx].members.push({
    address: memberAddress,
    nickname: getNickname(memberAddress),
    contributed: 0,
    joinedAt: new Date().toISOString(),
  });
  writeGroups(groups);
  return groups[idx];
}

export function updateGroupContribution(groupId: string, memberAddress: string, amount: number): void {
  const groups = readGroups();
  const idx = groups.findIndex((g) => g.id === groupId);
  if (idx === -1) return;
  const memberIdx = groups[idx].members.findIndex((m) => m.address === memberAddress);
  if (memberIdx === -1) return;
  groups[idx].members[memberIdx].contributed += amount;
  writeGroups(groups);
}

// ── User Profile / Nickname ───────────────────────────────────────────────────

export function getNickname(address: string): string {
  if (typeof window === "undefined") return shortAddress(address);
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const profiles: Record<string, string> = raw ? JSON.parse(raw) : {};
    return profiles[address] || shortAddress(address);
  } catch {
    return shortAddress(address);
  }
}

export function setNickname(address: string, nickname: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const profiles: Record<string, string> = raw ? JSON.parse(raw) : {};
    profiles[address] = nickname;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  } catch {}
}

function shortAddress(address: string): string {
  if (!address) return "Unknown";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

const LEADERBOARD_KEY = "algosave_leaderboard";

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function upsertLeaderboardEntry(entry: Omit<LeaderboardEntry, "rank" | "badge">): void {
  if (typeof window === "undefined") return;
  try {
    const entries = getLeaderboard();
    const idx = entries.findIndex((e) => e.address === entry.address);
    const newEntry = { ...entry, rank: 0, badge: "starter" as const };
    if (idx === -1) {
      entries.push(newEntry);
    } else {
      entries[idx] = { ...entries[idx], ...newEntry };
    }
    // Re-rank
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, i) => {
      e.rank = i + 1;
      if (i === 0) e.badge = "gold";
      else if (i === 1) e.badge = "silver";
      else if (i === 2) e.badge = "bronze";
      else e.badge = "starter";
    });
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch {}
}
