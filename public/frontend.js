// =======================
// CONFIG
// =======================
let visibleEvents = [];
let allEvents = [];
let PAGE_SIZE = 25;
let currentPage = 1;

// =======================
// HELPERS
// =======================
function shortAddr(addr) {
  if (!addr || addr.length < 10) return addr;
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatTime(ts) {
  return new Date(ts).toLocaleString();
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// =======================
// LOAD STATS
// =======================
async function loadStats() {
  const res = await fetch("/api/stats");
  const stats = await res.json();

  document.getElementById("totalRegistered").innerText = stats.totalRegistered;
  document.getElementById("ogMinters").innerText = stats.ogMinters;
  document.getElementById("uniqueAddresses").innerText = stats.uniqueAddresses;
  document.getElementById("totalOgRegistered").innerText = stats.totalOgRegistered;
}

// =======================
// LOAD EVENTS
// =======================
async function loadEvents() {
  const res = await fetch("/api/events");
  allEvents = await res.json();
  visibleEvents = allEvents;
  currentPage = 1;
  renderEvents();
}

// =======================
// RENDER EVENTS
// =======================
function renderEvents() {
  const tbody = document.getElementById("eventsBody");
  const cards = document.getElementById("cardsView");

  tbody.innerHTML = "";
  cards.innerHTML = "";

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageData = visibleEvents.slice(start, start + PAGE_SIZE);

  if (!pageData.length) return;

  pageData.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Verified</td>
      <td title="${e.address}">${shortAddr(e.address)}</td>
      <td title="${e.tx}">${shortAddr(e.tx)}</td>
      <td>${e.block}</td>
      <td>${formatTime(e.time)}</td>
      <td class="success">success</td>
      <td>${e.og ? "⭐️ YES" : "NO"}</td>
    `;
    tbody.appendChild(tr);

    const card = document.createElement("div");
    card.className = "tx-card";
    card.innerHTML = `
      <div class="card-header">
        <span class="pill verified">✔️ Verified</span>
        ${e.og ? `<span class="pill og">👑 OG</span>` : ""}
        <span class="pill success">Success</span>
      </div>
      <div class="card-body">
        <div><span>User</span><b>${shortAddr(e.address)}</b></div>
        <div><span>Tx</span><b>${shortAddr(e.tx)}</b></div>
        <div><span>Block</span><b>${e.block}</b></div>
        <div><span>Age</span><b>${timeAgo(e.time)}</b></div>
      </div>
    `;
    cards.appendChild(card);
  });

  document.getElementById("pageInfo").innerText =
    `Page ${currentPage} / ${Math.ceil(visibleEvents.length / PAGE_SIZE)}`;
}

// =======================
// PAGINATION
// =======================
function nextPage() {
  if (currentPage * PAGE_SIZE < visibleEvents.length) {
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
  PAGE_SIZE = parseInt(size, 10);
  currentPage = 1;
  renderEvents();
}

// =======================
// SEARCH
// =======================
window.checkWallet = async function () {
  const input = document.getElementById("walletInput").value.trim();

  if (!input) {
    alert("Enter wallet address");
    return;
  }

  const url = `/api/search?address=${encodeURIComponent(input.toLowerCase())}`;

  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    console.error("Fetch failed:", e);
    alert("Network error");
    return;
  }

  if (!res.ok) {
    alert("Wallet not found");
    return;
  }

  const data = await res.json();

  if (!data.registered || !data.events.length) {
    alert("Wallet not registered");
    return;
  }

  visibleEvents = data.events;   // ✅ CRITICAL
  currentPage = 1;
  renderEvents();
};

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadEvents();
});
