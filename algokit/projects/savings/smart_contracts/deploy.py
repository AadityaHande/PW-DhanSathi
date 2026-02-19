"""Deploy the SavingsVault smart contract to Algorand Testnet.

This script is invoked by `algokit deploy` via the project's algokit.yaml.
It reads the pre-compiled TEAL artifacts from contracts/approval.teal and
contracts/clear.teal, then deploys them to the Algorand Testnet.

Prerequisites
-------------
1. Install Python dependencies::

       pip install -r contracts/requirements.txt

2. Export a funded Testnet account mnemonic::

       export DEPLOYER_MNEMONIC="word1 word2 ... word25"

Usage (from repo root)
----------------------
::

    algokit deploy
    # or directly:
    python algokit/projects/savings/smart_contracts/deploy.py
"""

import base64
import os
import pathlib
import sys

# ---------------------------------------------------------------------------
# Path resolution — walk upward from this file until a .git directory is found
# ---------------------------------------------------------------------------
def _find_repo_root(start: pathlib.Path) -> pathlib.Path:
    """Return the nearest ancestor directory that contains a .git folder."""
    for parent in [start, *start.parents]:
        if (parent / ".git").exists():
            return parent
    raise RuntimeError(
        f"Could not locate a .git directory above {start}. "
        "Make sure you are running inside the cloned repository."
    )


REPO_ROOT = _find_repo_root(pathlib.Path(__file__).resolve())
CONTRACTS_DIR = REPO_ROOT / "contracts"
TEAL_APPROVAL = CONTRACTS_DIR / "approval.teal"
TEAL_CLEAR = CONTRACTS_DIR / "clear.teal"


def main() -> None:
    # ------------------------------------------------------------------
    # 1. Import algosdk (bundled with py-algorand-sdk in requirements.txt)
    # ------------------------------------------------------------------
    try:
        import algosdk
        from algosdk import mnemonic as mnemonic_module, transaction
        from algosdk.v2client import algod
    except ImportError:
        sys.exit(
            "ERROR: py-algorand-sdk is not installed.\n"
            "       Run: pip install -r contracts/requirements.txt"
        )

    # ------------------------------------------------------------------
    # 2. Resolve deployer credentials from environment
    # ------------------------------------------------------------------
    deployer_mnemonic = os.environ.get("DEPLOYER_MNEMONIC")
    if not deployer_mnemonic:
        sys.exit(
            "ERROR: DEPLOYER_MNEMONIC environment variable is not set.\n"
            "       Export a funded Testnet account mnemonic before deploying:\n"
            "         export DEPLOYER_MNEMONIC='word1 word2 ... word25'"
        )
    words = deployer_mnemonic.split()
    if len(words) != 25:
        sys.exit(
            f"ERROR: DEPLOYER_MNEMONIC must be exactly 25 words; got {len(words)}.\n"
            "       Please export the full 25-word Algorand mnemonic."
        )

    private_key = mnemonic_module.to_private_key(deployer_mnemonic)
    sender = algosdk.account.address_from_private_key(private_key)
    print(f"Deployer address: {sender}")

    # ------------------------------------------------------------------
    # 3. Connect to Algorand Testnet (public Nodely endpoint, no key needed)
    # ------------------------------------------------------------------
    algod_address = "https://testnet-api.algonode.cloud"
    algod_token = ""
    client = algod.AlgodClient(algod_token, algod_address)

    # ------------------------------------------------------------------
    # 4. Load compiled TEAL
    # ------------------------------------------------------------------
    if not TEAL_APPROVAL.exists() or not TEAL_CLEAR.exists():
        sys.exit(
            f"ERROR: Compiled TEAL not found in {CONTRACTS_DIR}.\n"
            "       Run the build step first:\n"
            "         python contracts/compile.py"
        )

    approval_teal = TEAL_APPROVAL.read_text()
    clear_teal = TEAL_CLEAR.read_text()

    # ------------------------------------------------------------------
    # 5. Compile TEAL source → bytecode via algod
    # ------------------------------------------------------------------
    approval_result = client.compile(approval_teal)
    clear_result = client.compile(clear_teal)

    approval_program = base64.b64decode(approval_result["result"])
    clear_program = base64.b64decode(clear_result["result"])

    # ------------------------------------------------------------------
    # 6. Build and submit the ApplicationCreate transaction
    #    Global state: 4 uint64s + 1 byte-slice (goal_owner address)
    # ------------------------------------------------------------------
    sp = client.suggested_params()
    txn = transaction.ApplicationCreateTxn(
        sender=sender,
        sp=sp,
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=transaction.StateSchema(num_uints=4, num_byte_slices=1),
        local_schema=transaction.StateSchema(num_uints=0, num_byte_slices=0),
    )

    signed_txn = txn.sign(private_key)
    tx_id = client.send_transaction(signed_txn)
    print(f"Transaction submitted: {tx_id}")

    # ------------------------------------------------------------------
    # 7. Wait for confirmation and print the new App ID
    # ------------------------------------------------------------------
    try:
        confirmed = transaction.wait_for_confirmation(client, tx_id, 4)
    except Exception as exc:
        sys.exit(
            f"ERROR: Transaction {tx_id} was not confirmed within 4 rounds.\n"
            f"       Details: {exc}\n"
            "       Check the Testnet explorer for the transaction status:\n"
            f"         https://testnet.explorer.perawallet.app/transactions/{tx_id}"
        )
    app_id = confirmed["application-index"]

    print("\n✅  SavingsVault deployed successfully!")
    print(f"    App ID   : {app_id}")
    print(
        f"    Explorer : https://testnet.explorer.perawallet.app/applications/{app_id}"
    )
    print(
        "\nAdd this App ID to algokit/projects/savings/README.md "
        "under the 'Deployed Contract' section."
    )


if __name__ == "__main__":
    main()
