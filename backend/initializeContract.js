import { initializeWallet } from "./wallet.js";

// Check if all required environment variables are set
export function checkRequirements() {
  const required = [
    "SEPOLIA_RPC_URL",
    "WALLET_PRIVATE_KEY",
    "CONTRACT_ADDRESS",
    "FILEBASE_API_KEY",
    "FILEBASE_API_SECRET"
  ];

  const missing = required.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    return false;
  }

  return true;
}

// Initialize contract (validate that it's deployed)
export async function initializeContract() {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;

    // Check if contract address is valid (not a placeholder)
    if (contractAddress === "your_deployed_contract_address_here" || !contractAddress) {
      console.warn("⚠️  CONTRACT_ADDRESS not properly configured");
      return false;
    }

    // Validate wallet is accessible
    try {
      const { wallet } = initializeWallet();
      console.log("✓ Wallet initialized:", wallet.address);
      console.log("✓ Contract address configured:", contractAddress);
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize wallet:", error.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Contract initialization failed:", error.message);
    return false;
  }
}
