// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Transaction {
    mapping(address => uint256) public balances;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event BalanceCheck(address account, uint256 balance);

    constructor() {
        balances[msg.sender] = 100; // Initialize with some tokens for testing
    }

    // Transfer function that moves tokens between accounts
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        emit BalanceCheck(msg.sender, balances[msg.sender]);
        emit BalanceCheck(to, balances[to]);

        balances[msg.sender] -= amount; // Deduct from sender's balance
        balances[to] += amount; // Add to receiver's balance

        emit Transfer(msg.sender, to, amount);

        emit BalanceCheck(msg.sender, balances[msg.sender]);
        emit BalanceCheck(to, balances[to]);
    }

    // Function to get the balance of an account
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
}