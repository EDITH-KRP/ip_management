const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying IPRegistry contract to Sepolia...");

  // Get the contract factory
  const IPRegistry = await ethers.getContractFactory("IPRegistry");

  // Deploy the contract
  const contract = await IPRegistry.deploy();
  await contract.deployed();

  const contractAddress = contract.address;
  console.log("✓ IPRegistry deployed to:", contractAddress);

  // Update .env file automatically
  const envPath = path.join(__dirname, "../backend/.env");
  
  try {
    let envContent = "";
    
    // Read existing .env if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    // Update or add CONTRACT_ADDRESS
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      // Replace existing CONTRACT_ADDRESS
      envContent = envContent.replace(
        /CONTRACT_ADDRESS=.*/,
        `CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      // Append new CONTRACT_ADDRESS
      envContent += `\n# Smart Contract Address\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }

    // Write updated .env
    fs.writeFileSync(envPath, envContent);
    console.log("✓ Updated .env file with CONTRACT_ADDRESS");
  } catch (error) {
    console.warn("⚠ Could not auto-update .env file:", error.message);
    console.log("Please manually add this to your backend/.env:");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
