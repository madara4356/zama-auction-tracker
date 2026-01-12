const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// ---------- NORMALIZE (MUST BE FIRST) ----------
const normalize = (addr) =>
  typeof addr === "string"
    ? addr.toLowerCase().replace(/^0x0+/, "0x")
    : null;

// ---------- LOAD DATA ----------
const registrationsPath = path.join(
  __dirname,
  "data",
  "zama_registrations_map.json"
);
const ogMintersPath = path.join(__dirname, "data", "og_minters.json");

let registrations = {};
let ogMinters = new Set();

// Load registrations
try {
  registrations = JSON.parse(fs.readFileSync(registrationsPath, "utf-8"));
  console.log("✅ Registrations loaded:", Object.keys(registrations).length);
} catch (e) {
  console.error("❌ Failed to load registrations", e);
}

// Load OG minters (SAFE)
try {
  const og = JSON.parse(fs.readFileSync(ogMintersPath, "utf-8"));

  og
    .filter(a => typeof a === "string" && a.startsWith("0x"))
    .forEach(a => ogMinters.add(normalize(a)));

  console.log("⭐️ OG minters loaded:", ogMinters.size);
} catch (e) {
  console.error("❌ Failed to load OG minters", e);
}

// ---------- BUILD EVENTS ----------
const events = Object.entries(registrations).map(([address, data]) => {
  const addr = normalize(address);

  return {
    address: addr,
    tx: data.tx,
    block: data.block,
    time: data.time,
    status: "success",
    og: ogMinters.has(addr),
    ogRegistered: ogMinters.has(addr)
  };
});

// ---------- STATS ----------
app.get("/api/stats", (req, res) => {
  const registeredSet = new Set(
    Object.keys(registrations)
      .map(normalize)
      .filter(Boolean)
  );

  const ogSet = new Set([...ogMinters]);

  let totalOgRegistered = 0;
  for (const addr of ogSet) {
    if (registeredSet.has(addr)) totalOgRegistered++;
  }

  res.json({
    totalRegistered: registeredSet.size,
    uniqueAddresses: registeredSet.size,
    ogMinters: ogSet.size,              // total wallets that minted OG
    totalOgRegistered                   // intersection (THIS WAS 0 BEFORE)
  });
});

// ---------- ALL TRANSACTIONS ----------
app.get("/api/events", (req, res) => {res.json(events);
});

// ---------- SEARCH ----------
app.get("/api/search/:address", (req, res) => {
  const q = normalize(req.params.address);
  const found = events.filter(e => e.address === q);

  res.json({
    registered: found.length > 0,
    og: ogMinters.has(q),
    count: found.length,
    events: found
  });
});

// ---------- FALLBACK ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ---------- START ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
