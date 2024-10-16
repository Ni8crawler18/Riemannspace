const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

// Function to verify a zk-SNARK proof
async function verifyProof(proof, publicSignals) {
    const verificationKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../zksnark/verification_key.json'), 'utf8'));

    // Verify the proof
    const isValid = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);

    return isValid;
}

// Example usage
const proof = JSON.parse(fs.readFileSync('proof.json'));
const publicSignals = JSON.parse(fs.readFileSync('public.json'));

verifyProof(proof, publicSignals).then(isValid => {
    console.log(`Proof is ${isValid ? 'valid' : 'invalid'}`);
}).catch(err => {
    console.error('Error verifying proof:', err);
});