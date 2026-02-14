// Initial quotes array
let quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Code is like humor. When you have to explain it, it's bad.", category: "Programming" },
    { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
];
// Load quotes from localStorage
function loadQuotes() {
    const savedQuotes = localStorage.getItem("quotes");
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    }
}
// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

loadQuotes();

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const exportBtn = document.getElementById('exportQuotes');
const importFileInput = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');

// Category filter functionality

function populateCategories() {
    const categories = ["all"];

    quotes.forEach(quote => {
        if (!categories.includes(quote.category)) {
            categories.push(quote.category);
        }
    });

    categoryFilter.innerHTML = "";

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore saved filter
    const savedFilter = localStorage.getItem("selectedCategory");
    if (savedFilter) {
        categoryFilter.value = savedFilter;
    }
}
// filter quotes based on category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem("selectedCategory", selectedCategory);

    let filteredQuotes = quotes;

    if (selectedCategory !== "all") {
        filteredQuotes = quotes.filter(
            quote => quote.category === selectedCategory
        );
    }

    displayQuotes(filteredQuotes);
}

categoryFilter.addEventListener("change", filterQuotes);

// display quotes based on filter

function displayQuotes(quotesToDisplay) {
    quoteDisplay.innerHTML = "";

    if (quotesToDisplay.length === 0) {
        quoteDisplay.textContent = "No quotes found for this category.";
        return;
    }

    quotesToDisplay.forEach(quote => {
        const p = document.createElement("p");
        p.innerHTML = `
        "${quote.text}"
        <small>
        ${quote.category}
        </small>`;
        quoteDisplay.appendChild(p);
    });
}

// Show random quote

function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    quoteDisplay.innerHTML = `
        <p>"${quote.text}"</p>
        <small>Category: ${quote.category}</small>
        `;

    // Save last viewed quote in sessionStorage
    sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

newQuoteBtn.addEventListener('click', showRandomQuote);

// Load last viewed quote on page load

function loadLastQuote() {
    const lastQuote = sessionStorage.getItem("lastQuote");
    if (lastQuote) {
        const quote = JSON.parse(lastQuote);
        quoteDisplay.innerHTML = `
        <p>"${quote.text}"</p>
        <small>Category: ${quote.category}</small>
        `;
    }
}

loadLastQuote();

// CreateAddQuoteForm

function createAddQuoteForm() {
    const formDiv = document.getElementById("addQuoteForm");

    formDiv.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
    `;

    document.body.appendChild(formDiv);

    document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// add new quote

function addQuote() {
    const textInput = document.getElementById("newQuoteText").value;
    const categoryInput = document.getElementById("newQuoteCategory").value;

    if (textInput === "" || categoryInput === "") {
        alert("Please fill in both fields.");
        return;
    }

    quotes.push({ text: textInput, category: categoryInput });
    saveQuotes();
    populateCategories();
    filterQuotes();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";


    alert("Quote added successfully!");
}

createAddQuoteForm();

// Export quotes to JSON file
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();

    URL.revokeObjectURL(url);
}

exportBtn.addEventListener("click", exportQuotes);

// Import quotes from JSON file

function importFromJSONFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function (event) {
        const importedQuotes = JSON.parse(event.target.result);

        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
    };

    fileReader.readAsText(event.target.files[0]);
}

importFileInput.addEventListener("change", importFromJSONFile);

// Initial population of categories and display
populateCategories();
filterQuotes();

// Server Simulation

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const syncStatus = document.getElementById("syncStatus");
const syncNowBTn = document.getElementById("syncNow");

function fetchServerQuotes() {
    return fetch(SERVER_URL)
        .then(response => response.json())
        .then(data => {
            // convert fake data to quote format
            return data.slice(0, 5).map(item => ({
                text: item.title,
                category: "Server"
            }));
        });
}
function syncWithServer() {
    syncStatus.textContent = "Syncing with server...";

    fetchServerQuotes().then(serverQuotes => {
        let updated = false;

        serverQuotes.forEach(serverQuote => {
            const exists = quotes.some(
                localQuote => localQuote.text === serverQuote.text
            );

            if (!exists) {
                quotes.push(serverQuote);
                updated = true;
            }
        });

        if (updated) {
            saveQuotes();
            populateCategories();
            filterQuotes();
            syncStatus.textContent = "Server updates applied (server wins)";
            alert("New server quotes were added. Conflicts resolved.");
        } else {
            syncStatus.textContent = "Already up to date";
        }
    });
}
syncNowBTn.addEventListener("click", syncWithServer);

// Auto sync every 30 seconds
setInterval(syncWithServer, 30000);