// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CeloSpaceMiner.sol";

contract DeployCeloSpaceMiner is Script {
    function run() external {
        // Alfajores cUSD as proxy for USDm if testing
        // address usdmAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1; 
        
        // Switch to mainnet USDm
        address usdmAddress = 0x765DE816845861e75A25fCA122bb6898B8B1282a;

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        CeloSpaceMiner miner = new CeloSpaceMiner(usdmAddress);

        console.log("CeloSpaceMiner deployed at:", address(miner));

        vm.stopBroadcast();
    }
}
