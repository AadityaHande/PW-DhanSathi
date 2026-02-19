import algosdk from "algosdk";
import type { Transaction } from "algosdk";
import { algodClient } from "./blockchain";

/**
 * ARC-3 compliant NFT metadata for a DhanSathi goal achievement.
 * @see https://arc.algorand.foundation/ARCs/arc-0003
 */
export interface ARC3Metadata {
  name: string;
  description: string;
  decimals: number;
  properties: {
    goal_name: string;
    target_amount_microalgos: number;
    total_saved_microalgos: number;
    app_id: number;
    completed_at: string;
  };
}

/** Result returned after a successful NFT mint. */
export interface MintNFTResult {
  assetId: number;
  txId: string;
}

/**
 * Build the ARC-3 JSON metadata object for a goal achievement NFT.
 */
export function buildARC3Metadata(params: {
  goalName: string;
  targetAmountMicroAlgos: number;
  totalSavedMicroAlgos: number;
  appId: number;
}): ARC3Metadata {
  return {
    name: `DhanSathi: ${params.goalName}`,
    description: `Achievement NFT for completing the savings goal "${params.goalName}" on DhanSathi.`,
    decimals: 0,
    properties: {
      goal_name: params.goalName,
      target_amount_microalgos: params.targetAmountMicroAlgos,
      total_saved_microalgos: params.totalSavedMicroAlgos,
      app_id: params.appId,
      completed_at: new Date().toISOString(),
    },
  };
}

/**
 * Mint an ARC-3 compliant achievement NFT on Algorand TestNet.
 *
 * The NFT is created as an Algorand Standard Asset (ASA) with:
 * - Total supply of 1 (unique)
 * - 0 decimals (non-fungible)
 * - ARC-3 metadata stored in the transaction note field
 * - Asset URL pointing to the ARC-3 metadata standard
 * - The user's wallet as the creator and sole holder
 *
 * @param senderAddress - The wallet address that will create and receive the NFT
 * @param goalName - Display name of the completed goal
 * @param appId - The on-chain App ID of the savings vault contract
 * @param targetAmountMicroAlgos - Target amount in microALGOs
 * @param totalSavedMicroAlgos - Total amount saved in microALGOs
 * @param signTransactions - Callback to sign transactions via Pera Wallet
 * @returns The created asset ID and transaction ID
 */
export async function mintGoalAchievementNFT(
  senderAddress: string,
  goalName: string,
  appId: number,
  targetAmountMicroAlgos: number,
  totalSavedMicroAlgos: number,
  signTransactions: (txns: Transaction[]) => Promise<Uint8Array[]>,
): Promise<MintNFTResult> {
  const metadata = buildARC3Metadata({
    goalName,
    targetAmountMicroAlgos,
    totalSavedMicroAlgos,
    appId,
  });

  // Encode metadata as JSON note (ARC-3 convention)
  const metadataJSON = JSON.stringify(metadata);
  const note = new Uint8Array(Buffer.from(metadataJSON));

  const suggestedParams = await algodClient.getTransactionParams().do();

  // Truncate asset name to 32 bytes (Algorand limit)
  const assetName = `DhanSathi: ${goalName}`.substring(0, 32);

  // Create the ASA (Algorand Standard Asset) as an ARC-3 NFT
  const createTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    suggestedParams,
    total: 1, // Unique NFT
    decimals: 0, // Non-fungible
    defaultFrozen: false,
    unitName: "DSNFT", // DhanSathi NFT
    assetName,
    assetURL: "template-ipfs://{ipfscid:1:raw:reserve:sha2-256}#arc3",
    note,
    // Manager/reserve/freeze/clawback set to sender (can be cleared later)
    manager: senderAddress,
    reserve: senderAddress,
    freeze: undefined,
    clawback: undefined,
  });

  const [signedTxn] = await signTransactions([createTxn]);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  const result = await algosdk.waitForConfirmation(algodClient, txId, 4);

  const assetId: number = result["asset-index"];
  if (!assetId) {
    throw new Error("Could not retrieve Asset ID from the mint transaction.");
  }

  return { assetId, txId };
}
