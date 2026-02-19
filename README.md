# AlgoSave: Discipline-as-a-Service on Algorand

AlgoSave is a decentralized application (DApp) that transforms a simple savings goal tracker into a powerful commitment device. It provides "Discipline-as-a-Service" by using Algorand smart contracts to enforce savings rules, ensuring students can reach their financial goals without relying on willpower alone.

## 1. Problem Statement

For many students, saving money is a significant challenge. Traditional savings methods and apps often fail because they lack the structure and discipline required to reach a long-term goal. Key problems include:

*   **Lack of Discipline:** It's easy to dip into savings for unplanned expenses, derailing progress. Digital savings are often just a number in a database, with no real barrier to withdrawal.
*   **Trust Issues:** Centralized financial apps require users to trust the company with their funds and data. This trust can be misplaced, as terms can change and data can be misused.
*   **Lack of Transparency:** With traditional apps, it's hard to verify how your funds are managed or if the savings "rules" can be changed without notice.

Existing solutions fail because they don't provide a strong enough commitment mechanism. AlgoSave addresses this by using a smart contract as a personal, immutable savings vault.

## 2. Solution Overview

AlgoSave combines a user-friendly web interface with the power of the Algorand blockchain to create a robust micro-savings platform. We call this **Discipline-as-a-Service**: your savings rules are enforced by code, not willpower.

*   **Off-Chain (User Experience):** A Next.js frontend provides a clean, intuitive interface for creating goals, tracking progress, and interacting with the blockchain. Firebase is used to store non-critical metadata, like goal names and AI-generated tips.
*   **On-Chain (Savings Logic):** The core of the application is a Beaker smart contract deployed on the Algorand Testnet. Each savings goal is a unique instance of this contract, acting as a personal, on-chain vault. This contract enforces the savings rules, such as locking funds until a goal is met or a deadline passes.

This hybrid model ensures a smooth user experience while guaranteeing the security, transparency, and discipline of a decentralized system. As an explicit design choice, **Algorand's smart contract enforces savings discipline without relying on trust.**

## 3. Live Demo Links

*   **Hosted App URL:** `[YOUR_HOSTED_URL_HERE]`
*   **LinkedIn Demo Video:** `[YOUR_PUBLIC_LINKEDIN_VIDEO_URL_HERE]`

## 4. Algorand App Details

*   **Network:** Algorand Testnet
*   **Sample App ID:** `[YOUR_DEPLOYED_APP_ID_HERE]`
*   **Testnet Explorer Link:** `https://testnet.explorer.perawallet.app/applications/[YOUR_DEPLOYED_APP_ID_HERE]`

## 5. Architecture Overview

The application is composed of several key components:

*   **Frontend (Next.js/React):** The user interface for creating and managing savings goals. It handles wallet connections (via Pera Wallet) and constructs transactions to be signed by the user. It reads on-chain state directly from the Algorand Testnet to display progress.
*   **Smart Contract (Beaker/PyTEAL):** The on-chain `SavingsVault` contract that holds funds and enforces savings rules. It contains the core business logic for deposits and time-locked withdrawals.
*   **Firebase/Firestore (Metadata):** Used as a lightweight backend to store off-chain goal metadata, such as the goal's name and its corresponding on-chain `appId`. It also caches deposit history for charting purposes.
*   **Pera Wallet (@perawallet/connect):** The wallet used for account management and transaction signing. Users interact with the blockchain securely through their own Pera wallet.
*   **Algorand SDK (algosdk-js):** The library used by the frontend to communicate with the Algorand Testnet, create transactions, and read the smart contract's state.

## 6. Tech Stack

*   **Blockchain:** Algorand Testnet
*   **Smart Contract Framework:** AlgoKit, Beaker (PyTEAL)
*   **Frontend Framework:** Next.js, React
*   **UI Components:** ShadCN UI, Tailwind CSS
*   **Wallet Integration:** Pera Wallet
*   **Database (Metadata):** Firebase Firestore
*   **AI Integration:** Google Gemini (for AI Coach and Smart Savings features)

## 7. Setup & Installation

Follow these steps to run the project locally.

1.  **Clone the Repository:**
    ```bash
    git clone [YOUR_GITHUB_REPO_URL]
    cd [YOUR_REPO_NAME]
    ```

2.  **Install Python & AlgoKit Dependencies:**
    This project's smart contract is managed with AlgoKit. Ensure you have AlgoKit and its prerequisites installed.
    ```bash
    # Install Python dependencies for the contract
    pip install -r contracts/requirements.txt
    ```

3.  **Build & Deploy the Smart Contract:**
    Use AlgoKit to compile and deploy the `SavingsVault` contract to the Algorand Testnet.
    ```bash
    # This will compile the Python code into TEAL and generate an application spec
    algokit build

    # Deploy to Testnet. This step requires a funded Testnet account configured with AlgoKit.
    # The deployment script will output a new APP_ID.
    algokit deploy
    ```
    After deployment, you **must** copy the compiled TEAL code from `contracts/build/approval.teal` and `contracts/build/clear.teal` and place them into the `APPROVAL_PROGRAM` and `CLEAR_PROGRAM` variables in `src/lib/blockchain.ts`.

4.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

5.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project and add your Firebase project configuration.

6.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) in your browser.

## 8. Usage Guide

1.  **Connect Wallet:** Click "Connect Wallet" on the top right and connect your Pera Wallet (ensure it's set to Testnet). You'll need some Testnet ALGO, which you can get from the Algorand Testnet Dispenser.
2.  **Create a Savings Vault:** Navigate to "Create New Goal". Give your goal a name (e.g., "Summer Trip"), a target amount, and a deadline. When you click "Create Goal", you are deploying a personal smart contract vault to the Algorand Testnet. You will need to approve this transaction in your Pera Wallet.
3.  **Make a Deposit:** On the goal details page, click "Make a Deposit". Enter an amount and approve the transaction. This is a grouped transaction: one part calls the `deposit` method on your smart contract, and the other part is the actual ALGO payment. Both must succeed together.
4.  **Track On-Chain Progress:** Your dashboard and goal details page will update automatically, reading data directly from your smart contract on the blockchain. You can see your on-chain balance, transaction history, and progress chart.
5.  **Withdraw Your Savings:** A "Withdraw" button will appear only when your goal is completed or the deadline has passed. This rule is enforced by the smart contract. Clicking it will transfer the entire contract balance back to your wallet.

## 9. Known Limitations

*   **Single User:** The contract is designed for a single owner. Each user manages their own set of goal contracts.
*   **One Goal Per Contract:** Each goal deploys a new, separate smart contract to ensure funds are isolated and rules are specific to that goal.
*   **Testnet Only:** The application is configured for the Algorand Testnet. Real funds should not be used.

## 10. Team Members & Roles

*   **[Your Name]** - Full-Stack & Smart Contract Developer
