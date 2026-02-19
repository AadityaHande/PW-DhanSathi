# AlgoSave: Complete Viva & Submission Documentation

## 📋 Executive Summary

**AlgoSave** is a blockchain-based savings goal tracker built on **Algorand Testnet**. It demonstrates how smart contracts can enforce financial discipline by making savings rules immutable and transparent.

**Key Innovation**: Funds are locked by code, not trust. Users cannot withdraw until their goal is complete.

---

## 🎯 Problem Statement

### **The Problem**

Students often struggle with financial discipline:
- Setting savings goals is easy
- Sticking to them is hard
- Temptation to withdraw early always exists
- No transparent way to prove savings history
- Traditional banking apps are not trustless

### **Why This Matters**

1. **Psychological**: "Out of sight, out of mind" — funds in your own wallet are too easy to access
2. **Trust**: Users must trust a bank/app to hold their money
3. **Transparency**: No immutable proof of savings history
4. **International**: Not everyone has access to traditional banking

### **Our Solution**

AlgoSave uses **blockchain smart contracts** to:
- Make savings goals immutable (recorded on blockchain)
- Lock funds using code (not trust)
- Provide transparent history (everyone can verify)
- Enable globally accessible financial tools (just need internet + wallet)

**Tagline**: "Discipline-as-a-Service"

---

## 🏗️ Technical Architecture

### **System Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                      AlgoSave Application                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Frontend (React + Next.js)                 │   │
│  │  ┌────────────────┐  ┌────────────────────────────┐ │   │
│  │  │ Create Goal    │  │ Dashboard + Analytics     │ │   │
│  │  │ Form           │  │ Progress Bars, Charts     │ │   │
│  │  └────────────────┘  │ Achievement Badges        │ │   │
│  │                      └────────────────────────────┘ │   │
│  │         ↓ Pera Wallet Integration ↓                │   │
│  │  ┌────────────────┐  ┌────────────────────────────┐ │   │
│  │  │ Deposit Dialog │  │ Withdraw Function          │ │   │
│  │  │ Amount Input   │  │ Unlock Logic               │ │   │
│  │  └────────────────┘  └────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓ ↑                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       Data Layer (localStorage + Blockchain)         │   │
│  │  Local Storage: Goal metadata, deposit history      │   │
│  │  Blockchain: Source of truth for balance & status   │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓ ↑                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓ ↑
           ┌──────────────────────────────┐
           │   Pera Wallet               │
           │ (User's Signature & Consent)│
           └──────────────────────────────┘
                          ↓ ↑
         ┌───────────────────────────────────┐
         │  Algorand Testnet API             │
         │  https://testnet-api.algonode.com │
         └───────────────────────────────────┘
                          ↓ ↑
         ┌───────────────────────────────────┐
         │   Smart Contract (PyTEAL)         │
         │   App ID: 755771019               │
         │  ├─ Create Goal                   │
         │  ├─ Deposit (with validation)     │
         │  └─ Withdraw (time-locked)        │
         └───────────────────────────────────┘
```

### **Technology Stack**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15.5.9 | Server-side rendering, routing |
| **UI Framework** | React 19 | Component-based UI |
| **Styling** | Tailwind CSS | Responsive design |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Blockchain** | Algorand SDK (algosdk) | Transaction building & signing |
| **Wallet** | Pera Wallet (@perawallet/connect) | User authentication & signing |
| **Smart Contract** | PyTEAL + Beaker | Algorand Testnet deployment |
| **Storage** | localStorage | Goal metadata (fast, client-side) |
| **Charts** | recharts | Visual analytics |
| **PWA** | next-pwa | Install as app (offline support) |

---

## 📱 What Students Will Build

### **1. Goal Creation Interface**

**Features**:
- Text input for goal name (e.g., "New Laptop")
- Number input for target amount in ALGO
- Date picker for deadline
- Form validation (Zod schema)
- Connected wallet required

**Technical Learning**:
- React form handling
- Input validation
- Algorand transaction building
- Smart contract deployment from frontend

**Code Files**:
- [CreateGoalForm.tsx](src/components/goals/CreateGoalForm.tsx)
- [blockchain.ts](src/lib/blockchain.ts) (deployGoalContract function)

---

### **2. Dashboard with Progress Bars**

**Features**:
- Grid layout showing all active goals
- Each goal card displays:
  - Goal name & deadline
  - Progress bar (visual %)
  - Current saved amount / target amount
  - Status badge (Active/Completed)
  - Financial health indicator
  - Quick link to details page

**Technical Learning**:
- Data fetching from blockchain
- State management with React hooks
- Responsive grid layouts
- Real-time data binding

**Code Files**:
- [page.tsx](src/app/page.tsx) (Home page)
- [GoalCard.tsx](src/components/goals/GoalCard.tsx)
- [local-store.ts](src/lib/local-store.ts) (getData functions)

---

### **3. Deposit Functionality (On-Chain Recording)**

**Features**:
- Modal dialog for deposit amount
- Text input with validation (> 0)
- Grouped transaction (payment + contract call)
- Real-time balance update after confirmation
- Deposit history table showing all deposits

**Technical Learning**:
- Grouped transactions (atomic all-or-nothing)
- Smart contract method calls
- Transaction signing with wallet
- Waiting for confirmation
- Handling blockchain latency

**Code Files**:
- [DepositDialog.tsx](src/components/goals/DepositDialog.tsx)
- [blockchain.ts](src/lib/blockchain.ts) (depositToGoal function)
- [contracts/app.py](contracts/app.py) (deposit method)

---

### **4. Visual Analytics (Savings Over Time)**

**Features**:
- Line chart showing cumulative savings
- X-axis: Dates of deposits
- Y-axis: Total ALGO saved
- Tooltip on hover showing exact amounts
- Responsive to screen size

**Technical Learning**:
- React charting libraries (recharts)
- Data transformation (deposit array → chart data)
- Date formatting and localization
- Responsive charts with ResizeObserver

**Code Files**:
- [SavingsChart.tsx](src/components/goals/SavingsChart.tsx)
- [GoalDetailsClient.tsx](src/components/goals/GoalDetailsClient.tsx) (integrates chart)

---

### **5. Achievement Badges**

**Features**:
- Badges unlock when milestones reached:
  - "First Deposit" — on first deposit
  - "50% Saver" — when 50% of goal reached
  - "Goal Completed" — when 100% reached
- AI Coach appears and gives congratulations message
- Badges displayed with icons and colors

**Technical Learning**:
- Conditional rendering
- State-based UI updates
- Genkit AI integration (optional)
- Badge design with Tailwind CSS

**Code Files**:
- [GoalDetailsClient.tsx](src/components/goals/GoalDetailsClient.tsx) (getAchievements function)
- [src/ai/flows/](src/ai/flows/) (AI coach prompts)

---

## 🔄 Feature-by-Feature Implementation

### **Feature 1: Goal Creation**

**User Flow**:
```
1. Click "Create New Goal"
2. Fill form (name, amount, deadline)
3. Click "Create Goal"
4. Wallet signs transaction
5. Smart contract deployed
6. Goal saved to localStorage + blockchain
7. Redirected to dashboard
```

**In Code**:
```typescript
// CreateGoalForm.tsx
const handleSubmit = async (data: CreateGoalFormData) => {
  // 1. Deploy contract
  const appId = await deployGoalContract(
    data.targetAmount,
    deadlineTimestamp
  );
  
  // 2. Save goal to localStorage
  saveGoal({
    id: generateId(),
    name: data.name,
    appId,
    targetAmount: data.targetAmount,
    deadline: deadlineTimestamp,
    deposits: [],
    createdAt: Date.now()
  });
  
  // 3. Redirect
  router.push(`/goals/${goalId}`);
};
```

**Blockchain Side**:
- Function: `deployGoalContract(targetAmount, deadline)`
- Builds `ApplicationCreateTxn`
- User signs with Pera Wallet
- Returns `appId` (smart contract ID)
- Contract state initialized with goal parameters

---

### **Feature 2: Dashboard Display**

**User Flow**:
```
1. Visit home page
2. Page loads all goals from localStorage
3. For each goal, fetch on-chain state
4. Render GoalCard for each goal
5. Show progress bars, amounts, status
```

**In Code**:
```typescript
// page.tsx
const loadGoals = async () => {
  // 1. Get goals from localStorage
  const storedGoals = getAllGoals();
  
  // 2. Fetch on-chain state for each
  const goalsWithOnChain = await Promise.all(
    storedGoals.map(async (goal) => {
      const onChain = await getGoalOnChainState(goal.appId);
      return { ...goal, onChain };
    })
  );
  
  // 3. Set state and render
  setGoals(goalsWithOnChain);
};
```

**Blockchain Side**:
- Function: `getGoalOnChainState(appId)`
- Calls Algorand API: `algodClient.getApplicationByID(appId)`
- Reads global state from smart contract
- Returns: `{ totalSaved, targetAmount, goalCompleted, deadline }`

---

### **Feature 3: Deposit On-Chain**

**User Flow**:
```
1. Click "Deposit" button on goal
2. Enter amount (e.g., 0.5 ALGO)
3. Click "Deposit"
4. Pera Wallet shows 2 transactions to sign
5. User signs both
6. Wait for confirmation (~5 seconds)
7. Balance updates, deposit added to history
```

**In Code**:
```typescript
// DepositDialog.tsx
const handleDeposit = async (amount: number) => {
  // 1. Call blockchain function
  const txId = await depositToGoal(goalAppId, amount);
  
  // 2. Update localStorage
  addDepositToGoal(goalId, {
    amount,
    txId,
    timestamp: Date.now()
  });
  
  // 3. Refetch on-chain state
  const onChainData = await getGoalOnChainState(goalAppId);
  setOnChainGoal(onChainData);
  
  // 4. Close dialog, show toast
  setOpen(false);
  toast({ title: "Deposit successful!" });
};
```

**Blockchain Side**:
```typescript
// blockchain.ts - depositToGoal function
const depositToGoal = async (appId: number, amount: number) => {
  // Step 1: Build payment transaction
  const paymentTxn = algosdk.makePaymentTxn({
    from: senderAddress,
    to: appAddress,
    amount: algosToMicroalgos(amount),
    ...
  });
  
  // Step 2: Build app call transaction
  const appCallTxn = algosdk.makeApplicationCallTxn({
    appIndex: appId,
    appArgs: [new Uint8Array([1])],  // deposit method
    foreignAssets: [paymentTxn.index()],
    ...
  });
  
  // Step 3: Group them
  const grouped = algosdk.assignGroupID([paymentTxn, appCallTxn]);
  
  // Step 4: User signs with wallet
  const signedTxns = await wallet.signTransaction(grouped);
  
  // Step 5: Submit to network
  const txId = await algodClient.sendRawTransaction(signedTxns);
  
  // Step 6: Wait for confirmation
  await algosdk.waitForConfirmation(txId);
  
  return txId;
};
```

**Smart Contract Side** (contracts/app.py):
```python
def deposit(payment: Txn):
    # Verify goal not completed
    assert local.goal_completed == 0, "Goal completed"
    
    # Verify payment received
    assert payment.amount > 0, "No payment"
    
    # Verify sender is owner
    assert Txn.sender() == local.goal_owner, "Not owner"
    
    # Update state
    local.total_saved += payment.amount
    local.balance += payment.amount
    
    # Check if goal now complete
    if local.total_saved >= local.target_amount:
        local.goal_completed = 1
```

---

### **Feature 4: Visual Analytics**

**User Flow**:
```
1. User views goal details page
2. Page loads all deposits from localStorage
3. Calculates cumulative savings over time
4. Renders line chart
5. User hovers over points to see values
```

**In Code**:
```typescript
// SavingsChart.tsx
const chartData = useMemo(() => {
  if (!goal.deposits) return [];
  
  // Transform deposits into chart points
  let cumulative = 0;
  const points = goal.deposits
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(deposit => {
      cumulative += deposit.amount;
      return {
        date: formatDate(deposit.timestamp),
        savings: cumulative
      };
    });
  
  return points;
}, [goal.deposits]);

// Render with recharts LineChart
return <LineChart data={chartData}>...
```

---

### **Feature 5: Achievement Badges**

**User Flow**:
```
1. Page loads goal details
2. Calculates achievements based on:
   - Has any deposits? → "First Deposit"
   - Saved ≥ 50% of target? → "50% Saver"
   - Goal completed (100%)? → "Goal Completed"
3. Displays badges with icons
4. AI Coach appears for completed goals
```

**In Code**:
```typescript
// GoalDetailsClient.tsx
const getAchievements = (onchainData: OnChainGoal) => {
  const ach: string[] = [];
  
  if (goal.deposits?.length > 0) {
    ach.push("First Deposit");
  }
  
  const percentComplete = 
    (onchainData.totalSaved / onchainData.targetAmount) * 100;
  
  if (percentComplete >= 50) {
    ach.push("50% Saver");
  }
  
  if (onchainData.goalCompleted) {
    ach.push("Goal Completed");
  }
  
  return ach;
};

// Render badges
{achievements.map(ach => (
  <Badge key={ach} variant="secondary">
    <Award className="mr-2 h-4 w-4" />
    {ach}
  </Badge>
))}
```

---

## 🧠 Learning Outcomes

After building AlgoSave, students understand:

### **Blockchain Fundamentals**
- How transactions work (immutability, finality)
- Smart contracts as self-executing code
- The difference between on-chain and off-chain state
- Why decentralization matters

### **Algorand Specifics**
- Creating applications with PyTEAL
- Grouped transactions and atomic execution
- State schemas (global vs local)
- Transaction types (payment, app call)
- Algorand Standard Assets (optional advanced)

### **Smart Contract Security**
- Input validation
- Access control (only owner can withdraw)
- Time-locked logic (deadline enforcement)
- Reentrant attacks and prevention

### **Full-Stack Development**
- Frontend-blockchain integration
- Wallet connection and signing
- Handling async blockchain operations
- Real-time UI updates from blockchain state
- Progressive Web Apps (PWA)

### **Financial Concepts**
- Savings discipline technology
- Immutable financial records
- Transparent asset transfers
- Time-value of money

---

## 💰 Real-World Applications

### **1. Student Loans & Repayment**
Use AlgoSave logic to enforce loan repayment schedules. Funds unlock only when milestones are met.

### **2. Micro-Savings Programs**
In developing nations, time-locked savings enforce discipline for families with limited financial infrastructure.

### **3. Charitable Giving**
Organizations can lock funds until a cause is achieved, ensuring donors' money reaches intended goals.

### **4. Team Project Funds**
Hackathon teams can pool money with smart contract enforcement — funds locked until project completion.

### **5. Pay-to-Earn Gamification**
Games reward players with locked cryptocurrency, teaching financial literacy through play.

---

## 📊 Technical Specifications

### **Smart Contract Specifications**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Language | PyTEAL | Compiles to TEAL bytecode |
| Network | Algorand Testnet | No real money required |
| App ID | 755771019 | Deployed contract ID |
| Methods | 3 | create_goal, deposit, withdraw |
| Global State | 5 keys | owner, target, saved, deadline, completed |
| Approval Program | TEAL bytecode | ~1KB compiled |
| Transaction Cost | ~1,000 μA | Per create_goal |
| Deposit Cost | ~2,000 μA | Grouped txn fees |

### **Frontend Specifications**

| Component | Status |
|-----------|--------|
| UI Framework | Next.js 15.5.9 (React 19) |
| Styling | Tailwind CSS 3.4 |
| State Management | React Hooks + localStorage |
| Forms | React Hook Form + Zod |
| Charts | recharts 2.15 |
| PWA | next-pwa 5.6 |
| Build Tool | Turbopack (Next.js native) |
| Port | 9002 |

### **Blockchain Specifications**

| Parameter | Value |
|-----------|-------|
| Blockchain | Algorand Testnet |
| Chain ID | 416002 |
| Node API | https://testnet-api.algonode.cloud |
| SDK | algosdk 2.8.0 |
| Wallet | Pera Wallet |
| Finality | ~5 seconds |
| Fee Rate | ~0.001 ALGO per transaction |

---

## 🚀 Deployment Instructions

### **Local Development**
```bash
npm install
npm run dev  # Runs on http://localhost:9002
```

### **Production Build**
```bash
npm run build
npm start
```

### **Smart Contract Compilation**
```bash
cd contracts
python compile.py  # Generates TEAL bytecode
```

---

## 📁 Project Structure

```
PW-DhanSathi/
├── contracts/              # Smart contract code
│   ├── app.py             # PyTEAL smart contract
│   ├── approval.teal      # Compiled TEAL
│   ├── compile.py         # Compilation script
│   └── requirements.txt    # Python dependencies
├── src/
│   ├── app/               # Next.js pages
│   │   ├── page.tsx       # Dashboard
│   │   ├── goals/
│   │   │   ├── new/       # Create goal page
│   │   │   └── [id]/      # Goal details page
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── goals/         # Goal-related components
│   │   ├── layout/        # Header, layout
│   │   ├── pwa/           # PWA components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities
│   │   ├── blockchain.ts  # Algorand SDK wrapper
│   │   ├── local-store.ts # localStorage management
│   │   └── types.ts       # TypeScript definitions
│   └── ai/                # Genkit AI flows
├── public/                # Static assets
│   ├── manifest.json      # PWA manifest
│   ├── icons/             # App icons
│   └── sw.js              # Service worker (generated)
├── docs/                  # Documentation
└── README.md              # Project overview
```

---

## 🎓 Use Cases for Learning

### **Computer Science Students**
- Distributed systems (blockchain consensus)
- Cryptography (signatures, hashing)
- State machines (smart contract logic)

### **Business Students**
- Fintech innovations
- Blockchain use cases
- Financial discipline technology

### **Hackathon Participants**
- Complete Algorand project
- Deployable in 24 hours
- Standalone and impressive

### **Dev Bootcamp Graduates**
- Full-stack project
- Blockchain integration
- PWA deployment

---

## 📝 Viva Questions & Answers

### **Q1: Why use blockchain instead of a traditional database?**

**A**: 
- **Trustlessness**: No central authority can change rules
- **Immutability**: Withdrawal rules enforced by code, not people
- **Transparency**: Anyone can verify on-chain state
- **Global Access**: No bank needed, just internet
- **Teaching Value**: Demonstrates real-world blockchain use

### **Q2: What if the user loses their wallet private key?**

**A**: 
- Using Pera Wallet (non-custodial) — user holds their own key
- If lost, funds in smart contract are locked permanently
- This demonstrates importance of key management
- Custodial wallets could be used for UX improvement

### **Q3: Why use both localStorage and blockchain?**

**A**:
- **localStorage**: Fast local access, goal names, metadata
- **Blockchain**: Source of truth, immutable records, can't cheat
- Fetching full blockchain history for every page load is slow
- This hybrid approach is used in production apps (Ethereum too)

### **Q4: How is the smart contract secured?**

**A**:
- **Caller Verification**: Only goal owner can deposit/withdraw
- **Validation**: Checks goal not completed before deposit
- **Atomic Transactions**: All-or-nothing execution
- **Deadline Enforcement**: Code checks timestamp
- **No Private Keys**: Uses Pera Wallet's non-custodial model

### **Q5: What's a grouped transaction?**

**A**:
A grouped transaction is 2+ transactions that must all succeed or all fail together.

Example:
```
Txn 1: User sends 0.5 ALGO to contract
Txn 2: Contract calls deposit() method

If either fails → both are rolled back
This prevents "funds sent but deposit not recorded" scenarios
```

### **Q6: How do users get Testnet ALGO?**

**A**:
- Visit https://testnet.algoexplorer.io
- Enter wallet address
- Faucet automatically sends 10 ALGO
- Zero real-world cost

### **Q7: Is this a real product?**

**A**:
- **MVP Status**: Fully functional proof of concept
- **For Production**: Would need:
  - Mainnet deployment (real ALGO)
  - User authentication system
  - Database for user info
  - Mobile app optimization
  - Regulatory compliance

### **Q8: How are achievements calculated?**

**A**:
```
- "First Deposit": Check if deposits array has length > 0
- "50% Saver": (totalSaved / targetAmount) >= 0.5
- "Goal Completed": goal_completed == 1 (from smart contract state)
```

---

## 🎥 Demo Flow

1. **Create Goal**: "Save 1 ALGO for New Laptop by Feb 28"
2. **First Deposit**: Add 0.5 ALGO → Progress shows 50%
3. **Second Deposit**: Add 0.5 ALGO → Progress reaches 100%
4. **Unlock Achievement**: Badge appears, withdrawal enabled
5. **Withdraw**: Click withdraw → 1 ALGO sent back to wallet

**Time**: ~30 seconds end-to-end (with network latency)

---

## ✅ Submission Checklist

- [x] Frontend (React + Next.js)
- [x] Smart Contract (PyTEAL/Beaker)
- [x] Wallet Integration (Pera Wallet)
- [x] Grouped Transactions
- [x] On-Chain State Reading
- [x] Goal Creation
- [x] Deposit Functionality
- [x] Visual Analytics
- [x] Achievement Badges
- [x] PWA Support
- [x] localStorage Persistence
- [x] Complete Documentation

---

## 🙏 Acknowledgments

- **Algorand** — Blockchain platform & grants
- **Pera Wallet** — Wallet integration
- **Genkit** — AI coach feature
- **shadcn/ui** — Component library
- **Next.js Team** — Framework & tooling

---

## 📚 Further Reading

- [Algorand Developer Docs](https://developer.algorand.org)
- [PyTEAL Documentation](https://pyteal.readthedocs.io)
- [Pera Wallet Docs](https://perawallet.app)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Built with ❤️ for blockchain education & financial inclusion**
