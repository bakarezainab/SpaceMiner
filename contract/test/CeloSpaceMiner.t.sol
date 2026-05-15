// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CeloSpaceMiner.sol";

contract CeloSpaceMinerTest is Test {
    CeloSpaceMiner public miner;
    address public constant USDM = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address public user = address(0x1);

    function setUp() public {
        miner = new CeloSpaceMiner(USDM);
    }

    function test_SaveGame() public {
        vm.prank(user);
        miner.saveGame(100);
        
        (uint256 totalDust, , , , ) = miner.players(user);
        assertEq(totalDust, 100);
        assertEq(miner.getPlayerCount(), 1);
        assertEq(miner.playerAddresses(0), user);
    }

    function test_InitialValues() public {
        assertEq(address(miner.usdmToken()), USDM);
        assertEq(miner.AUTO_MINER_PRICE(), 1e16);
    }
}
