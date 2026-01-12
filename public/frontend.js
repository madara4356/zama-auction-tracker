// ================= CONFIG =================
const API_BASE = "/api";

// ================= STATE =================
let events = [];
let currentPage = 1;
let pageSize = 25;

// ================= HELPERS =================
function shortAddr(addr) {
  return addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";
}

function el(id) {
  return document.getElementById(id);
}

// ================= LOAD STATS =================
async function loadStats() {
  const res = await fetch(`${API_BASE}/stats`);
  const data = await res.json();

  el("totalRegistered").innerText = data.totalRegistered || 0;
  el("ogMinters").innerText = data.ogMinters || 0;
  el("uniqueAddresses").innerText = data.uniqueAddresses || 0;
  el("totalOgRegistered").innerText = data.totalOgRegistered || 0;
}

// ================= LOAD EVENTS =================
async function loadEvents() {
  const res = await fetch(`${API_BASE}/events`);
  events = await res.json();
  renderTable();
}

// ================= RENDER =================
function renderTable() {
  const body = el("eventsBody");
  body.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const pageEvents = events.slice(start, start + pageSize);

  for (const e of pageEvents) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Register</td>
      <td>${shortAddr(e.address)}</td>
      <td>${shortAddr(e.tx)}</td>
      <td>${e.block}</td>
      <td>${new Date(e.time).toLocaleString()}</td>
      <td>Success</td>
      <td>${e.og ? "✅" : "❌"}</td>
    `;
    body.appendChild(tr);
  }

  el("pageInfo").innerText = `Page ${currentPage}`;
}

// ================= SEARCH =================
async function checkWallet() {
  const input = el("walletInput").value.trim();

  if (!input.startsWith("0x")) {
    alert("Invalid wallet address");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/search/${input}`);
    const data = await res.json();

    if (!data.registered) {
      alert("Wallet not registered");
      return;
    }

    alert(
      `Registered: ${data.registered}\n` +
      `OG: ${data.og}\n` +
      `Events: ${data.count}`
    );
  } catch (err) {
    console.error(err);
    alert("Search failed");
  }
}

// ================= PAGINATION =================
function nextPage() {
  if (currentPage * pageSize < events.length) {
    currentPage++;
    renderTable();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function changePageSize(size) {
  pageSize = Number(size);
  currentPage = 1;
  renderTable();
}

// ================= INIT =================
loadStats();
loadEvents();
