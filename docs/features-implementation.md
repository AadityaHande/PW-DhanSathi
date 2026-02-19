# AlgoSave: Features & Implementation Guide

Complete breakdown of each feature with code examples and flow diagrams.

---

## 📋 Table of Contents

1. [Feature 1: Goal Creation Interface](#feature-1-goal-creation-interface)
2. [Feature 2: Dashboard with Progress Bars](#feature-2-dashboard-with-progress-bars)
3. [Feature 3: Deposit On-Chain Functionality](#feature-3-deposit-on-chain-functionality)
4. [Feature 4: Visual Analytics](#feature-4-visual-analytics)
5. [Feature 5: Achievement Badges](#feature-5-achievement-badges)
6. [PWA Install Prompt](#pwa-install-prompt)
7. [Wallet Connection](#wallet-connection)

---

## **Feature 1: Goal Creation Interface**

### 📝 What It Does

Users can create a new savings goal by entering:
- Goal name (text input)
- Target amount in ALGO (number input)
- Deadline (date picker)

The app then **deploys a smart contract** to the Algorand blockchain for that specific goal.

### 🎨 User Interface

**File**: [src/app/goals/new/page.tsx](src/app/goals/new/page.tsx)

```tsx
export default function CreateGoalPage() {
  return (
    <div className="container max-w-2xl">
      <CreateGoalForm />
    </div>
  );
}
```

**Component**: [src/components/goals/CreateGoalForm.tsx](src/components/goals/CreateGoalForm.tsx)

```tsx
export default function CreateGoalForm() {
  const { activeAddress } = useWallet();
  const form = useForm<CreateGoalFormData>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      deadline: undefined,
    },
  });

  const handleSubmit = async (data: CreateGoalFormData) => {
    try {
      setIsSubmitting(true);

      // Step 1: Convert deadline to Unix timestamp
      const deadlineTimestamp = Math.floor(
        data.deadline.getTime() / 1000
      );

      // Step 2: Deploy smart contract to blockchain
      const appId = await deployGoalContract(
        algosToMicroalgos(parseFloat(data.targetAmount)),
        deadlineTimestamp
      );

      // Step 3: Save goal to localStorage
      const goalId = generateId();
      saveGoal({
        id: goalId,
        name: data.name,
        appId, // Link to blockchain contract
        targetAmount: parseFloat(data.targetAmount),
        deadline: deadlineTimestamp,
        deposits: [],
        createdAt: Date.now(),
      });

      // Step 4: Navigate to goal details page
      router.push(`/goals/${goalId}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to create goal" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Goal Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., New Laptop" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Target Amount Field */}
        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Amount (ALGO)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="1.5" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Deadline Field */}
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || !activeAddress}>
          {isSubmitting ? "Creating Goal..." : "Create Goal"}
        </Button>
      </form>
    </Form>
  );
}
```

### 🔗 Blockchain Integration

**Function**: [src/lib/blockchain.ts - deployGoalContract](src/lib/blockchain.ts)

```typescript
async function deployGoalContract(
  targetAmount: bigint,
  deadline: number
): Promise<number> {
  const sender = activeAddress; // User's wallet address

  // Step 1: Prepare app creation transaction
  const createAppTxn = algosdk.makeApplicationCreateTxn(
    sender,
    OnCompletion.NoOp,
    approvalProgram, // Compiled TEAL bytecode
    clearStateProgram, // Compiled TEAL bytecode
    {
      numGlobalByteSlices: 1,
      numGlobalUints: 5,
    },
    {
      numLocalByteSlices: 0,
      numLocalUints: 5,
    },
    [
      new Uint8Array(Buffer.from(targetAmount.toString())),
      new Uint8Array(Buffer.from(deadline.toString())),
    ],
    [],
    [],
    [],
    sugar.OnCompletion.NoOp,
    undefined,
    undefined,
    1000 // Minimum fee
  );

  // Step 2: User signs transaction with Pera Wallet
  const signedTxns = await wallet.signTransaction([createAppTxn]);

  // Step 3: Submit to Algorand testnet
  const txId = await algodClient.sendRawTransaction(signedTxns[0]).do();

  // Step 4: Wait for confirmation (~5 seconds)
  const confirmResponse = await algosdk.waitForConfirmation(
    algodClient,
    txId,
    1000
  );

  // Step 5: Extract and return appId
  const appId = confirmResponse["application-index"];
  return appId;
}
```

### 💾 Local Storage

**Function**: [src/lib/local-store.ts - saveGoal](src/lib/local-store.ts)

```typescript
export function saveGoal(goal: Goal): void {
  const goals = getAllGoals();
  goals.push(goal);
  localStorage.setItem("algosave_goals", JSON.stringify(goals));
}

interface Goal {
  id: string; // UUID
  name: string; // "New Laptop"
  appId: number; // 755771019 (blockchain contract ID)
  targetAmount: number; // 1.5 (ALGO)
  deadline: number; // Unix timestamp
  deposits: Deposit[]; // Empty on creation
  createdAt: number; // Timestamp
}

interface Deposit {
  amount: number; // ALGO
  timestamp: number; // Unix timestamp
  txId: string; // Blockchain transaction ID
}
```

### 🔄 Flow Diagram

```
User fills form
    ↓
Form validation (Zod schema)
    ├─ name: non-empty string
    ├─ targetAmount: positive number
    └─ deadline: future date
    ↓
deployGoalContract() called
    ├─ Step 1: Build ApplicationCreateTxn
    ├─ Step 2: User signs with Pera Wallet
    ├─ Step 3: Submit to testnet
    ├─ Step 4: Wait for confirmation (~5s)
    └─ Step 5: Get appId from response
    ↓
saveGoal() stores in localStorage
    └─ Goal object with appId
    ↓
Redirect to /goals/[appId]
    └─ Goal created!
```

---

## **Feature 2: Dashboard with Progress Bars**

### 📝 What It Does

The dashboard displays all goals with:
- Goal name and deadline
- Progress bar (visual representation)
- Current saved / target amount
- Status badge (Active/Completed)
- Financial health score

### 🎨 User Interface

**File**: [src/app/page.tsx](src/app/page.tsx)

```tsx
"use client";

export default function Home() {
  const [goals, setGoals] = useState<GoalWithOnChainData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeAddress } = useWallet();

  // Load goals on component mount
  const loadGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      // Step 1: Get all goals from localStorage
      const storedGoals = getAllGoals();

      // Step 2: For each goal, fetch on-chain state
      const goalsWithOnChain = await Promise.all(
        storedGoals.map(async (goal) => {
          try {
            // Fetch current state from smart contract
            const onChain = await getGoalOnChainState(goal.appId);
            return { ...goal, onChain };
          } catch (error) {
            // If contract not found, use default state
            return {
              ...goal,
              onChain: {
                goalOwner: "",
                targetAmount: 0,
                totalSaved: 0,
                deadline: 0,
                goalCompleted: false,
                balance: 0,
              },
            };
          }
        })
      );

      // Step 3: Update state and render
      setGoals(goalsWithOnChain);
    } catch (err) {
      console.error("Error loading goals:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch goals on mount
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 rounded-xl bg-card p-8">
        <h1 className="text-5xl font-bold">Welcome to AlgoSave</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your personal piggy bank on the blockchain
        </p>

        {/* Wallet & Create Goal Buttons */}
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg">
            <Link href="/goals/new">Create New Goal</Link>
          </Button>
          {activeAddress ? (
            <Button onClick={disconnectWallet} variant="outline">
              {activeAddress.substring(0, 6)}...
            </Button>
          ) : (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          )}
        </div>
      </section>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p>No goals yet. Create your first goal!</p>
        </div>
      )}
    </div>
  );
}
```

### 🎴 Goal Card Component

**File**: [src/components/goals/GoalCard.tsx](src/components/goals/GoalCard.tsx)

```tsx
export default function GoalCard({ goal }: GoalCardProps) {
  const { onChain } = goal;

  // Convert microAlgos to ALGO
  const targetAmount = microAlgosToAlgos(onChain.targetAmount);
  const currentSaved = microAlgosToAlgos(onChain.totalSaved);

  // Calculate progress percentage
  const progress =
    targetAmount > 0 ? (currentSaved / targetAmount) * 100 : 0;

  // Determine status
  const status = onChain.goalCompleted ? "completed" : "active";

  const { score } = calculateFinancialHealth(goal);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{goal.name}</CardTitle>
          <Badge variant={status === "completed" ? "default" : "secondary"}>
            {status === "completed" ? <CheckCircle2 /> : null}
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Savings Info */}
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Saved</p>
              <p className="text-lg font-semibold">₳{currentSaved}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-lg font-semibold">₳{targetAmount}</p>
            </div>
          </div>
        </div>

        {/* Deadline */}
        <p className="text-sm text-muted-foreground">
          Deadline: {formatDate(onChain.deadline)}
        </p>

        {/* Financial Health Indicator */}
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Health:</p>
          <FinancialHealthIndicator score={score} />
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href={`/goals/${goal.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 🔗 Fetching On-Chain State

**Function**: [src/lib/blockchain.ts - getGoalOnChainState](src/lib/blockchain.ts)

```typescript
async function getGoalOnChainState(appId: number): Promise<OnChainGoal> {
  // Query Algorand blockchain for app state
  const app = await algodClient.getApplicationByID(appId).do();

  const globalState = app.params["global-state"];

  // Parse state values
  const stateMap: Record<string, any> = {};
  for (const item of globalState || []) {
    const key = Buffer.from(item.key, "base64").toString("utf-8");
    const value = item.value;

    if (value.type === 1) {
      // Bytes
      stateMap[key] = Buffer.from(value.bytes, "base64").toString();
    } else if (value.type === 2) {
      // Uint
      stateMap[key] = value.uint;
    }
  }

  return {
    goalOwner: stateMap["goal_owner"],
    targetAmount: BigInt(stateMap["target_amount"]),
    totalSaved: BigInt(stateMap["total_saved"]),
    deadline: stateMap["deadline"],
    goalCompleted: stateMap["goal_completed"] === 1,
    balance: app.amount, // Account balance
  };
}

interface OnChainGoal {
  goalOwner: string;
  targetAmount: bigint;
  totalSaved: bigint;
  deadline: number;
  goalCompleted: boolean;
  balance: number;
}
```

### 🔄 Progress Calculation

```typescript
const progress =
  (currentSaved / targetAmount) * 100;

// Examples:
// totalSaved: 0.5, target: 1.0 → progress = 50%
// totalSaved: 0.75, target: 1.0 → progress = 75%
// totalSaved: 1.0, target: 1.0 → progress = 100%
```

### 📊 Flow Diagram

```
Home page loads
    ↓
useEffect → loadGoals()
    ↓
getAllGoals() from localStorage
    ├─ Returns: [Goal1, Goal2, Goal3]
    ↓
For each goal, getGoalOnChainState(appId)
    ├─ Query Algorand API
    ├─ Parse global state
    └─ Return { totalSaved, targetAmount, ... }
    ↓
Merge: Goal + OnChainData = GoalWithOnChainData
    ↓
render GoalCard for each
    ├─ Calculate: progress = (saved/target)*100
    ├─ Render: Progress bar at progress%
    └─ Display: Status badge
```

---

## **Feature 3: Deposit On-Chain Functionality**

### 📝 What It Does

Users can deposit ALGO into a goal. The deposit:
1. Transfers ALGO from user wallet to smart contract
2. Updates smart contract state (total_saved++)
3. Records the transaction ID
4. Updates UI in real-time

### 🎨 User Interface

**File**: [src/components/goals/DepositDialog.tsx](src/components/goals/DepositDialog.tsx)

```tsx
export function DepositDialog({
  goalId,
  goalName,
  appId,
  onDepositSuccess,
}: DepositDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeAddress } = useWallet();
  const { toast } = useToast();

  const form = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "" as unknown as number,
    },
  });

  const handleSubmit = async (data: DepositFormData) => {
    try {
      setIsSubmitting(true);

      // Step 1: Call blockchain to make deposit
      const txId = await depositToGoal(appId, data.amount);

      // Step 2: Update localStorage with deposit record
      addDepositToGoal(goalId, {
        amount: data.amount,
        txId,
        timestamp: Date.now(),
      });

      // Step 3: Callback to refresh on-chain data
      if (onDepositSuccess) {
        await onDepositSuccess();
      }

      // Step 4: Show success message
      setOpen(false);
      form.reset();
      toast({
        title: "Deposit successful!",
        description: `${data.amount} ALGO added to ${goalName}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deposit failed",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Deposit</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit to {goalName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (ALGO)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !activeAddress}
            >
              {isSubmitting ? "Depositing..." : "Deposit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 🔗 Blockchain Integration: Grouped Transactions

**Function**: [src/lib/blockchain.ts - depositToGoal](src/lib/blockchain.ts)

```typescript
async function depositToGoal(
  appId: number,
  amountAlgo: number
): Promise<string> {
  const sender = activeAddress;
  const appAddress = algosdk.getApplicationAddress(appId);

  // Convert ALGO to microAlgos
  const amountMicroAlgos = algosToMicroalgos(amountAlgo);

  // ═══════════════════════════════════════════
  // STEP 1: Build Payment Transaction
  // ═══════════════════════════════════════════
  const paymentTxn = algosdk.makePaymentTxn(
    sender, // From user wallet
    appAddress, // To smart contract account
    1000, // Fee (microAlgos)
    amountMicroAlgos, // Amount (microAlgos)
    undefined,
    (await algodClient.getTransactionParams().do()).lastRound + 1000
  );

  // ═══════════════════════════════════════════
  // STEP 2: Build App Call Transaction
  // ═══════════════════════════════════════════
  const appCallTxn = algosdk.makeApplicationCallTxn(
    sender, // Who's calling
    appId, // Which app
    OnCompletion.NoOp, // Don't close out
    [], // No app args for deposit
    [paymentTxn.txID()], // Reference the payment above
    [], // No foreign apps
    [], // No foreign assets
    undefined,
    Buffer.from("deposit"), // Method name
    1000, // Fee
    (await algodClient.getTransactionParams().do()).lastRound + 1000
  );

  // ═══════════════════════════════════════════
  // STEP 3: Group Transactions (atomic)
  // ═══════════════════════════════════════════
  const transactions = [paymentTxn, appCallTxn];
  const grouped = algosdk.assignGroupID(transactions);

  // ═══════════════════════════════════════════
  // STEP 4: User Signs Both Transactions
  // ═══════════════════════════════════════════
  // Pera Wallet will show: "2 transactions to sign"
  const signedTxns = await wallet.signTransaction(grouped);

  // ═══════════════════════════════════════════
  // STEP 5: Submit to Network
  // ═══════════════════════════════════════════
  const txId = await algodClient.sendRawTransaction(signedTxns[0]).do();

  // ═══════════════════════════════════════════
  // STEP 6: Wait for Confirmation (~5 seconds)
  // ═══════════════════════════════════════════
  await algosdk.waitForConfirmation(algodClient, txId, 1000);

  return txId;
}
```

### 📋 Grouped Transaction Explanation

A **grouped transaction** is like a bundle:

```
┌─────────────────────────────────┐
│  GroupID: "ABC123"              │
│  ┌──────────────────────────┐   │
│  │ Transaction 1: Payment   │   │
│  │ From: User Wallet        │   │
│  │ To: Contract Account     │   │
│  │ Amount: 0.5 ALGO         │   │
│  │ GroupID: ABC123          │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ Transaction 2: App Call  │   │
│  │ Contract: 755771019      │   │
│  │ Method: "deposit"        │   │
│  │ References: Txn 1        │   │
│  │ GroupID: ABC123          │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

**Why Grouped?**
- Both succeed together (all-or-nothing)
- If Txn1 fails → Txn2 never executes
- If Txn2 fails → Txn1 is rolled back
- Impossible for funds to be sent without updating contract state

### ⛓️ Smart Contract Validation

**File**: [contracts/app.py](contracts/app.py)

When Txn2 executes, the smart contract validates:

```python
def deposit(payment: Txn):
    # ✓ Verify goal not completed
    assert local.goal_completed == 0, "Goal is already completed"

    # ✓ Verify payment was received
    assert payment.amount > 0, "No payment received"

    # ✓ Verify sender is goal owner
    assert Txn.sender() == local.goal_owner, "Only owner can deposit"

    # ✓ If all checks pass, update state
    local.total_saved += payment.amount
    local.balance += payment.amount

    # ✓ Check if goal now complete
    if local.total_saved >= local.target_amount:
        local.goal_completed = 1  # Goal reached!
```

### 💾 Local Storage Update

**Function**: [src/lib/local-store.ts - addDepositToGoal](src/lib/local-store.ts)

```typescript
export function addDepositToGoal(
  goalId: string,
  deposit: Deposit
): void {
  const goals = getAllGoals();
  const goal = goals.find((g) => g.id === goalId);

  if (!goal) {
    throw new Error(`Goal ${goalId} not found`);
  }

  // Add deposit to goal's deposit array
  goal.deposits.push(deposit);

  // Save back to localStorage
  localStorage.setItem("algosave_goals", JSON.stringify(goals));
}
```

### 🔄 Complete Deposit Flow

```
User enters 0.5 ALGO and clicks "Deposit"
    ↓
depositToGoal(appId, 0.5) called
    ↓
Step 1: Build Payment Transaction
    └─ From: User wallet
    └─ To: Contract account
    └─ Amount: 500,000 microAlgos
    ↓
Step 2: Build App Call Transaction
    └─ Method: "deposit"
    └─ References Payment transaction
    ↓
Step 3: Group both transactions
    └─ AssignGroupID
    ↓
Step 4: User signs with Pera Wallet
    └─ Shows: "2 transactions to sign"
    └─ Creates cryptographic signatures
    ↓
Step 5: Submit to Algorand network
    └─ Both transactions broadcast together
    ↓
Algorand Network Processes:
    ├─ Validates Txn1: User has funds + fees
    ├─ Transfers 500,000 μA to contract
    ├─ Executes Smart Contract (Txn2):
    │  ├─ Checks: goal_completed == 0 ✓
    │  ├─ Checks: sender == owner ✓
    │  ├─ Updates: total_saved += 500,000
    │  └─ Checks: if total_saved ≥ target → complete goal
    └─ Both finalized atomically
    ↓
Step 6: Wait for confirmation (~5 seconds)
    ↓
Transaction confirmed, TXN ID returned
    ↓
addDepositToGoal() updates localStorage
    └─ Adds { amount, txId, timestamp }
    ↓
onDepositSuccess() refreshes on-chain data
    ├─ getGoalOnChainState() called
    └─ contract balance now reflects deposit
    ↓
UI updates immediately
    ├─ Progress bar increases
    ├─ Saved amount updates
    ├─ Deposit history table adds row
    └─ Toast: "Deposit successful!"
```

---

## **Feature 4: Visual Analytics**

### 📝 What It Does

Shows a line chart of cumulative savings over time. Users can hover to see exact amounts.

### 🎨 User Interface

**File**: [src/components/goals/SavingsChart.tsx](src/components/goals/SavingsChart.tsx)

```tsx
export function SavingsChart({ goal }: SavingsChartProps) {
  // Transform deposits into chart data points
  const chartData = React.useMemo(() => {
    if (!goal || !goal.deposits || goal.deposits.length === 0) {
      return [];
    }

    // Sort deposits by timestamp
    let cumulativeSavings = 0;
    const dataPoints = goal.deposits
      .map((deposit) => ({
        ...deposit,
        timestamp: toDate(deposit.timestamp),
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      // Transform to cumulative
      .map((deposit) => {
        cumulativeSavings += deposit.amount;
        return {
          date: deposit.timestamp.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          savings: cumulativeSavings,
        };
      });

    // Add starting point
    const createdAtDate = toDate(goal.createdAt);
    const startPoint = {
      date: createdAtDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      savings: 0,
    };

    // Remove duplicates (by date), keep latest
    const uniqueDataPoints = Array.from(
      new Map(
        [[startPoint], ...dataPoints].map((item) => [item.date, item])
      ).values()
    );

    return uniqueDataPoints;
  }, [goal]);

  // Show message if not enough data
  if (chartData.length < 2) {
    return (
      <div className="flex h-[250px] items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">
          Not enough data to display chart. Make a deposit!
        </p>
      </div>
    );
  }

  // Render chart with recharts
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        {/* Grid background */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        {/* X-axis: Dates */}
        <XAxis dataKey="date" tickLine={false} fontSize={12} />

        {/* Y-axis: ALGO amounts */}
        <YAxis
          tickLine={false}
          fontSize={12}
          tickFormatter={(value) => `A${value}`}
        />

        {/* Tooltip on hover */}
        <Tooltip
          cursor={true}
          content={
            <ChartTooltipContent
              labelKey="date"
              formatter={(value) => [
                `ALGO ${(value as number).toFixed(2)}`,
                "Total Saved",
              ]}
            />
          }
        />

        {/* Line showing progress */}
        <Line
          dataKey="savings"
          type="monotone"
          stroke="var(--color-savings)"
          strokeWidth={2}
          dot={{
            fill: "var(--color-savings)",
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ChartContainer>
  );
}
```

### 📊 Data Transformation Example

```typescript
// Raw deposits from localStorage
const deposits = [
  { amount: 0.5, timestamp: 1708281600000, txId: "ABC..." },  // Feb 18
  { amount: 0.3, timestamp: 1708368000000, txId: "DEF..." },  // Feb 19
  { amount: 0.2, timestamp: 1708454400000, txId: "GHI..." },  // Feb 20
];

// Transform to cumulative
const chartData = [
  { date: "Feb 18", savings: 0},     // Starting point
  { date: "Feb 18", savings: 0.5},   // After deposit 1
  { date: "Feb 19", savings: 0.8},   // After deposit 2
  { date: "Feb 20", savings: 1.0},   // After deposit 3
];

// Chart displays as line going up
Chart:
    1.0 ┤           ╱─
        │         ╱
    0.5 ┤   ────╱
        │   │
    0.0 ┃─────────────────────
        Feb 18  Feb 19  Feb 20
```

---

## **Feature 5: Achievement Badges**

### 📝 What It Does

Unlocks badges when:
- "First Deposit" — any deposit made
- "50% Saver" — reached 50% of goal
- "Goal Completed" — reached 100% of goal

### 🎨 User Interface

**File**: [src/components/goals/GoalDetailsClient.tsx](src/components/goals/GoalDetailsClient.tsx)

```tsx
// Calculate achievements based on on-chain data
const getAchievements = (onchainData: OnChainGoal) => {
  const ach: string[] = [];

  // ✓ First Deposit: Any deposits made?
  if (goal.deposits?.length > 0) {
    ach.push("First Deposit");
  }

  // ✓ 50% Saver: Reached 50% of target?
  const percentSaved =
    (onchainData.totalSaved / onchainData.targetAmount) * 100;
  if (percentSaved >= 50) {
    ach.push("50% Saver");
  }

  // ✓ Goal Completed: 100% reached?
  if (onchainData.goalCompleted) {
    ach.push("Goal Completed");
  }

  return ach;
};

const achievements = getAchievements(onChainGoal);

// Render badges
<div>
  <h3>Achievements</h3>
  {achievements.length > 0 ? (
    achievements.map((ach) => (
      <Badge key={ach} variant="secondary">
        <Award className="mr-2 h-4 w-4" />
        {ach}
      </Badge>
    ))
  ) : (
    <p className="text-muted-foreground">
      No achievements unlocked yet. Keep saving!
    </p>
  )}
</div>;
```

### 🤖 AI Coach Triggered by Achievement

When goal is completed, AI Coach appears with congratulatory message:

```typescript
const handleFetchAdvice = async () => {
  setIsLoadingAdvice(true);
  try {
    // Call Genkit AI flow
    const { message, tip } = await generateAchievementAdvice(
      goal.name,
      achievements
    );
    setAchievementInfo({ message, tip });
  } catch (error) {
    console.error("Error fetching advice:", error);
  } finally {
    setIsLoadingAdvice(false);
  }
};

// Example AI response
/*
message: "Congratulations on completing your 'New Laptop' goal! 
          This shows incredible financial discipline and commitment."
tip: "Now that you've built this habit, consider setting your next 
     goal with a longer deadline to challenge yourself further!"
*/
```

---

## **PWA Install Prompt**

### 📝 What It Does

Shows an install banner when user visits app for first time. Users can install as native app with:
- One-click installation on Android/Desktop
- Offline support (service worker)
- App icon on home screen

### 🎨 User Interface

**File**: [src/components/pwa/InstallPrompt.tsx](src/components/pwa/InstallPrompt.tsx)

```tsx
export default function InstallPrompt() {
  const { isInstallable, install } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);

  // Show banner 1.5 seconds after load (unless dismissed)
  useEffect(() => {
    const wasDismissed = localStorage.getItem("algosave_pwa_install_dismissed");
    if (wasDismissed || !isInstallable) return;

    const timer = setTimeout(() => setShowBanner(true), 1500);
    return () => clearTimeout(timer);
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("algosave_pwa_install_dismissed", "true");
  };

  if (!showBanner || !isInstallable) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg p-4">
        <div className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-2xl">
          {/* App Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Download className="h-6 w-6" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <p className="font-semibold">Install AlgoSave</p>
            <p className="text-xs text-muted-foreground">
              Install as an app for offline access and faster performance
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInstall} className="gap-1.5">
              <Download className="h-4 w-4" />
              Install
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### ⌨️ Install Button in Header

**File**: [src/components/layout/Header.tsx](src/components/layout/Header.tsx)

```tsx
export default function Header() {
  const { isInstallable, install } = usePWAInstall();
  const { activeAddress } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <div className="flex items-center gap-2">
          {/* Install button appears on desktop when available */}
          {isInstallable && (
            <Button
              onClick={install}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
          )}

          {/* Wallet button */}
          {activeAddress ? (
            <Button onClick={disconnectWallet} variant="outline">
              {activeAddress.substring(0, 6)}...
            </Button>
          ) : (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          )}
        </div>
      </div>
    </header>
  );
}
```

### 🪝 PWA Install Hook

**File**: [src/hooks/usePWAInstall.ts](src/hooks/usePWAInstall.ts)

```typescript
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    setIsInstalled(checkInstalled);

    if (checkInstalled) return;

    // Listen for beforeinstallprompt event (Android, Chrome, Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for appinstalled event (when user accepts)
    const installedHandler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
      return true;
    }

    return false;
  };

  return { isInstallable, isInstalled, install };
}
```

---

## **Wallet Connection**

### 📝 What It Does

Integrates Pera Wallet so users can:
- Connect their Algorand wallet
- Sign transactions
- See their wallet address

### 🎨 User Interface

**Hook**: [src/hooks/useWallet.ts](src/hooks/useWallet.ts)

```typescript
export function useWallet() {
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const walletRef = useRef<PeraWalletConnect | null>(null);

  // Initialize Pera Wallet on mount
  useEffect(() => {
    const wallet = new PeraWalletConnect();
    walletRef.current = wallet;

    // Reconnect if previously connected
    wallet.reconnectSession();

    // Listen for account changes
    wallet.connector?.on("accounts_changed", (addresses: string[]) => {
      setActiveAddress(addresses[0] || null);
    });
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const addresses = await walletRef.current!.connect();
      setActiveAddress(addresses[0]);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    walletRef.current?.disconnect();
    setActiveAddress(null);
  };

  const signTransactions = async (txns: Uint8Array[]) => {
    return await walletRef.current!.signTransaction(txns);
  };

  return {
    activeAddress,
    isConnecting,
    connectWallet,
    disconnectWallet,
    signTransactions,
  };
}
```

**Usage in Header**:

```tsx
export default function Header() {
  const { activeAddress, isConnecting, connectWallet, disconnectWallet } =
    useWallet();

  return (
    <header>
      {activeAddress ? (
        <Button onClick={disconnectWallet} variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          {activeAddress.substring(0, 6)}...{activeAddress.substring(-4)}
        </Button>
      ) : (
        <Button onClick={connectWallet} disabled={isConnecting}>
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </header>
  );
}
```

---

## 🎯 Summary Table

| Feature | File | Purpose |
|---------|------|---------|
| Goal Creation | [CreateGoalForm.tsx](src/components/goals/CreateGoalForm.tsx) | Form to create new goal |
| Smart Contract Deployment | [blockchain.ts](src/lib/blockchain.ts) | deployGoalContract() |
| Dashboard | [page.tsx](src/app/page.tsx) | Display all goals |
| Goal Card | [GoalCard.tsx](src/components/goals/GoalCard.tsx) | Individual goal display |
| Fetch On-Chain State | [blockchain.ts](src/lib/blockchain.ts) | getGoalOnChainState() |
| Deposit Dialog | [DepositDialog.tsx](src/components/goals/DepositDialog.tsx) | Dialog to deposit |
| Deposit Transaction | [blockchain.ts](src/lib/blockchain.ts) | depositToGoal() |
| Goal Details | [GoalDetailsClient.tsx](src/components/goals/GoalDetailsClient.tsx) | Full goal view |
| Savings Chart | [SavingsChart.tsx](src/components/goals/SavingsChart.tsx) | Visual analytics |
| Achievements | [GoalDetailsClient.tsx](src/components/goals/GoalDetailsClient.tsx) | Badge unlock logic |
| Install Prompt | [InstallPrompt.tsx](src/components/pwa/InstallPrompt.tsx) | PWA install banner |
| Wallet Connection | [useWallet.ts](src/hooks/useWallet.ts) | Pera Wallet integration |

---

**All features are fully implemented and working on Algorand Testnet!** 🚀
