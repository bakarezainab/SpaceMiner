export const CONTRACT_ADDRESS = "0x9F3fe1Eeeb2228b9385BD9ad8cB850821eF71720"; // Deployed on Celo Mainnet ✅
export const USDM_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

export const CELO_SPACE_MINER_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_dustMined",
        "type": "uint256"
      }
    ],
    "name": "saveGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkIn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_referrer",
        "type": "address"
      }
    ],
    "name": "registerReferral",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_player",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "hasAchievement",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyAutoMiner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyLaserPickaxe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_count", "type": "uint256" }
    ],
    "name": "getTopMiners",
    "outputs": [
      { "internalType": "address[]", "name": "", "type": "address[]" },
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "players",
    "outputs": [
      { "internalType": "uint256", "name": "totalDust", "type": "uint256" },
      { "internalType": "bool", "name": "hasAutoMiner", "type": "bool" },
      { "internalType": "bool", "name": "hasLaserPickaxe", "type": "bool" },
      { "internalType": "uint256", "name": "lastCheckIn", "type": "uint256" },
      { "internalType": "uint256", "name": "referralCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayerCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const USDM_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
