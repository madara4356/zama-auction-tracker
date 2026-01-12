const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "data", "zama_registrations_map.json");
const outputPath = path.join(__dirname, "data", "zama_registrations_map_fixed.json");

const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

const fixed = {};

for (const [key, value] of Object.entries(raw)) {
  // take last 40 hex chars
  const cleanAddress = "0x" + key.slice(-40).toLowerCase();
  fixed[cleanAddress] = value;
}

fs.writeFileSync(outputPath, JSON.stringify(fixed, null, 2));

console.log("✅ Fixed addresses written to zama_registrations_map_fixed.json");
console.log("Old count:", Object.keys(raw).length);
console.log("New count:", Object.keys(fixed).length);
