const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

async function loadWasm(wasmPath) {
    const buffer = fs.readFileSync(wasmPath);
    const wasmModule = await WebAssembly.compile(buffer);

    const instance = await WebAssembly.instantiate(wasmModule, {
        runtime: {
            printDebug: (msg) => console.log("Debug:", msg),
            printErrorMessage: (msg) => console.error("Error:", msg),
            exceptionHandler: (code) => {
                console.error(`Exception code: ${code}`);
            },
            writeBufferMessage: (msg) => {
                console.log("Buffer Message:", msg);
            },
            showSharedRWMemory: () => {
                console.log("Shared RW Memory accessed.");
            }
        }
    });

    return instance.exports;
}

async function generateProof(input) {
    try {
        // Initialize the circuit's WASM and Zkey paths
        const wasmPath = path.resolve(__dirname, '../circuits/transaction_js/transaction.wasm');
        const zkeyPath = path.resolve(__dirname, '../zksnark/transaction_final.zkey');

        // Load the witness calculator from the compiled .wasm
        const witnessCalculator = await loadWasm(wasmPath);

        // Prepare input for the witness calculation
        const witnessInput = {
            sender: input.sender,
            recipient: input.recipient,
            amount: BigInt(input.amount), // Ensure this is a BigInt
            senderBalance: BigInt(input.senderBalance) // Ensure this is a BigInt
        };

        // Calculate witness
        const witness = await snarkjs.wtns.calculate(witnessCalculator, witnessInput);
        
        // Generate proof using the witness
        const { proof, publicSignals } = await snarkjs.groth16.prove(zkeyPath, witness);

        console.log("Proof generated successfully");
        return { proof, publicSignals };
    } catch (error) {
        console.error("Error generating proof:", error);
        throw error;
    }
}

module.exports = generateProof;
