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
