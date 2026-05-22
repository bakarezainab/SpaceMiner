// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CeloSpaceMiner.sol";
import "../src/SpaceMinerAchievements.sol";
import "../src/SpaceMinerShop.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        SpaceMinerAchievements achievements = new SpaceMinerAchievements();
        SpaceMinerShop shop = new SpaceMinerShop();

        vm.stopBroadcast();
    }
}
