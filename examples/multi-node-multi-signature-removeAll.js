import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    KeyList,
    TransferTransaction,
    Transaction,
    PublicKey,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

let aliceKey;
let bobKey;

/**
 * @description Create a transaction with multiple nodes and multiple signatures
 * and remove all of the signatures from the transaction
 */
async function main() {
    /**
     *
     *  Step 1: Create Client
     *
     */
    if (
        process.env.OPERATOR_ID == null ||
        process.env.OPERATOR_KEY == null ||
        process.env.HEDERA_NETWORK == null
    ) {
        throw new Error(
            "Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required.",
        );
    }

    const client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
        AccountId.fromString(process.env.OPERATOR_ID),
        PrivateKey.fromStringED25519(process.env.OPERATOR_KEY),
    );

    /**
     *
     * Step 2: Create keys for two users
     *
     */
    aliceKey = PrivateKey.generate();
    bobKey = PrivateKey.generate();

    console.log("Alice public key:", aliceKey.publicKey.toStringDer());
    console.log("Bob public key:", bobKey.publicKey.toStringDer());

    const keyList = new KeyList([aliceKey.publicKey, bobKey.publicKey]);

    /**
     *
     * Step 3: Create an account with the keyList
     *
     */
    const createAccountTransaction = new AccountCreateTransaction()
        .setInitialBalance(new Hbar(2))
        .setKey(keyList);

    const createResponse = await createAccountTransaction.execute(client);
    const createReceipt = await createResponse.getReceipt(client);

    /**
     *
     * Step 4: Create a transfer transaction with multiple nodes
     *
     */
    const transferTransaction = new TransferTransaction()
        .addHbarTransfer(createReceipt.accountId, new Hbar(-1))
        .addHbarTransfer("0.0.3", new Hbar(1))
        // Set multiple nodes
        .setNodeAccountIds([
            new AccountId(3),
            new AccountId(4),
            new AccountId(5),
        ])
        .freezeWith(client);

    /**
     *
     * Step 5:  Serialize the transaction
     *  & Collect multiple signatures (Uint8Array[]) from one key
     *
     */

    const transferTransactionBytes = transferTransaction.toBytes();

    const aliceSignatures = aliceKey.signTransaction(transferTransaction);
    const bobSignatures = bobKey.signTransaction(transferTransaction);

    /**
     *
     * Step 6:  Deserialize the transaction
     *  & Add the previously collected signatures
     *
     */
    const signedTransaction = Transaction.fromBytes(transferTransactionBytes);

    signedTransaction.addSignature(aliceKey.publicKey, aliceSignatures);
    signedTransaction.addSignature(bobKey.publicKey, bobSignatures);

    console.log("\nADDED users signatures below: \n");

    if (Array.isArray(aliceSignatures) && Array.isArray(bobSignatures)) {
        console.log(
            "Alice Signatures =>",
            aliceSignatures.map((aliceSig) =>
                PrivateKey.fromBytes(aliceSig).toStringDer(),
            ),
        );

        console.log(
            "Bob Signatures =>",
            bobSignatures.map((bobSig) =>
                PrivateKey.fromBytes(bobSig).toStringDer(),
            ),
        );
    }

    const signaturesInTheTransactionBefore =
        getAllSignaturesFromTransaction(signedTransaction);

    console.log("\n\nSignatures in the transaction: ");
    console.log(signaturesInTheTransactionBefore);

    /**
     *
     * Step 7: Remove all signatures from the transaction and add them back
     *
     */

    const allSignaturesRemoved = signedTransaction.removeAllSignatures();

    const signaturesInTheTransactionAfter =
        getAllSignaturesFromTransaction(signedTransaction);

    console.log(
        "\nSignatures left in the transaction:",
        signaturesInTheTransactionAfter,
    );

    /**
     * Print the signatures in DER format
     * @param {Uint8Array[]} signatures - The signatures to print.
     * @returns {void} An array of signatures in DER format.
     */
    const printSignatures = (signatures) => {
        return signatures.forEach((sig) => {
            console.log(PrivateKey.fromBytes(sig).toStringDer());
        });
    };

    for (const [publicKey, signatures] of Object.entries(
        allSignaturesRemoved,
    )) {
        // Show the signatures for Alice & Bob
        console.log(`\nRemoved signatures for ${publicKey}:`);

        if (Array.isArray(signatures)) {
            printSignatures(signatures);
        }

        // Add the removed signatures back
        signedTransaction.addSignature(
            PublicKey.fromString(publicKey),
            signatures,
        );
    }

    /**
     *
     * Step 8: Execute and take the receipt
     *
     */
    const result = await signedTransaction.execute(client);

    const receipt = await result.getReceipt(client);

    console.log(`\n  \nTransaction status: ${receipt.status.toString()}`);

    client.close();
}

void main();

/**
 * Extracts all signatures from a signed transaction.
 * @param {Transaction} signedTransaction - The signed transaction object containing the list of signed transactions.
 * @returns {string[]} An array of signatures in DER format.
 */
const getAllSignaturesFromTransaction = (signedTransaction) => {
    /** @type {string[]} */
    const signatures = [];

    signedTransaction._signedTransactions.list.forEach((transaction) => {
        if (transaction.sigMap?.sigPair) {
            transaction.sigMap.sigPair.forEach((sigPair) => {
                if (sigPair.ed25519) {
                    signatures.push(
                        PrivateKey.fromBytesED25519(
                            sigPair.ed25519,
                        ).toStringDer(),
                    );
                } else if (sigPair.ECDSASecp256k1) {
                    signatures.push(
                        PrivateKey.fromBytesECDSA(
                            sigPair.ECDSASecp256k1,
                        ).toStringDer(),
                    );
                }
            });
        }
    });

    return signatures;
};