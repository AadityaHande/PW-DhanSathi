# AlgoSave Smart Contract Documentation

## Overview

The AlgoSave application uses a **PyTEAL smart contract** deployed on the **Algorand Testnet**. This document explains all the technical concepts in simple terms.

---

## 📚 Key Concepts Explained

### **What is a Smart Contract?**

A **smart contract** is a self-executing program stored on the blockchain. It automatically enforces rules without needing a middleman (like a bank).

**Real-world analogy**: Instead of trusting a bank to hold your money, the smart contract code itself guarantees that rules are followed.

### **What is Algorand?**

**Algorand** is a blockchain platform that is:
- **Fast**: Transactions finalize in ~5 seconds
- **Cheap**: Transaction fees are very low (~0.001 ALGO = $0.00015)
- **Eco-friendly**: Uses proof-of-stake (no mining power waste)
- **Scalable**: Can handle thousands of transactions per second

**ALGO** = Native currency of Algorand (like Bitcoin or Ethereum)

### **What is Testnet?**

**Testnet** is a practice blockchain for testing. It's identical to the main network but uses fake ALGO (gets filled from a faucet automatically). Perfect for learning without risking real money.

### **What is PyTEAL?**

**PyTEAL** is a Python framework for writing Algorand smart contracts. Instead of writing in raw TEAL (Algorand Assembly), we write Python code that's cleaner and easier to understand.

### **What is TEAL?**

**TEAL** = "Transaction Execution Approval Language"
- The actual bytecode language Algorand nodes execute
- PyTEAL compiles Python → TEAL → Bytecode
- Users don't need to understand TEAL directly

---

## 🏗️ AlgoSave Smart Contract Architecture

### **Contract Purpose**

The AlgoSave contract acts as a **savings vault**:
- Receives deposits (ALGO transfers)
- Tracks total saved
- Prevents withdrawals until goal is complete
- Locks funds using on-chain logic

### **Contract Structure (contracts/app.py)**

```python
class SavingsVaultState:
    goal_owner: Bytes          # Wallet address of who created the goal
    target_amount: Uint64      # How much ALGO to save (in microAlgos)
    total_saved: Uint64        # Current amount saved (in microAlgos)
    deadline: Uint64           # Unix timestamp when goal expires
    goal_completed: Uint64     # 0 = active, 1 = completed
    balance: Uint64            # Available balance in contract account
```

**What are microAlgos?**
- 1 ALGO = 1,000,000 microAlgos
- All blockchain transactions use microAlgos (for precision)
- When you see 1000000 in code, that's 1 ALGO

---

## 🔧 Smart Contract Methods

### **1. create_goal(goal_name, target_amt, deadline_ts)**

**What it does**: Creates a new savings goal

**Who calls it**: Frontend (CreateGoalForm)

**On-chain logic**:
```python
# Set initial state on the user's local account
goal_owner = Txn.sender()      # Store who created this goal
target_amount = target_amt      # Store target in microAlgos
total_saved = 0                 # Start at zero
deadline = deadline_ts          # Store deadline timestamp
goal_completed = 0              # Mark as active (0 = not complete)
```

**Transaction requirements**:
- Caller must have enough fees to create state (~1,000 microAlgos)
- Goal owner is always transaction sender's wallet

**Returns**: `appId` (unique ID for this goal's contract)

**Code location**: [contracts/app.py (lines 25-35)](contracts/app.py)

---

### **2. deposit(payment_txn)**

**What it does**: Records an ALGO deposit into the vault

**Who calls it**: Frontend (DepositDialog)

**On-chain logic**:
```python
# Verify goal is not already completed
assert goal_completed == 0, "Goal is already completed"

# Verify payment was actually sent
assert payment.amount > 0, "No payment received"

# Verify sender is the goal owner
assert Txn.sender() == goal_owner, "Only owner can deposit"

# Update total saved
total_saved += payment.amount
balance += payment.amount      # Contract now holds the funds
```

**Why grouped transactions?**

The deposit requires **two atomic transactions** (all-or-nothing):

1. **Payment Transaction**: Transfer ALGO from user to contract
   ```
   From: User wallet
   To: Contract account
   Amount: 0.5 ALGO (500,000 microAlgos)
   Fee: 1,000 microAlgos
   ```

2. **App Call Transaction**: Call the `deposit()` method
   ```
   Contract: App ID (755771019)
   Method: deposit(pay)Void
   Arguments: Reference to payment transaction above
   ```

**Why grouped?** If payment fails, the app call won't execute. If app call fails, payment won't go through. All-or-nothing guarantee.

**Smart contract rejects if**:
- Goal already completed (`goal_completed == 1`)
- Caller is not the goal owner
- No payment received

**Code location**: [contracts/app.py (lines 40-60)](contracts/app.py)

---

### **3. withdraw()**

**What it does**: Withdraws all saved funds from the vault

**Who calls it**: Frontend (Withdraw button in GoalDetailsClient)

**On-chain logic**:
```python
# Verify goal is completed OR deadline has passed
assert (goal_completed == 1 OR current_time > deadline), "Funds still locked"

# Verify sender is goal owner
assert Txn.sender() == goal_owner, "Only owner can withdraw"

# Send all funds back to user
send_payment(Txn.sender(), balance)

# Mark as completed so no more deposits possible
goal_completed = 1
balance = 0
```

**Withdrawal requirements**:
- Goal must be 100% complete (total_saved ≥ target_amount), OR
- Current timestamp must be past the deadline

**Why locked until goal complete?**

This is **"discipline-as-a-service"** — the smart contract enforces saving discipline:
- Users can't cheat and withdraw early
- The code (not a person) enforces the rules
- Transparent and immutable

**Code location**: [contracts/app.py (lines 65-85)](contracts/app.py)

---

## 🔄 Complete Deposit Flow (On-Chain)

```
1. User has 2 ALGO in Pera Wallet
   │
2. User initiates deposit(0.5 ALGO)
   │
3. Grouped Transaction Created:
   ├─ Txn #1 (Payment):
   │  ├─ From: User wallet
   │  ├─ To: Contract account (App ID: 755771019)
   │  └─ Amount: 500,000 microAlgos (0.5 ALGO)
   │
   └─ Txn #2 (App Call):
      ├─ Contract: 755771019
      ├─ Method: deposit()
      └─ References: Txn #1
   │
4. User Signs Both Txns with Pera Wallet
   │ (Wallet shows: "2 transactions to sign")
   │
5. Transactions Submitted to Testnet
   │
6. Algorand Network Executes:
   ├─ Validates Txn #1: User has 500,000+ microAlgos + fees
   ├─ Transfers 500,000 μA to contract account
   ├─ Executes Smart Contract (Txn #2):
   │  ├─ Checks: goal_completed == 0 ✓
   │  ├─ Checks: Sender == goal_owner ✓
   │  ├─ Checks: Payment > 0 ✓
   │  └─ Updates: total_saved += 500,000
   │
7. Transaction Finalized (5 seconds)
   │ (All 1000+ nodes agree on same state)
   │
8. UI Updated:
   ├─ Balance: 2.0 → 1.5 ALGO
   ├─ Contract holds: 0 → 0.5 ALGO
   ├─ Progress bar: 0% → 33% (assuming 1.5 ALGO target)
   └─ Deposit History: New row added with TXN ID
```

---

## 💾 State Management

### **On-Chain State** (In Smart Contract)
```
Persisted on Algorand blockchain forever:
├─ goal_owner
├─ target_amount
├─ total_saved        ← Updates with each deposit
├─ deadline
├─ goal_completed     ← Changes from 0 → 1 when goal hit
└─ balance            ← Contract account's ALGO holdings
```

### **Off-Chain State** (In localStorage)
```
Stored in browser (local-store.ts):
├─ id (UUID)
├─ name
├─ appId             ← Links to on-chain contract
├─ owner
├─ createdAt
└─ deposits: [       ← UI-only history
    { amount, timestamp, txId },
    { amount, timestamp, txId }
  ]
```

**Why both?**
- **On-chain**: Source of truth for balance, completion status
- **Off-chain**: Fast UI updates, goal names, display history

---

## 🔐 Security Features

### **1. Caller Verification**

```python
assert Txn.sender() == goal_owner
```
Only the wallet that created the goal can deposit/withdraw.

### **2. Completion Validation**

```python
assert goal_completed == 0  # Can't deposit to completed goals
```
Prevents accidental double-savings.

### **3. Atomic Transactions**

Both payment and contract call succeed together or fail together. Impossible for one to complete without the other.

### **4. Deadline Enforcement**

```python
assert (goal_completed == 1 OR current_time > deadline)
```
Code enforces the lock, not trust.

---

## 📊 Contract Deployment

### **Deployment Process** (blockchain.ts)

```typescript
async function deployGoalContract(
  targetAmount: number,    // ALGO amount
  deadline: number        // Unix timestamp
) {
  // 1. Create app creation transaction
  const txn = algosdk.makeApplicationCreateTxn(
    senderAddr,                          // Your wallet
    OnCompletion.NoOp,                   // OnCompletion type
    approvalProgram,                     // TEAL bytecode
    clearStateProgram,                   // TEAL bytecode
    globalStateSchema,                   // Global state limits
    localStateSchema,                    // Local state limits
    appArgs: [targetAmount, deadline]    // Arguments
  );

  // 2. User signs with Pera Wallet
  const signedTxn = await wallet.signTransaction(txn);

  // 3. Submit to testnet
  const result = await algodClient.sendRawTransaction(signedTxn);

  // 4. Wait for completion
  await algosdk.waitForConfirmation(result.txId);

  // 5. Read appId from blockchain
  return result.appId;
}
```

---

## 🎯 Example: Full Lifecycle

### **Goal: Save 1 ALGO for "New Laptop" by Feb 28, 2026**

**Step 1: Create Goal**
```
User: "New Laptop", 1 ALGO, Deadline: Feb 28, 2026
App Calls: deployGoalContract(1000000, 1746086400)
         ↓
Smart Contract Created (App ID: 755771019)
├─ goal_owner: E6G4XT2SCYZWE2OMI66WYZNPUMPWOFY4UAV6PH3L5CPZFARLSEL7JXC6M4
├─ target_amount: 1000000 microAlgos
├─ deadline: 1746086400 (Unix timestamp)
├─ total_saved: 0
└─ goal_completed: 0
```

**Step 2: First Deposit (0.5 ALGO)**
```
Grouped Txn:
├─ Payment: 500,000 μA → Contract
└─ Call: deposit() method

On-chain state after execution:
├─ total_saved: 500,000 (was 0)
├─ goal_completed: 0 (not yet complete)
└─ balance: 500,000 (contract holds funds)

UI shows:
├─ Progress: 50%
├─ Saved: 0.5 ALGO / 1 ALGO
└─ Achievement: "First Deposit" unlocked
```

**Step 3: Second Deposit (0.5 ALGO)**
```
Grouped Txn:
├─ Payment: 500,000 μA → Contract
└─ Call: deposit() method

On-chain state after execution:
├─ total_saved: 1,000,000 (was 500,000)
├─ goal_completed: 1 (NOW COMPLETE!)
└─ balance: 1,000,000

UI shows:
├─ Progress: 100% ✅
├─ Saved: 1.0 ALGO / 1.0 ALGO
├─ Status: "Completed"
├─ Achievement: "Goal Completed" unlocked
└─ Withdraw button: ENABLED (was disabled)
```

**Step 4: Withdraw Funds**
```
User clicks Withdraw

Grouped Txn:
├─ Call: withdraw() method
└─ Contract sends: 1,000,000 μA → User

On-chain state after execution:
├─ balance: 0
└─ goal_completed: 1

User's wallet:
├─ Receives: 1.0 ALGO
└─ Can never deposit to this goal again
```

---

## 🧠 Learning Outcomes

By understanding this contract, you learn:

1. **Smart Contract Logic**: How to write business rules as code
2. **Atomic Transactions**: All-or-nothing guarantees
3. **State Management**: On-chain vs off-chain
4. **Financial Discipline**: Code-enforced rules are unbreakable
5. **Blockchain UX**: How wallets, signing, and confirmation work
6. **Algorand Specifics**: TEAL, PyTEAL, grouping, state schema

---

## 📋 Contract Code Reference

| Concept | Location | Lines |
|---------|----------|-------|
| State Definition | [contracts/app.py](contracts/app.py) | 1-20 |
| create_goal Method | [contracts/app.py](contracts/app.py) | 25-35 |
| deposit Method | [contracts/app.py](contracts/app.py) | 40-60 |
| withdraw Method | [contracts/app.py](contracts/app.py) | 65-85 |
| Deployment | [src/lib/blockchain.ts](src/lib/blockchain.ts) | 100-150 |
| Deposit Call | [src/lib/blockchain.ts](src/lib/blockchain.ts) | 180-230 |
| Withdraw Call | [src/lib/blockchain.ts](src/lib/blockchain.ts) | 240-290 |

---

## 🔗 Real-World Analogy

Think of the smart contract as a **vending machine**:

- 🏦 **Bank** (traditional): A person decides when to give you money
- 🤖 **Smart Contract** (AlgoSave): Rules are enforced by code
- **You**: Put in 1 ALGO, get your savings locked until you've saved enough

The code is the agreement — completely transparent and immutable.

---

## Where and How Algorand is Used (Process Overview)

1. **User Connects Wallet:**
   - The user connects their Algorand wallet (Pera Wallet) to the app for authentication and signing.

2. **Goal Creation:**
   - When a user creates a savings goal, the app deploys a new smart contract (written in PyTEAL) to the Algorand TestNet. This contract manages the goal’s logic and funds.

3. **Depositing Funds:**
   - When depositing, the app creates and signs Algorand transactions (payment + smart contract call). The deposit is recorded on-chain in the smart contract.

4. **Withdrawing Funds:**
   - When withdrawing, the app sends a transaction to the smart contract, which checks the rules and releases funds if allowed.

5. **Reading State:**
   - The app reads goal status, balances, and history directly from the Algorand blockchain to show the latest info to the user.

**Summary:**
All critical actions—goal creation, deposit, withdrawal, and state checks—are performed on the Algorand blockchain, ensuring security, transparency, and decentralization.
