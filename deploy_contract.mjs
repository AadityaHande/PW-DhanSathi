#!/usr/bin/env node
// Deploy SavingsVault smart contract to Algorand TestNet

import algosdk from "algosdk";

const ALGOD_URL = "https://testnet-api.algonode.cloud";
const DISPENSER_URL = "https://testnet.algoexplorerapi.io/dispenser";

const APPROVAL_B64 = "CCACAQAmBgpnb2FsX293bmVyC3RvdGFsX3NhdmVkDmdvYWxfY29tcGxldGVkCGRlYWRsaW5lBOSoxwANdGFyZ2V0X2Ftb3VudDEYIxJAACQ2GgAnBBJAACU2GgCABDYl5OsSQAAyNhoAgAS3NV/REkAAWQA2GgAnBBJEQgAAKDYaAWcnBTYaAhdnKzYaAxdnKSNnKiNnIkMxAChkEkQyBytkDEQqZCMSRDEWIgk4BzIKEkQpKWQxFiIJOAgIZylkJwVkD0EAAyoiZyJDMQAoZBJEKmQiEjIHK2QPEUSxIrIQKGSyByOyCCOyAShksgmzIkM=";
const CLEAR_B64 = "CIEB";

function loadProgram(b64) {
    return new Uint8Array(Buffer.from(b64, "base64"));
}

const algodClient = new algosdk.Algodv2("", ALGOD_URL, 443);

async function fundAccount(address) {
    console.log(`Requesting TestNet ALGO from dispenser for ${address}...`);
    const res = await fetch("https://testnet.algoexplorerapi.io/dispenser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver: address, amount: 10000000 }) // 10 ALGO
    });
    if (!res.ok) {
        // Try alternate dispenser
        console.log("Primary dispenser failed, trying alternate...");
        const res2 = await fetch(`https://bank.testnet.algorand.network/?account=${address}`, {
            method: "GET"
        });
        if (!res2.ok) {
            throw new Error(`Dispenser failed: ${res2.status} ${await res2.text()}`);
        }
        console.log("Funding request sent via bank.testnet.algorand.network");
    } else {
        console.log("Funding request sent:", await res.text());
    }
}

async function waitForFunds(address, timeoutMs = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const info = await algodClient.accountInformation(address).do();
            if (info.amount > 1000000) { // More than 1 ALGO
                console.log(`Account funded with ${info.amount / 1_000_000} ALGO`);
                return info.amount;
            }
        } catch (e) { /* not yet funded */ }
        await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error("Account never got funded");
}

async function deploy() {
    // Generate a new account
    const account = algosdk.generateAccount();
    console.log(`Generated new account: ${account.addr}`);
    
    // Fund it
    await fundAccount(account.addr);
    console.log("Waiting for funding confirmation...");
    await waitForFunds(account.addr);
    
    // Get suggested params
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const approvalProgram = loadProgram(APPROVAL_B64);
    const clearProgram = loadProgram(CLEAR_B64);
    
    // Create a simple test goal to get app ID
    const createGoalMethod = new algosdk.ABIMethod({
        name: "create_goal",
        args: [
            { type: "address", name: "owner" },
            { type: "uint64", name: "target" },
            { type: "uint64", name: "deadline_ts" },
        ],
        returns: { type: "void" },
    });
    
    const selector = createGoalMethod.getSelector();
    const addressType = new algosdk.ABIAddressType();
    const uint64Type = new algosdk.ABIUintType(64);
    
    const encodedOwner = addressType.encode(account.addr);
    const encodedTarget = uint64Type.encode(BigInt(1_000_000)); // 1 ALGO target
    const encodedDeadline = uint64Type.encode(BigInt(Math.floor(Date.now() / 1000) + 86400 * 30)); // 30 days
    
    const createTxn = algosdk.makeApplicationCreateTxnFromObject({
        from: account.addr,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram,
        clearProgram,
        numGlobalInts: 4,
        numGlobalByteSlices: 1,
        numLocalInts: 0,
        numLocalByteSlices: 0,
        appArgs: [selector, encodedOwner, encodedTarget, encodedDeadline],
    });
    
    const signedCreate = createTxn.signTxn(account.sk);
    const { txId: createTxId } = await algodClient.sendRawTransaction(signedCreate).do();
    console.log(`Deployment transaction ID: ${createTxId}`);
    
    const result = await algosdk.waitForConfirmation(algodClient, createTxId, 10);
    const appId = result["application-index"];
    
    if (!appId) throw new Error("Could not get App ID from deployment transaction.");
    
    console.log(`\n✅ SUCCESS! Deployed SavingsVault App ID: ${appId}`);
    console.log(`TestNet Explorer: https://testnet.explorer.perawallet.app/applications/${appId}`);
    
    return appId;
}

deploy().catch(err => {
    console.error("Deployment error:", err.message);
    process.exit(1);
});
