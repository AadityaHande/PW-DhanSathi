# Savings Project — AlgoKit Smart Contract

This project contains the `SavingsVault` smart contract for DhanSathi, built with [AlgoKit](https://github.com/algorandfoundation/algokit-cli) and [Beaker/PyTEAL](https://github.com/algorand-devrel/beaker).

## Overview

The `SavingsVault` contract implements "Discipline-as-a-Service" on Algorand. Each deployed instance acts as a personal, on-chain vault that enforces a user's savings rules — funds are locked until either the savings goal is reached or the deadline passes.

## Contract: SavingsVault

**File:** `smart_contracts/savings_vault.py`

### Global State

| Key              | Type    | Description                                   |
|------------------|---------|-----------------------------------------------|
| `goal_owner`     | bytes   | Algorand address of the vault creator         |
| `target_amount`  | uint64  | Target savings amount in microALGOs           |
| `total_saved`    | uint64  | Current amount saved in microALGOs            |
| `deadline`       | uint64  | Unix timestamp of the savings deadline        |
| `goal_completed` | uint64  | `1` when target is reached, `0` otherwise     |

### ABI Methods

- **`create_goal(owner, target, deadline_ts)`** — Initialises the vault with goal parameters.
- **`deposit(payment)`** — Accepts a grouped payment transaction towards the goal.
- **`withdraw()`** — Transfers the vault balance back to the owner once conditions are met.

### Withdrawal Conditions

The contract only permits a withdrawal when **at least one** of the following is true:
1. `goal_completed == 1` (target amount has been saved), **or**
2. `Global.latest_timestamp() >= deadline` (the deadline has passed).

## Project Structure

```
savings/
├── algokit.yaml              # AlgoKit project configuration
├── README.md                 # This file
└── smart_contracts/
    └── savings_vault.py      # SavingsVault Beaker contract
```

## Prerequisites

- [AlgoKit](https://github.com/algorandfoundation/algokit-cli) v2+
- Python 3.10+
- Dependencies listed in `../../contracts/requirements.txt`

## Build & Deploy

```bash
# From repo root — install Python dependencies
pip install -r contracts/requirements.txt

# Compile the contract (generates TEAL + base64 output in contracts/build/)
python contracts/compile.py

# Deploy to Testnet via AlgoKit
# Requires a funded Testnet account mnemonic in the DEPLOYER_MNEMONIC env var
export DEPLOYER_MNEMONIC="word1 word2 ... word25"
algokit deploy
```

> **Note:** `algokit deploy` reads `algokit.yaml` in this directory and runs
> `python smart_contracts/deploy.py`, which connects to the public Algorand
> Testnet endpoint and submits an `ApplicationCreate` transaction.
> The new App ID is printed to stdout on success.

## Deployed Contract

| Field            | Value                                                                                                   |
|------------------|---------------------------------------------------------------------------------------------------------|
| **Network**      | Algorand Testnet                                                                                        |
| **App ID**       | `755771019`                                                                                             |
| **Explorer**     | [View on Pera Testnet Explorer](https://testnet.explorer.perawallet.app/applications/755771019)         |
