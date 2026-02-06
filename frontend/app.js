const apiBase = "http://localhost:4000";

// Wallet state
let walletConnected = false;
let walletAddress = null;
let walletProvider = null;

// DOM Elements
const registerForm = document.getElementById("register-form");
const registerResult = document.getElementById("register-result");
const searchForm = document.getElementById("search-form");
const searchResults = document.getElementById("search-results");
const transferForm = document.getElementById("transfer-form");
const transferResult = document.getElementById("transfer-result");
const licenseForm = document.getElementById("license-form");
const licenseResult = document.getElementById("license-result");
const connectWalletBtn = document.getElementById("connect-wallet");
const walletConnectedSpan = document.getElementById("wallet-connected");
const walletAddressSpan = document.getElementById("wallet-address");
const walletNetworkSpan = document.getElementById("wallet-network");

const prettyPrint = (data) => JSON.stringify(data, null, 2);

// Initialize wallet connection on page load
window.addEventListener("load", async () => {
  await checkWalletConnection();
  await fetchBackendWalletInfo();
});

// Check if wallet is already connected
async function checkWalletConnection() {
  if (typeof window.ethereum === "undefined") {
    walletConnectedSpan.textContent = "MetaMask not installed";
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      walletAddress = accounts[0];
      walletConnected = true;
      updateWalletUI();
    }
  } catch (error) {
    console.error("Error checking wallet connection:", error);
  }
}

// Connect wallet via MetaMask
connectWalletBtn.addEventListener("click", async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask is not installed. Please install it first.");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    walletConnected = true;
    updateWalletUI();
    
    // Set wallet address in register form
    document.querySelector('input[name="owner"]').value = walletAddress;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert("Failed to connect wallet");
  }
});

// Update UI with wallet info
function updateWalletUI() {
  walletConnectedSpan.textContent = walletConnected ? "Connected" : "Disconnected";
  walletAddressSpan.textContent = walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "-";
  connectWalletBtn.textContent = walletConnected ? "Wallet Connected ✓" : "Connect Wallet";
  connectWalletBtn.disabled = walletConnected;
}

// Fetch backend wallet info
async function fetchBackendWalletInfo() {
  try {
    const response = await fetch(`${apiBase}/api/wallet/info`);
    if (response.ok) {
      const data = await response.json();
      walletNetworkSpan.textContent = data.network;
    } else {
      walletNetworkSpan.textContent = "Backend wallet not configured";
    }
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    walletNetworkSpan.textContent = "Error connecting to backend";
  }
}

// Register form submission
// Register form submission
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  if (!walletConnected) {
    registerResult.textContent = "Error: Please connect your wallet first";
    return;
  }

  registerResult.textContent = "Registering...";

  const formData = new FormData(registerForm);
  
  try {
    const response = await fetch(`${apiBase}/api/ip/register`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    registerResult.textContent = prettyPrint(data);
    registerForm.reset();
    document.querySelector('input[name="owner"]').value = walletAddress;
  } catch (error) {
    registerResult.textContent = `Error: ${error.message}`;
  }
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = new FormData(searchForm).get("query");
  if (!query) {
    searchResults.textContent = "Enter a keyword or hash.";
    return;
  }
  const response = await fetch(`${apiBase}/api/ip/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  searchResults.textContent = prettyPrint(data);
});

transferForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  transferResult.textContent = "Submitting transfer...";
  const payload = Object.fromEntries(new FormData(transferForm));
  const response = await fetch(`${apiBase}/api/ip/${payload.id}/transfer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      newOwner: payload.newOwner,
      note: payload.note
    })
  });

  const data = await response.json();
  transferResult.textContent = prettyPrint(data);
});

licenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  licenseResult.textContent = "Saving license terms...";
  const payload = Object.fromEntries(new FormData(licenseForm));
  const response = await fetch(`${apiBase}/api/ip/${payload.id}/license`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      price: payload.price,
      durationDays: payload.durationDays
    })
  });

  const data = await response.json();
  licenseResult.textContent = prettyPrint(data);
});
