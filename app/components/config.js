// Saare addresses aur ABI yahan. Zarurat ho to badal lo.

export const TOKEN_ADDRESS = "0x7b0ED090071cb486a6ca12F16f49bd1135BDbeDA";
export const CONTRACT_ADDRESS = "0xB008E05A990819c50c2e4aE31030307aFF78Ad3c";

// Token (BEP20) ABI - sirf jo functions chahiye
export const TOKEN_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Invest contract ABI
export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_userId", "type": "uint256" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "invest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];