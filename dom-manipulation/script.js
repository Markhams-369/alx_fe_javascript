// --- Initial Quotes Array ---
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it's bad.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" }
];

// --- DOM Elements ---
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteFormDiv = document.getElementById('addQuoteForm');
const exportBtn = document.getElementById('exportQuotes');
const importFileInput = document.getElementById('importFile');
const syncStatus = document.getElementById("syncStatus");
const syncNowBtn = document.getElementById("syncNow");
const notification = document.getElementById("notification");

// --- Local Storage ---
function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  if (saved) quotes = JSON.parse(saved);
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveLastFilter(category) {
  localStorage.setItem("selectedCategory", category);
}

function getLastFilter() {
  return localStorage.getItem("selectedCategory") || "all";
}

// --- Populate Categories ---
function populateCategories() {
  const categories = ["all"];
  quotes.forEach(q => { if (!categories.includes(q.category)) categories.push(q.category); });

  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = getLastFilter();
}

// --- Filter Quotes ---
function filterQuotes() {
  saveLastFilter(categoryFilter.value);

  const selected = categoryFilter.value;
  let filtered = quotes;
  if (selected !== "all") filtered = quotes.filter(q => q.category === selected);

  displayQuotes(filtered);
}

// --- Display Quotes ---
function displayQuotes(list) {
  quoteDisplay.innerHTML = "";
  if (list.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }
  list.forEach(q => {
    const p = document.createElement("p");
    p.innerHTML = `"${q.text}" <br><small>${q.category}</small>`;
    quoteDisplay.appendChild(p);
  });
}

// --- Show Random Quote ---
function showRandomQuote() {
  const selected = categoryFilter.value;
  let filtered = quotes;
  if (selected !== "all") filtered = quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>${quote.category}</small>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

newQuoteBtn.addEventListener("click", showRandomQuote);

// --- Load Last Viewed Quote ---
function loadLastQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    quoteDisplay.innerHTML = `<p>"${q.text}"</p><small>${q.category}</small>`;
  }
}

// --- Add Quote Form ---
function createAddQuoteForm() {
  addQuoteFormDiv.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteTextInput" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategoryInput" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

function addQuote() {
  const text = document.getElementById("newQuoteTextInput").value.trim();
  const category = document.getElementById("newQuoteCategoryInput").value.trim();

  if (!text || !category) {
    notification.textContent = "Please fill in both fields.";
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteTextInput").value = "";
  document.getElementById("newQuoteCategoryInput").value = "";
  notification.textContent = "Quote added successfully!";
  setTimeout(() => notification.textContent = "", 3000);
}

// --- Export / Import ---
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJSONFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid JSON format");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      notification.textContent = "Quotes imported successfully!";
      setTimeout(() => notification.textContent = "", 3000);
    } catch (err) {
      notification.textContent = "Error importing JSON.";
      console.error(err);
    }
  };
  reader.readAsText(event.target.files[0]);
}

if (exportBtn) exportBtn.addEventListener("click", exportQuotes);
if (importFileInput) importFileInput.addEventListener("change", importFromJSONFile);

// --- Category Filter Event ---
if (categoryFilter) categoryFilter.addEventListener("change", filterQuotes);

// --- Server Sync Simulation ---
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  const res = await fetch(SERVER_URL);
  const data = await res.json();
  return data.slice(0,5).map(item => ({ text: item.title, category: "Server" }));
}

async function syncWithServer() {
  syncStatus.textContent = "Syncing with server...";
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let updated = false;

    serverQuotes.forEach(sq => {
      if (!quotes.some(lq => lq.text === sq.text)) {
        quotes.push(sq);
        updated = true;
      }
    });

    if (updated) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      syncStatus.textContent = "Server updates applied (server wins)";
      notification.textContent = "New server quotes added!";
      setTimeout(() => notification.textContent = "", 3000);
    } else {
      syncStatus.textContent = "Already up to date";
    }
  } catch (err) {
    syncStatus.textContent = "Error syncing with server";
    console.error(err);
  }
}

if (syncNowBtn) syncNowBtn.addEventListener("click", syncWithServer);
setInterval(syncWithServer, 30000);

// --- Initialize App ---
loadQuotes();
populateCategories();
loadLastQuote();
createAddQuoteForm();
filterQuotes();
syncWithServer();
