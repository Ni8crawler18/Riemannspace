const express = require('express');
const bodyParser = require('body-parser');
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Initialize Web3 and connect to local Ganache instance
const web3 = new Web3('http://127.0.0.1:8545');

// Load contract ABI and deployed contract address
const contractABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/contracts/Transaction.json'), 'utf8')).abi;
const contractAddress = ''; // Replace with your deployed contract address

// Create contract instance
const transactionContract = new web3.eth.Contract(contractABI, contractAddress);

// Function to fetch contract balance for a given address
async function getContractBalance(address) {
    const balance = await transactionContract.methods.getBalance(address).call();
    return balance.toString(); // Convert BigInt/BigNumber to string
}

// Transfer endpoint to handle token transfers
app.post('/transfer', async (req, res) => {
    const { from, to, amount } = req.body;

    try {
        // Validate addresses
        if (!web3.utils.isAddress(from) || !web3.utils.isAddress(to)) {
            return res.status(400).json({ success: false, error: 'Invalid addresses' });
        }

        // Check balances before the transfer
        const fromBalanceBefore = await getContractBalance(from);
        const toBalanceBefore = await getContractBalance(to);

        // Ensure sender has enough balance
        if (BigInt(fromBalanceBefore) < BigInt(amount)) {
            return res.status(400).json({ success: false, error: 'Insufficient balance' });
        }

        // Perform the transfer using the smart contract's `transfer` method
        const receipt = await transactionContract.methods.transfer(to, amount).send({
            from: from,
            gas: 2000000,
            gasPrice: await web3.eth.getGasPrice(), // Set the gas price dynamically
        });

        // Fetch balances after the transfer
        const fromBalanceAfter = await getContractBalance(from);
        const toBalanceAfter = await getContractBalance(to);

        // Prepare and return response data
        const responseData = {
            success: true,
            message: 'Transaction completed successfully',
            transactionHash: receipt.transactionHash,
            senderAddress: from,
            receiverAddress: to,
            amount: amount,
            senderBalanceBefore: fromBalanceBefore,
            senderBalanceAfter: fromBalanceAfter,
            receiverBalanceBefore: toBalanceBefore,
            receiverBalanceAfter: toBalanceAfter,
            timestamp: new Date().toISOString(),
        };

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(responseData, null, 2));
    } catch (error) {
        console.error('Error during transaction:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});