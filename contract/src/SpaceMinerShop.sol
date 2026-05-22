// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SpaceMinerShop {
    mapping(address => mapping(uint256 => uint256)) public playerItems;

    event ItemPurchased(address indexed player, uint256 itemId, uint256 quantity);

    function buyItem(uint256 itemId, uint256 quantity) external {
        // Logic for deducting balances would go here
        playerItems[msg.sender][itemId] += quantity;
        emit ItemPurchased(msg.sender, itemId, quantity);
    }

    function getPlayerItemBalance(address player, uint256 itemId) external view returns (uint256) {
        return playerItems[player][itemId];
    }
}
