const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Set up web3 connection to Ganache
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

// Load the compiled contract ABI and address
const contractPath = path.resolve(__dirname, '../build/contracts/Transaction.json');
const contractData = JSON.parse(fs.readFileSync(contractPath));
const contractABI = contractData.abi;

// Add your contract address here after migration
const contractAddress = '0x2D51A961Dc7eEd42b3480cee24246a1Be9f032c5'; // Replace with your contract address

const contract = new web3.eth.Contract(contractABI, contractAddress);

module.exports = contract;

