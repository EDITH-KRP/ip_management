const apiBase = "http://localhost:4000";

const registerForm = document.getElementById("register-form");
const registerResult = document.getElementById("register-result");
const searchForm = document.getElementById("search-form");
const searchResults = document.getElementById("search-results");
const transferForm = document.getElementById("transfer-form");
const transferResult = document.getElementById("transfer-result");
const licenseForm = document.getElementById("license-form");
const licenseResult = document.getElementById("license-result");

const prettyPrint = (data) => JSON.stringify(data, null, 2);

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  registerResult.textContent = "Registering...";

  const formData = new FormData(registerForm);
  const response = await fetch(`${apiBase}/api/ip/register`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  registerResult.textContent = prettyPrint(data);
  registerForm.reset();
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
