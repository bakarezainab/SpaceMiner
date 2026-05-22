// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SpaceMinerAchievements {
    mapping(address => uint256) public playerAchievements;
    mapping(address => bool) public isRegistered;

    event AchievementUnlocked(address indexed player, uint256 achievementId);

    function registerPlayer() external {
        isRegistered[msg.sender] = true;
    }

    function unlockAchievement(uint256 achievementId) external {
        require(isRegistered[msg.sender], "Player not registered");
        playerAchievements[msg.sender] |= (1 << achievementId);
        emit AchievementUnlocked(msg.sender, achievementId);
    }

    function hasAchievement(address player, uint256 achievementId) external view returns (bool) {
        return (playerAchievements[player] & (1 << achievementId)) != 0;
    }
}
