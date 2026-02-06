const apiBase = "http://localhost:4000";

// DOM Elements
const registerForm = document.getElementById("register-form");
const registerResult = document.getElementById("register-result");
const searchForm = document.getElementById("search-form");
const searchResults = document.getElementById("search-results");
const transferForm = document.getElementById("transfer-form");
const transferResult = document.getElementById("transfer-result");
const licenseForm = document.getElementById("license-form");
const licenseResult = document.getElementById("license-result");
const backendStatusSpan = document.getElementById("backend-status");
const serverWalletAddressSpan = document.getElementById("server-wallet-address");
const serverNetworkSpan = document.getElementById("server-network");

const prettyPrint = (data) => JSON.stringify(data, null, 2);

// Initialize on page load
window.addEventListener("load", async () => {
  console.log("Page loaded, checking server status...");
  await fetchBackendStatus();
});

// Fetch backend wallet info and status
async function fetchBackendStatus() {
  try {
    const response = await fetch(`${apiBase}/api/wallet/info`);
    if (response.ok) {
      const data = await response.json();
      backendStatusSpan.textContent = "✓ Connected";
      backendStatusSpan.style.color = "green";
      serverWalletAddressSpan.textContent = data.address
        ? `${data.address.substring(0, 6)}...${data.address.substring(38)}`
        : "Configured";
      serverNetworkSpan.textContent = data.network;
      console.log("Backend wallet initialized:", data.address);
    } else {
      backendStatusSpan.textContent = "⚠ Not Ready";
      backendStatusSpan.style.color = "orange";
      serverWalletAddressSpan.textContent = "Pending";
      serverNetworkSpan.textContent = "Checking...";
    }
  } catch (error) {
    console.error("Error fetching backend status:", error);
    backendStatusSpan.textContent = "✗ Offline";
    backendStatusSpan.style.color = "red";
    serverWalletAddressSpan.textContent = "Error";
    serverNetworkSpan.textContent = "Connection failed";
  }
}

// Register form submission
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  registerResult.textContent = "Registering IP (server-side)...";

  const formData = new FormData(registerForm);

  try {
    console.log("Submitting registration to backend...");
    const response = await fetch(`${apiBase}/api/ip/register`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      registerResult.innerHTML = `
        <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <h4 style="color: #2e7d32; margin-top: 0;">✓ IP Registered Successfully</h4>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto;">
${prettyPrint(data)}
          </pre>
          <p style="color: #666; font-size: 0.9rem;">
            <strong>All transactions have been logged and recorded on the server for security and audit purposes.</strong>
          </p>
        </div>
      `;
      registerForm.reset();
      console.log("Registration successful:", data);
    } else {
      registerResult.innerHTML = `
        <div style="background: #ffebee; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <h4 style="color: #c62828; margin-top: 0;">✗ Registration Failed</h4>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto;">
${prettyPrint(data)}
          </pre>
        </div>
      `;
      console.error("Registration error:", data);
    }
  } catch (error) {
    registerResult.innerHTML = `
      <div style="background: #ffebee; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <h4 style="color: #c62828; margin-top: 0;">✗ Error</h4>
        <p>${error.message}</p>
      </div>
    `;
    console.error("Error:", error);
  }
});

// Search form submission
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = new FormData(searchForm).get("query");
  
  if (!query) {
    searchResults.textContent = "Enter a keyword or hash to search.";
    return;
  }
  
  searchResults.textContent = "Searching...";
  
  try {
    const response = await fetch(`${apiBase}/api/ip/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (response.ok && data.results && data.results.length > 0) {
      searchResults.innerHTML = `
        <div style="margin-top: 1rem;">
          <h4>Found ${data.results.length} result(s)</h4>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto;">
${prettyPrint(data)}
          </pre>
        </div>
      `;
    } else {
      searchResults.innerHTML = `
        <div style="background: #fff3e0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <p>No results found for: <strong>${query}</strong></p>
        </div>
      `;
    }
  } catch (error) {
    searchResults.textContent = `Error: ${error.message}`;
    console.error("Search error:", error);
  }
});

// Transfer form submission
transferForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  transferResult.textContent = "Submitting transfer request (server-side)...";
  
  const payload = Object.fromEntries(new FormData(transferForm));
  
  try {
    console.log("Submitting transfer to backend...");
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

    if (response.ok) {
      transferResult.innerHTML = `
        <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <h4 style="color: #2e7d32; margin-top: 0;">✓ Transfer Processed</h4>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto;">
${prettyPrint(data)}
          </pre>
          <p style="color: #666; font-size: 0.9rem;">
            <strong>Transfer has been logged and recorded on the server.</strong>
          </p>
        </div>
      `;
      transferForm.reset();
      console.log("Transfer successful:", data);
    } else {
      transferResult.innerHTML = `
        <div style="background: #ffebee; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <h4 style="color: #c62828; margin-top: 0;">✗ Transfer Failed</h4>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto;">
${prettyPrint(data)}
          </pre>
        </div>
      `;
    }
  } catch (error) {
    transferResult.innerHTML = `
      <div style="background: #ffebee; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <h4 style="color: #c62828; margin-top: 0;">✗ Error</h4>
        <p>${error.message}</p>
      </div>
    `;
    console.error("Transfer error:", error);
  }
});

// License form submission
licenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  licenseResult.textContent = "Setting license terms (server-side)...";
  
  const payload = Object.fromEntries(new FormData(licenseForm));
  
  try {
    console.log("Submitting license terms to backend...");
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

    if (response.ok) {
      licenseResult.innerHTML = `
        <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <h4 style="color: #2e7d32; margin-top: 0;">✓ License Terms Set</h4>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto;">
${prettyPrint(data)}
          </pre>
          <p style="color: #666; font-size: 0.9rem;">
            <strong>License terms have been logged and recorded on the server.</strong>
          </p>
        </div>
      `;
      licenseForm.reset();
      console.log("License terms set successfully:", data);
    } else {
      licenseResult.innerHTML = `
        <div style="background: #ffebee; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <h4 style="color: #c62828; margin-top: 0;">✗ Failed to Set License</h4>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto;">
${prettyPrint(data)}
          </pre>
        </div>
      `;
    }
  } catch (error) {
    licenseResult.innerHTML = `
      <div style="background: #ffebee; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <h4 style="color: #c62828; margin-top: 0;">✗ Error</h4>
        <p>${error.message}</p>
      </div>
    `;
    console.error("License error:", error);
  }
});
