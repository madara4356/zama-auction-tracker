const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// ================= NORMALIZE =================
const normalize = (addr) =>
  typeof addr === "string"
    ? addr.toLowerCase().replace(/^0x0+/, "0x")
    : null;

// ================= LOAD DATA =================
const registrationsPath = path.join(
  __dirname,
  "data",
  "zama_registrations_map.json"
);

const ogMintersPath = path.join(
  __dirname,
  "data",
  "og_minters.json"
);

let registrations = {};
let ogMinters = new Set();

// registrations
try {
  registrations = JSON.parse(fs.readFileSync(registrationsPath, "utf-8"));
  console.log("✅ Registrations:", Object.keys(registrations).length);
} catch (e) {
  console.error("❌ registrations load failed", e);
}

// OG minters
try {
  const og = JSON.parse(fs.readFileSync(ogMintersPath, "utf-8"));
  og
    .filter(a => typeof a === "string" && a.startsWith("0x"))
    .forEach(a => ogMinters.add(normalize(a)));

  console.log("⭐ OG Minters:", ogMinters.size);
} catch (e) {
  console.error("❌ og minters load failed", e);
}

// ================= BUILD EVENTS =================
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

// ================= API ROUTES =================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/stats", (req, res) => {
  const registeredSet = new Set(
    Object.keys(registrations).map(normalize).filter(Boolean)
  );

  let totalOgRegistered = 0;
  for (const addr of ogMinters) {
    if (registeredSet.has(addr)) totalOgRegistered++;
  }

  res.json({
    totalRegistered: registeredSet.size,
    uniqueAddresses: registeredSet.size,
    ogMinters: ogMinters.size,
    totalOgRegistered
  });
});

app.get("/api/events", (req, res) => {
  res.json(events);
});

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

// ================= FRONTEND =================
// frontend files are in ROOT now
app.use(express.static(path.join(__dirname, "..")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// ================= EXPORT (NO LISTEN) =================
module.exports = app;
