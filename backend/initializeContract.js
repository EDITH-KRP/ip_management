import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env");

// Check if CONTRACT_ADDRESS is already set
function isContractDeployed() {
  if (!fs.existsSync(envPath)) {
    return false;
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  const contractLine = envContent.split("\n").find((line) => line.startsWith("CONTRACT_ADDRESS="));

  if (!contractLine) {
    return false;
  }

  const address = contractLine.split("=")[1]?.trim();
  return address && address.startsWith("0x") && address.length === 42;
}

// Deploy contract and update .env
export async function initializeContract() {
  if (isContractDeployed()) {
    console.log("✓ Smart contract already deployed");
    return true;
  }

  console.log("📝 Deploying smart contract to Sepolia...");

  try {
    // Run hardhat deployment
    execSync("npx hardhat run contracts/deploy.js --network sepolia", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit"
    });

    console.log("✓ Contract deployed and .env updated successfully!");
    return true;
  } catch (error) {
    console.error("❌ Contract deployment failed:", error.message);
    console.error("\nTo deploy manually, run:");
    console.error("  npx hardhat run contracts/deploy.js --network sepolia");
    return false;
  }
}

// Check environment requirements
export function checkRequirements() {
  if (!fs.existsSync(envPath)) {
    console.error("❌ Error: backend/.env file not found!");
    console.error("Please create it first:");
    console.error("  cp backend/.env.example backend/.env");
    return false;
  }

  const envContent = fs.readFileSync(envPath, "utf-8");

  const required = ["SEPOLIA_RPC_URL", "WALLET_PRIVATE_KEY", "FILEBASE_API_KEY", "FILEBASE_API_SECRET"];
  const missing = required.filter((key) => !envContent.includes(`${key}=`) || envContent.includes(`${key}=your_`));

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nPlease update backend/.env with your credentials");
    return false;
  }

  return true;
}
