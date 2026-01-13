// =======================
// CONFIG
// =======================
const ETHERSCAN_BASE = "https://etherscan.io";

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
  document.getElementById("totalOgRegistered").innerText =
    stats.totalOgRegistered;
}

// =======================
// LOAD EVENTS
// =======================
async function loadEvents() {
  const res = await fetch("/api/events");
  allEvents = await res.json();

  // ✅ newest first
  allEvents.sort((a, b) => new Date(b.time) - new Date(a.time));

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
    // TABLE (DESKTOP)
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Verified</td>
      <td>
        <a href="${ETHERSCAN_BASE}/address/${e.address}" target="_blank" class="link">
          ${shortAddr(e.address)}
        </a>
      </td>
      <td>
        <a href="${ETHERSCAN_BASE}/tx/${e.tx}" target="_blank" class="link">
          ${shortAddr(e.tx)}
        </a>
      </td>
      <td>${e.block}</td>
      <td>${formatTime(e.time)}</td>
      <td class="success">success</td>
      <td>${e.og ? "⭐️ YES" : "NO"}</td>
    `;
    tbody.appendChild(tr);

    // CARD (MOBILE)
    const card = document.createElement("div");
    card.className = "tx-card";
    card.innerHTML = `
      <div class="card-header">
        <span class="pill verified">✔️ Verified</span>
        ${e.og ? `<span class="pill og">👑 OG</span>` : ""}
        <span class="pill success">Success</span>
      </div>

      <div class="card-body">
        <div>
          <span>User</span>
          <b>
            <a href="${ETHERSCAN_BASE}/address/${e.address}" target="_blank" class="link">
              ${shortAddr(e.address)}
            </a>
          </b>
        </div>
        <div>
          <span>Tx</span>
          <b>
            <a href="${ETHERSCAN_BASE}/tx/${e.tx}" target="_blank" class="link">
              ${shortAddr(e.tx)}
            </a>
          </b>
        </div>
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

  const res = await fetch(
    `/api/search?address=${encodeURIComponent(input)}`
  );

  if (!res.ok) {
    alert("Wallet not found");
    return;
  }

  const data = await res.json();

  if (!data.registered || !data.events.length) {
    alert("Wallet not registered");
    return;
  }

  // 🔥 important
  visibleEvents = data.events;
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
