const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const generateProof = require('../scripts/generateProof');
const RingSignature = require('./ringSignature');

const app = express();
app.use(express.json());

// Initialize provider and wallet with your Ganache settings
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet('0x6f36fa6b7cff3bf76523db7c45bf3b45517fb1212c7b6258752bf05de475905f', provider);

const VERIFIER_ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/contracts/RiemannVerifier.json'), 'utf8')).abi;
const verifierContract = new ethers.Contract('0xD6fc6e801a2700ba5d3a114781eFdaf2f04cDFDF', VERIFIER_ABI, wallet);

const publicKeys = [
    "0x84561Aba1DCD326FdC12127e10e88A46D400759f",
    "0x1fD1eCa20B41befb9550Aa400ee706c44a2626d8",
    "0x2F8683a3B4d119bC3Ca0F04F33e9EdE11FaA3F3C",
    "0xD3255c8C7392751978a4Ca321b468D0bac30FAA1",
    "0xd5B2651F0a33A90DA971052a01b8160C608681A6",
    "0x836F8c4932b54C5A3b19Ab7345c8BEc866f9A682",
    "0x9f78cb8487025Cf91B32667Dd403AD42ccDf364e",
    "0x193885929E4dc703e685b8FF96A370f2D43C2f33",
    "0x6F492f1C921c55ff01b9B42BC65ce9aE7b62C81C",
    "0x81Daca9A99D31f255601b5739f98ffb70e4220db"
];

// Endpoint to handle zk transactions
app.post('/zk-transaction', async (req, res) => {
    const { sender, recipient, amount } = req.body;

    // Validate inputs
    if (!sender || !recipient || !amount) {
        return res.status(400).json({ success: false, message: "Missing sender, recipient, or amount." });
    }

    const senderBalanceBefore = 80;
    const receiverBalanceBefore = 20;

    try {
        const input = {
            sender: sender,
            recipient: recipient,
            amount: amount,
            senderBalance: senderBalanceBefore.toString()
        };

        console.log("Generating proof...");
        const { proof, publicSignals } = await generateProof(input);
        console.log("Proof generated successfully");

        console.log("Generating ring signature...");
        const ringSignature = new RingSignature(
            publicKeys,
            wallet.privateKey,
            ethers.utils.solidityKeccak256(['address', 'uint256'], [recipient, amount])
        );
        const signature = ringSignature.sign();
        console.log("Ring signature generated successfully");

        console.log("Processing transaction on-chain...");
        const tx = await verifierContract.processTransaction(
            proof.pi_a,
            proof.pi_b,
            proof.pi_c,
            publicSignals,
            { gasLimit: 1000000 }
        );
        const receipt = await tx.wait();
        console.log("Transaction processed successfully");

        const senderBalanceAfter = senderBalanceBefore - parseFloat(amount);
        const receiverBalanceAfter = receiverBalanceBefore + parseFloat(amount);

        res.json({
            success: true,
            message: 'Transaction completed successfully via proof and ring signature',
            transactionHash: receipt.transactionHash,
            senderAddress: sender,
            receiverAddress: recipient,
            amount: amount,
            senderBalanceBefore: senderBalanceBefore,
            senderBalanceAfter: senderBalanceAfter,
            receiverBalanceBefore: receiverBalanceBefore,
            receiverBalanceAfter: receiverBalanceAfter,
            proof: proof,
            ringSignature: signature,
            timestamp: new Date().toISOString(),
            notice: 'This transaction was executed using zk-SNARK proofs and ring signatures for enhanced privacy and security.'
        });
    } catch (error) {
        console.error('ZK Transaction error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Riemannspace ZK server running on port ${PORT}`));
