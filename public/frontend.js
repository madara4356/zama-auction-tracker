// =======================
// CONFIG
// =======================
let PAGE_SIZE = 25;
let currentPage = 1;
let allEvents = [];
let visibleEvents = [];

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

  // ✅ sort: most recent first
  allEvents.sort((a, b) => new Date(b.time) - new Date(a.time));

  visibleEvents = allEvents;
  currentPage = 1;
  renderEvents();
}

// =======================
// RENDER
// =======================
function renderEvents() {
  const tbody = document.getElementById("eventsBody");
  const cards = document.getElementById("cardsView");

  tbody.innerHTML = "";
  cards.innerHTML = "";

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageData = visibleEvents.slice(start, start + PAGE_SIZE);

  pageData.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Verified</td>
      <td>${shortAddr(e.address)}</td>
      <td>${shortAddr(e.tx)}</td>
      <td>${e.block}</td>
      <td>${formatTime(e.time)}</td>
      <td class="success">success</td>
      <td>${e.og ? "⭐ YES" : "NO"}</td>
    `;
    tbody.appendChild(tr);

    const card = document.createElement("div");
    card.className = "tx-card";
    card.innerHTML = `
      <div class="card-header">
        <span class="pill verified">✔ Verified</span>
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
  if (!input) return alert("Enter wallet address");

  const res = await fetch(`/api/search?address=${encodeURIComponent(input)}`);
  const data = await res.json();

  if (!data.registered || !data.events.length) {
    alert("Wallet not registered");
    return;
  }

  visibleEvents = data.events;   // 🔥 THIS WAS MISSING
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
