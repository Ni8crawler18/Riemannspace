const express = require('express');
const bodyParser = require('body-parser');
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Initialize Express
const app = express();
app.use(bodyParser.json());

// Initialize Web3 and point it to your local Ganache instance
const web3 = new Web3('http://127.0.0.1:8545');

// Load the contract ABI and address from the correct file (Transaction.json)
const contractABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/contracts/Transaction.json'), 'utf8')).abi;

const contractAddress = '0x4f56cFd3724DB6ef58AC5043c5c49348e58b7d10'; // Replace with your deployed contract address

// Instantiate the contract
const transactionContract = new web3.eth.Contract(contractABI, contractAddress);

// Transfer endpoint to interact with the contract
app.post('/transfer', async (req, res) => {
    const { from, to, amount } = req.body;

    try {
        // Check if the addresses are valid Ethereum addresses
        if (!web3.utils.isAddress(from) || !web3.utils.isAddress(to)) {
            return res.status(400).json({ success: false, error: 'Invalid addresses' });
        }

        // Convert amount from string to Wei
        const amountInWei = web3.utils.toWei(amount, 'ether');

        // Perform the transfer by calling the contract's `transfer` method
        const receipt = await transactionContract.methods.transfer(to, amountInWei).send({
            from: from,
            gas: 2000000,
            gasPrice: await web3.eth.getGasPrice(), // Fetch current gas price
        });

        // Prepare response data
        const responseData = {
            success: true,
            message: 'Transaction completed successfully',
            transactionHash: receipt.transactionHash,
            senderAddress: from,
            receiverAddress: to,
            amount: amount,
            timestamp: new Date().toISOString()
        };

        // Send the response
        res.json(responseData);
    } catch (error) {
        console.error('Error during transaction:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});