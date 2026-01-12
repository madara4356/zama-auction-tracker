let allEvents = [];
let filteredEvents = [];
let currentPage = 1;
let pageSize = 25;

/* =====================
   HELPERS
===================== */
function normalize(addr) {
  return addr.toLowerCase().trim().replace(/^0x0+/, "0x");
}

function short(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

/* =====================
   LOAD STATS
===================== */
async function loadStats() {
  const res = await fetch("/api/stats");
  const data = await res.json();

  document.getElementById("totalRegistered").innerText = data.totalRegistered;
  document.getElementById("ogMinters").innerText = data.ogMinters;
  document.getElementById("uniqueAddresses").innerText = data.uniqueAddresses;
  document.getElementById("totalOgRegistered").innerText =
    data.totalOgRegistered;
}

/* =====================
   LOAD EVENTS
===================== */
async function loadEvents() {
  const res = await fetch("/api/events");
  allEvents = await res.json();
  filteredEvents = allEvents;
  renderEvents();
}

/* =====================
   SEARCH WALLET (FIXED)
===================== */
async function checkWallet() {
  const input = document.getElementById("walletInput").value;
  if (!input) {
    alert("Enter wallet address");
    return;
  }

  const address = normalize(input);
  const url = `/api/search?address=${encodeURIComponent(address)}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error("Search HTTP error", res.status);
      alert("Search failed");
      return;
    }

    const data = await res.json();

    if (!data.registered) {
      alert("Wallet not registered");
      return;
    }

    filteredEvents = data.events;
    currentPage = 1;
    renderEvents();

  } catch (err) {
    console.error("Search error:", err);
    alert("Search failed");
  }
}

/* =====================
   RENDER EVENTS
===================== */
function renderEvents() {
  const tbody = document.getElementById("eventsBody");
  const cards = document.getElementById("cardsView");

  tbody.innerHTML = "";
  cards.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const pageItems = filteredEvents.slice(start, start + pageSize);

  pageItems.forEach(e => {
    /* TABLE */
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Register</td>
      <td>${short(e.address)}</td>
      <td>${short(e.tx)}</td>
      <td>${e.block}</td>
      <td>${e.time}</td>
      <td class="success">Success</td>
      <td>${e.og ? "✅" : "—"}</td>
    `;
    tbody.appendChild(tr);

    /* MOBILE CARD */
    const card = document.createElement("div");
    card.className = "tx-card";
    card.innerHTML = `
      <div class="card-header">
        <span class="pill verified">Verified</span>
        <span class="pill success">Success</span>
        ${e.og ? '<span class="pill og">OG</span>' : ""}
      </div>
      <div class="card-body">
        <span>User</span><b>${short(e.address)}</b>
        <span>Tx</span><b>${short(e.tx)}</b>
        <span>Block</span><b>${e.block}</b>
        <span>Time</span><b>${e.time}</b>
      </div>
    `;
    cards.appendChild(card);
  });

  document.getElementById("pageInfo").innerText =
    `Page ${currentPage}`;
}

/* =====================
   PAGINATION
===================== */
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

function changePageSize(size) {
  pageSize = Number(size);
  currentPage = 1;
  renderEvents();
}

/* =====================
   INIT
===================== */
loadStats();
loadEvents();
