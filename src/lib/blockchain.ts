import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import type { Transaction } from "algosdk";
import type { OnChainGoal } from "./types";

// --- AlgoSDK Client Setup ---
const algodToken = ""; // No token needed for public TestNet node
const algodServer = "https://testnet-api.algonode.cloud";
const algodPort = 443;

export const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// --- Pera Wallet Setup ---
export const peraWallet = new PeraWalletConnect({
    chainId: 416002, // TestNet
});

// Reconnect to session when the component is mounted
export async function reconnectWalletSession() {
    return peraWallet.reconnectSession();
}

export async function disconnectWalletSession() {
    await peraWallet.disconnect();
}


// --- Smart Contract Deployment ---
// NOTE: The approval and clear programs need to be compiled from your Beaker smart contract
// using AlgoKit. Since this environment cannot run python, these are placeholders.
// You MUST replace these empty Uint8Array values with your compiled TEAL code.
const APPROVAL_PROGRAM = new Uint8Array();
const CLEAR_PROGRAM = new Uint8Array();
// In a real app, you would load this from the compiled artifacts, e.g.:
// import * as fs from 'fs';
// const APPROVAL_PROGRAM = new Uint8Array(fs.readFileSync('./contracts/build/approval.teal.tok'));
// const CLEAR_PROGRAM = new Uint8Array(fs.readFileSync('./contracts/build/clear.teal.tok'));

if (APPROVAL_PROGRAM.length === 0 || CLEAR_PROGRAM.length === 0) {
    console.warn("WARNING: Smart contract TEAL programs are not loaded. Deployment will fail. Replace placeholder arrays in src/lib/blockchain.ts with your compiled TEAL code.");
}

export async function deployGoalContract(
    senderAddress: string,
    args: { targetAmount: number; deadline: Date },
    signTransactions: (txns: Transaction[]) => Promise<Uint8Array[]>
): Promise<number> {

    if (APPROVAL_PROGRAM.length === 0 || CLEAR_PROGRAM.length === 0) {
        throw new Error("Smart contract TEAL code is missing. Please compile your contract and add it to src/lib/blockchain.ts");
    }

    const suggestedParams = await algodClient.getTransactionParams().do();
    const appArgs = [
        algosdk.decodeAddress(senderAddress).publicKey,
        algosdk.encodeUint64(args.targetAmount * 1_000_000), // Convert ALGO to microALGO
        algosdk.encodeUint64(Math.floor(args.deadline.getTime() / 1000)), // Convert to Unix timestamp
    ];

    const createTxn = algosdk.makeApplicationCreateTxnFromObject({
        from: senderAddress,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: APPROVAL_PROGRAM,
        clearProgram: CLEAR_PROGRAM,
        numGlobalInts: 4, // total_saved, target_amount, deadline, goal_completed
        numGlobalByteSlices: 1, // goal_owner
        numLocalInts: 0,
        numLocalByteSlices: 0,
        appArgs,
    });

    const signedTxns = await signTransactions([createTxn]);
    const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
    const result = await algosdk.waitForConfirmation(algodClient, txId, 4);

    const appId = result["application-index"];
    if (appId === undefined) {
        throw new Error("Could not get App ID from deployment transaction.");
    }
    
    // Fund the contract with a minimum balance
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: algosdk.getApplicationAddress(appId),
        amount: 100000, // 0.1 ALGO for min balance
        suggestedParams,
    });
    
    const signedPaymentTxn = await signTransactions([paymentTxn]);
    await algodClient.sendRawTransaction(signedPaymentTxn).do();

    return appId;
}


// --- Smart Contract Interaction ---

export async function depositToGoal(
    appId: number,
    senderAddress: string,
    amount: number, // in ALGO
    signTransactions: (txns: Transaction[]) => Promise<Uint8Array[]>
): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();

    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
        from: senderAddress,
        suggestedParams,
        appIndex: appId,
        appArgs: [new TextEncoder().encode("deposit")],
    });

    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: algosdk.getApplicationAddress(appId),
        amount: amount * 1_000_000, // Convert ALGO to microALGO
        suggestedParams,
    });

    algosdk.assignGroupID([appCallTxn, paymentTxn]);

    const signedTxns = await signTransactions([appCallTxn, paymentTxn]);
    const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);

    return txId;
}

export async function withdrawFromGoal(
    appId: number,
    senderAddress: string,
    signTransactions: (txns: Transaction[]) => Promise<Uint8Array[]>
): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    // We need to pay for the inner transaction, so add a fee
    suggestedParams.fee = 2 * algosdk.ALGORAND_MIN_TX_FEE;
    suggestedParams.flatFee = true;


    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
        from: senderAddress,
        suggestedParams,
        appIndex: appId,
        appArgs: [new TextEncoder().encode("withdraw")],
    });

    const signedTxns = await signTransactions([appCallTxn]);
    const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    return txId;
}

// --- State Reading ---

export async function getGoalOnChainState(appId: number): Promise<OnChainGoal> {
    if (appId === 0) { // Handle placeholder App ID for goals created before contract integration
        return {
            goalOwner: "",
            targetAmount: 0,
            totalSaved: 0,
            deadline: 0,
            goalCompleted: false,
            balance: 0,
        };
    }
    try {
        const appInfo = await algodClient.getApplicationByID(appId).do();
        const globalState = appInfo.params["global-state"];

        const state = globalState.reduce((acc, curr) => {
            const key = atob(curr.key);
            const value = curr.value;
            if (value.type === 1) { // byte slice
                 if (key === 'goal_owner') acc[key] = algosdk.encodeAddress(new Uint8Array(Buffer.from(value.bytes, 'base64')));
            } else { // uint
                acc[key] = value.uint;
            }
            return acc;
        }, {} as any);

        const accountInfo = await algodClient.accountInformation(algosdk.getApplicationAddress(appId)).do();
        const balance = accountInfo.amount;

        return {
            goalOwner: state.goal_owner,
            targetAmount: state.target_amount,
            totalSaved: state.total_saved,
            deadline: state.deadline,
            goalCompleted: state.goal_completed === 1,
            balance: balance,
        };
    } catch (error) {
        console.error(`Failed to get on-chain state for App ID ${appId}:`, error);
        throw new Error(`Could not fetch state for App ${appId}. It may not exist on TestNet.`);
    }
}
