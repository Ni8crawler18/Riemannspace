pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template Transaction() {
    // Public inputs
    signal input recipientHash;
    signal input amount;

    // Private inputs
    signal input sender;
    signal input recipient;
    signal input senderBalance;

    // Intermediate signals
    signal senderBalanceAfter;
    signal computedRecipientHash; // New signal to store the output of hashRecipient

    // Compute recipient hash
    component hashRecipient = Poseidon(1);
    hashRecipient.inputs[0] <== recipient;
    computedRecipientHash <== hashRecipient.out;

    // Ensure sender has enough balance
    senderBalanceAfter <== senderBalance - amount;
    assert(senderBalanceAfter >= 0);

    // Ensure amount is positive
    assert(amount > 0);
}

component main = Transaction();