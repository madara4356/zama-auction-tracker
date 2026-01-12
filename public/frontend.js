const el = (id) => document.getElementById(id);

let events = [];
let page = 1;
let pageSize = 25;

// ---------------- STATS ----------------
async function loadStats() {
  const res = await fetch("/api/stats");
  const data = await res.json();

  el("totalRegistered").textContent = data.totalRegistered;
  el("ogMinters").textContent = data.ogMinters;
  el("uniqueAddresses").textContent = data.uniqueAddresses;
  el("totalOgRegistered").textContent = data.totalOgRegistered;
}

// ---------------- EVENTS ----------------
async function loadEvents() {
  const res = await fetch("/api/events");
  events = await res.json();
  renderTable();
}

// ---------------- TABLE ----------------
function renderTable() {
  const body = el("eventsBody");
  body.innerHTML = "";

  const start = (page - 1) * pageSize;
  const slice = events.slice(start, start + pageSize);

  slice.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Register</td>
      <td>${e.address.slice(0, 6)}...${e.address.slice(-4)}</td>
      <td>${e.tx.slice(0, 6)}...${e.tx.slice(-4)}</td>
      <td>${e.block}</td>
      <td>${new Date(e.time).toLocaleString()}</td>
      <td>Success</td>
      <td>${e.og ? "✅" : "❌"}</td>
    `;
    body.appendChild(tr);
  });

  el("pageInfo").textContent = `Page ${page}`;
}

// ---------------- SEARCH ----------------
async function checkWallet() {
  const addr = el("walletInput").value.trim();

  if (!addr.startsWith("0x")) {
    alert("Invalid address");
    return;
  }

  const res = await fetch(`/api/search/${addr}`);
  if (!res.ok) {
    alert("Search failed");
    return;
  }

  const data = await res.json();

  alert(
    `Registered: ${data.registered}\n` +
    `OG: ${data.og}\n` +
    `Events: ${data.count}`
  );
}

// ---------------- PAGINATION ----------------
function nextPage() {
  if (page * pageSize < events.length) {
    page++;
    renderTable();
  }
}

function prevPage() {
  if (page > 1) {
    page--;
    renderTable();
  }
}

function changePageSize(v) {
  pageSize = Number(v);
  page = 1;
  renderTable();
}

// ---------------- INIT ----------------
loadStats();
loadEvents();
