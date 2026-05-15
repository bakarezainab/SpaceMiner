// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CeloSpaceMiner
 * @dev A simple smart contract integrating USDm payments on Celo
 *      designed perfectly for a MiniPay DApp.
 */

// Minimal ERC20 interface to interact with USDm
interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract CeloSpaceMiner {
    IERC20 public usdmToken;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    struct UserStats {
        uint256 totalDust;
        bool hasAutoMiner;
        bool hasLaserPickaxe;
        uint256 lastCheckIn;
        uint256 referralCount;
        mapping(string => bool) achievements;
    }

    mapping(address => UserStats) public players;
    address[] public playerAddresses;
    mapping(address => bool) public hasPlayed;

    // Events
    event GameSaved(address indexed player, uint256 dustCount);
    event UpgradePurchased(address indexed player, string upgradeName, uint256 cost);
    event DailyCheckIn(address indexed player, uint256 reward);
    event AchievementUnlocked(address indexed player, string achievementName);

    uint256 public constant DAILY_REWARD = 10; // 10 Dust
    uint256 public constant AUTO_MINER_PRICE = 1e16; // 0.01 USDm
    uint256 public constant LASER_PRICE = 5e16; // 0.05 USDm

    constructor(address _usdmAddress) {
        usdmToken = IERC20(_usdmAddress);
        owner = msg.sender;
    }

    // 1. FREE ACTION: Save game state
    function saveGame(uint256 _dustMined) external {
        if (!hasPlayed[msg.sender]) {
            playerAddresses.push(msg.sender);
            hasPlayed[msg.sender] = true;
        }
        players[msg.sender].totalDust += _dustMined;
        
        // Check for achievement
        if (players[msg.sender].totalDust >= 1000 && !players[msg.sender].achievements["dust_king"]) {
            players[msg.sender].achievements["dust_king"] = true;
            emit AchievementUnlocked(msg.sender, "Dust King");
        }
        
        emit GameSaved(msg.sender, players[msg.sender].totalDust);
    }

    // 2. NEW ACTION: Daily Check-in (Boosts interaction count)
    function checkIn() external {
        require(block.timestamp >= players[msg.sender].lastCheckIn + 1 days, "Already checked in today");
        
        players[msg.sender].lastCheckIn = block.timestamp;
        players[msg.sender].totalDust += DAILY_REWARD;
        
        emit DailyCheckIn(msg.sender, DAILY_REWARD);
    }

    // 3. NEW ACTION: Referral System (Boosts unique addresses)
    function registerReferral(address _referrer) external {
        require(_referrer != msg.sender, "Cannot refer yourself");
        require(!hasPlayed[msg.sender], "Only for new players");
        
        if (!hasPlayed[msg.sender]) {
            playerAddresses.push(msg.sender);
            hasPlayed[msg.sender] = true;
        }
        
        players[_referrer].referralCount += 1;
        players[_referrer].totalDust += 50; // Reward for referring
        
        emit AchievementUnlocked(_referrer, "Recruiter");
    }

    function hasAchievement(address _player, string memory _name) external view returns (bool) {
        return players[_player].achievements[_name];
    }

    // Get total number of players
    function getPlayerCount() external view returns (uint256) {
        return playerAddresses.length;
    }

    // Helper for Leaderboard
    function getTopMiners(uint256 _count) external view returns (address[] memory, uint256[] memory) {
        uint256 total = playerAddresses.length;
        uint256 count = _count > total ? total : _count;
        
        address[] memory addrs = new address[](count);
        uint256[] memory scores = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            address player = playerAddresses[total - 1 - i];
            addrs[i] = player;
            scores[i] = players[player].totalDust;
        }
        
        return (addrs, scores);
    }

    // 4. PAID ACTION (Transfers USDm): Upgrade your tools
    function buyAutoMiner() external {
        require(!players[msg.sender].hasAutoMiner, "Upgrade already purchased");

        require(
            usdmToken.transferFrom(msg.sender, address(this), AUTO_MINER_PRICE),
            "USDm transfer failed"
        );

        players[msg.sender].hasAutoMiner = true;
        emit UpgradePurchased(msg.sender, "Auto-Miner Drone", AUTO_MINER_PRICE);
    }

    function buyLaserPickaxe() external {
        require(
            !players[msg.sender].hasLaserPickaxe,
            "Upgrade already purchased"
        );

        require(
            usdmToken.transferFrom(msg.sender, address(this), LASER_PRICE),
            "USDm transfer failed"
        );

        players[msg.sender].hasLaserPickaxe = true;
        emit UpgradePurchased(msg.sender, "Laser Pickaxe", LASER_PRICE);
    }

    // --- WITHDRAWAL & TRACKING ---

    /**
     * @dev Allows the owner to withdraw all USDm collected from the contract.
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = usdmToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        require(usdmToken.transfer(msg.sender, balance), "Transfer failed");
    }
}
