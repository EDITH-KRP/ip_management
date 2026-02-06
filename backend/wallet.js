import { Wallet, JsonRpcProvider, Contract, ethers } from "ethers";
import fs from "fs";

// Initialize wallet and contract
export const initializeWallet = () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";
  const privateKey = process.env.WALLET_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY not set in environment variables");
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  return { wallet, provider };
};

// Contract ABI - Update with your deployed contract address
const CONTRACT_ABI = [
  "function registerIP(bytes32 ipHash, string calldata metadataURI) external returns (uint256)",
  "function transferIP(uint256 id, address newOwner, string calldata note) external",
  "function setLicenseTerms(uint256 id, uint256 price, uint256 duration) external",
  "function purchaseLatestLicense(uint256 id) external payable",
  "function getRecord(uint256 id) external view returns (address owner, uint256 timestamp, bytes32 ipHash, string memory metadataURI)",
  "function getLicenseCount(uint256 id) external view returns (uint256)",
  "function getTransferCount(uint256 id) external view returns (uint256)"
];

export const getContract = (wallet) => {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS not set in environment variables");
  }

  return new Contract(contractAddress, CONTRACT_ABI, wallet);
};

// Register IP on blockchain
export const registerIPOnChain = async (wallet, ipHash, metadataURI) => {
  try {
    const contract = getContract(wallet);
    const tx = await contract.registerIP(ipHash, metadataURI);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      success: receipt.status === 1
    };
  } catch (error) {
    console.error("Error registering IP on chain:", error.message);
    throw error;
  }
};

// Transfer IP ownership on blockchain
export const transferIPOnChain = async (wallet, ipId, newOwner, note) => {
  try {
    const contract = getContract(wallet);
    const tx = await contract.transferIP(ipId, newOwner, note);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      success: receipt.status === 1
    };
  } catch (error) {
    console.error("Error transferring IP on chain:", error.message);
    throw error;
  }
};

// Set license terms on blockchain
export const setLicenseTermsOnChain = async (wallet, ipId, price, durationDays) => {
  try {
    const contract = getContract(wallet);
    const durationSeconds = durationDays * 24 * 60 * 60;
    const tx = await contract.setLicenseTerms(ipId, price, durationSeconds);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      success: receipt.status === 1
    };
  } catch (error) {
    console.error("Error setting license terms on chain:", error.message);
    throw error;
  }
};

// Get wallet address
export const getWalletAddress = (wallet) => {
  return wallet.address;
};
