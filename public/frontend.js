let allEvents = [];
let filteredEvents = [];
let currentPage = 1;
let pageSize = 25;

/* ================= NORMALIZE ================= */
function normalize(addr) {
  return addr?.toLowerCase().replace(/^0x0+/, "0x");
}

/* ================= LOAD STATS ================= */
async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();

    document.getElementById("totalRegistered").innerText =
      data.totalRegistered || 0;
    document.getElementById("uniqueAddresses").innerText =
      data.uniqueAddresses || 0;
    document.getElementById("ogMinters").innerText =
      data.ogMinters || 0;
    document.getElementById("totalOgRegistered").innerText =
      data.totalOgRegistered || 0;

  } catch (err) {
    console.error("Stats error", err);
  }
}

/* ================= LOAD EVENTS ================= */
async function loadEvents() {
  try {
    const res = await fetch("/api/events");
    allEvents = await res.json();
    filteredEvents = allEvents;
    renderEvents();
  } catch (err) {
    console.error("Events error", err);
  }
}

/* ================= SEARCH ================= */
async function checkWallet() {
  const input = document.getElementById("walletInput").value.trim();
  if (!input) {
    alert("Enter wallet address");
    return;
  }

  const address = normalize(input);

  try {
    const res = await fetch(`/api/search/${address}`);
    const data = await res.json();

    // ❌ NOT registered
    if (!data.registered) {
      alert("Wallet not registered");
      return;
    }

    // ✅ REGISTERED
    filteredEvents = data.events;
    currentPage = 1;
    renderEvents();

  } catch (err) {
    console.error("Search error:", err);
    alert("Search failed");
  }
}

/* ================= PAGINATION ================= */
function changePageSize(size) {
  pageSize = Number(size);
  currentPage = 1;
  renderEvents();
}

function nextPage() {
  if (currentPage * pageSize < filteredEvents.length) {
    currentPage++;
    renderEvents();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderEvents();
  }
}

/* ================= RENDER ================= */
function renderEvents() {
  const tbody = document.getElementById("eventsBody");
  const cards = document.getElementById("cardsView");

  tbody.innerHTML = "";
  cards.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const pageData = filteredEvents.slice(start, start + pageSize);

  document.getElementById("pageInfo").innerText =
    `Page ${currentPage}`;

  pageData.forEach(e => {
    // TABLE
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Register</td>
      <td>${e.address}</td>
      <td>${e.tx}</td>
      <td>${e.block}</td>
      <td>${e.time}</td>
      <td class="success">Success</td>
      <td>${e.og ? "✅" : "-"}</td>
    `;
    tbody.appendChild(tr);

    // MOBILE CARD
    const card = document.createElement("div");
    card.className = "tx-card";
    card.innerHTML = `
      <div class="card-header">
        <span class="pill verified">Verified</span>
        <span class="pill success">Success</span>
        ${e.og ? `<span class="pill og">OG</span>` : ""}
      </div>
      <div class="card-body">
        <span>User</span><b>${e.address}</b>
        <span>Tx</span><b>${e.tx}</b>
        <span>Block</span><b>${e.block}</b>
        <span>Time</span><b>${e.time}</b>
      </div>
    `;
    cards.appendChild(card);
  });
}

/* ================= INIT ================= */
loadStats();
loadEvents();
