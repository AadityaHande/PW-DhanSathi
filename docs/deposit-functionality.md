# Deposit Functionality: On-Chain Contribution Recording

## Overview
The deposit functionality in the AlgoSave app allows users to contribute funds towards their savings goals. Each deposit is recorded on the Algorand blockchain, ensuring transparency, immutability, and verifiability of all contributions.

## How It Works
1. **User Initiates Deposit:**
   - The user selects a goal and enters the amount to deposit.
   - The app prompts the user to sign the transaction using their Algorand wallet (e.g., Pera Wallet).

2. **Transaction Construction:**
   - The app constructs an Algorand payment transaction from the user's wallet address to the smart contract (application) address.
   - The transaction includes the deposit amount and references the specific goal (via app arguments or local state).

3. **On-Chain Recording:**
   - The transaction is grouped with an ApplicationCall transaction to the smart contract.
   - The smart contract verifies the deposit, updates the user's contribution record, and ensures all rules (e.g., minimum deposit) are followed.
   - The deposit is now permanently recorded on-chain, visible to anyone via the Algorand explorer.

4. **Confirmation and Feedback:**
   - Once confirmed, the app updates the UI to reflect the new balance and contribution history.
   - The user receives a success notification.

## Benefits
- **Transparency:** All deposits are visible on the blockchain.
- **Security:** Funds are managed by the smart contract, reducing risk of tampering.
- **Auditability:** Every contribution is traceable and verifiable.

## Code Flow (Simplified)
1. **Frontend:**
   - Calls a deposit function (e.g., `depositToGoal(goalId, amount)`).
   - Uses Algorand SDK to create and sign transactions.
   - Sends transactions to the network.

2. **Smart Contract (PyTEAL):**
   - Receives ApplicationCall with deposit details.
   - Checks sender, amount, and goal validity.
   - Updates local state to record the deposit.

3. **Backend/Off-chain:**
   - Optionally, updates off-chain records for analytics or notifications.

## Example (Pseudocode)
```python
# PyTEAL smart contract snippet
if Txn.application_args[0] == Bytes("deposit"):
    Assert(Txn.application_args[1] == goal_id)
    Assert(Txn.application_args[2] == deposit_amount)
    # Update user's local state for the goal
    App.localPut(Txn.sender(), goal_id, new_total)
```

## User Experience
- User sees their deposit reflected instantly after confirmation.
- All deposits are provable on-chain, building trust in the system.

---
*For more details, see the smart contract and frontend code in the repository.*
