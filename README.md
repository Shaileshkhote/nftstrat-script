# NFT Strategy - OpenSea Automated Buyer

A Node.js application for programmatically purchasing NFTs from OpenSea listings through a custom NFT Strategy smart contract.

## 🎯 Overview

This project enables automated NFT purchases from OpenSea using the Seaport protocol. It fetches the best available listing for a specified NFT and executes the purchase through your NFT Strategy contract, allowing for custom logic and batch operations.

## ✨ Features

- **Multi-Collection Support**: Pre-configured for Moonbirds, Bored Ape Yacht Club, and Meebits
- **OpenSea API Integration**: Fetches real-time listing data and fulfillment parameters
- **Seaport Protocol**: Uses OpenSea's Seaport v1.6 for secure transactions
- **Custom Strategy Contract**: Routes purchases through your own strategy contract
- **Gas Optimization**: Configurable gas settings with EIP-1559 support
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js v16 or higher
- npm or yarn package manager
- Ethereum wallet with sufficient ETH
- OpenSea API key (optional but recommended for higher rate limits)
- Deployed NFT Strategy contract

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nftstrat
```

2. Install dependencies:
```bash
npm install
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root (never commit this file):

```env
PRIVATE_KEY=your_private_key_here
OPENSEA_API_KEY=your_opensea_api_key_here
```

### Update Configuration in Files

Each script (`moonbird.js`, `ape.js`, `meebits.js`) has configurable parameters:

```javascript
const RPC_URL = "https://ethereum-rpc.publicnode.com";
const PRIVATE_KEY = "";  // Or use process.env.PRIVATE_KEY
const NFT_STRATEGY_ADDRESS = "0x6BCba7Cd81a5F12c10Ca1BF9B36761CC382658E8";
const TOKEN_ID = "5077";  // The specific NFT token ID you want to buy
const OPENSEA_API_KEY = "";  // Or use process.env.OPENSEA_API_KEY
```

### Gas Configuration

The scripts are configured with:
- Gas Limit: 800,000
- Max Priority Fee: 1 gwei
- Max Fee Per Gas: 3 gwei

Adjust these values based on network conditions.

## 📁 Project Structure

```
nftstrat/
├── moonbird.js       # Script for buying Moonbirds NFTs
├── ape.js           # Script for buying BAYC NFTs
├── meebits.js       # Script for buying Meebits NFTs
├── package.json     # Node.js dependencies
├── .gitignore       # Git ignore configuration
└── README.md        # This file
```

## 🎮 Usage

### Buying an NFT

1. Configure the script with your target NFT:
   - Set the `TOKEN_ID` to the NFT you want to purchase
   - Add your `PRIVATE_KEY` and `OPENSEA_API_KEY`

2. Run the appropriate script:

```bash
# For Moonbirds
node moonbird.js

# For Bored Ape Yacht Club
node ape.js

# For Meebits
node meebits.js
```

### What Happens During Execution

1. **Fetches Best Listing**: Queries OpenSea API for the lowest priced listing
2. **Gets Fulfillment Data**: Retrieves transaction parameters from OpenSea
3. **Prepares Transaction**: Encodes the Seaport fulfillment call
4. **Executes Purchase**: Calls your NFT Strategy contract with the fulfillment data
5. **Confirms Transaction**: Waits for blockchain confirmation

## 🏗️ NFT Strategy Contract

The NFT Strategy contract must implement:

```solidity
function buyTargetNFT(
    uint256 value,
    bytes calldata data,
    uint256 expectedId,
    address target
) external payable
```

Parameters:
- `value`: Amount of ETH for the transaction
- `data`: Encoded Seaport fulfillment call
- `expectedId`: Expected NFT token ID (for validation)
- `target`: Seaport contract address

## 🔐 Security Considerations

- **Never commit private keys**: Always use environment variables
- **API Key Protection**: Keep your OpenSea API key secure
- **Contract Verification**: Ensure your NFT Strategy contract is audited
- **Test First**: Always test on testnet before mainnet transactions
- **Gas Price Check**: Monitor current gas prices before executing

## 🛠️ Troubleshooting

### Common Issues

1. **"No listings found for this NFT"**
   - The NFT may not be listed for sale
   - Check the token ID is correct

2. **"OpenSea API error"**
   - Verify your API key is valid
   - Check API rate limits

3. **Transaction Failed**
   - Ensure sufficient ETH balance
   - Check gas settings
   - Verify contract permissions

## 📦 Dependencies

- `ethers` (v6.15.0) - Ethereum library
- `@opensea/seaport-js` (v4.0.5) - Seaport SDK
- `node-fetch` - HTTP client for API calls

## 📄 License

This project is for educational purposes. Use at your own risk.

## ⚠️ Disclaimer

This software interacts with smart contracts and handles real cryptocurrency transactions. Always:
- Understand the code before running
- Test thoroughly on testnet first
- Be aware of the financial risks
- Never share your private keys

## 🤝 Support

For issues or questions, please open an issue in the repository.
# nftstrat-script
