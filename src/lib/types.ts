// This is what is stored locally. It's metadata for the on-chain goal.
export interface Goal {
  id: string;
  name: string;
  appId: number;
  createdAt: any; // ISO string or Timestamp
  // This is a cache for chart history, not the source of truth for savings.
  deposits: Deposit[];
}

export interface Deposit {
  amount: number; // in ALGOs
  timestamp: any; // ISO string or Timestamp
  txId: string;
}

// This represents the state fetched from the smart contract, the source of truth.
export interface OnChainGoal {
  goalOwner: string;
  targetAmount: number; // in microALGOs
  totalSaved: number; // in microALGOs
  deadline: number; // unix timestamp
  goalCompleted: boolean;
  balance: number; // in microALGOs
}

// This is a combined type for convenience in the UI.
export type GoalWithOnChainData = Goal & {
  onChain: OnChainGoal;
};

// Represents a minted achievement NFT linked to a goal.
export interface GoalNFT {
  assetId: number;
  txId: string;
  mintedAt: string; // ISO string
}

// ── Group Savings ─────────────────────────────────────────────────────────────

export interface GroupMember {
  address: string;
  nickname: string;
  contributed: number; // in ALGOs
  joinedAt: string; // ISO string
}

export interface SavingsGroup {
  id: string;
  name: string;
  description: string;
  targetAmount: number; // in ALGOs
  deadline: string; // ISO string
  createdAt: string; // ISO string
  createdBy: string; // wallet address
  members: GroupMember[];
  inviteCode: string; // short code for joining
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  address: string;
  nickname: string;
  totalSaved: number; // in ALGOs
  completedGoals: number;
  activeGoals: number;
  score: number; // composite score for ranking
  rank: number;
  badge: "gold" | "silver" | "bronze" | "starter";
}
