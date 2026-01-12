import fs from "fs";
import path from "path";

const normalize = (a) =>
  typeof a === "string" ? a.toLowerCase().replace(/^0x0+/, "0x") : null;

export default function handler(req, res) {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: "address required" });

  const q = normalize(address);
  const dataPath = path.join(process.cwd(), "api/data");

  const registrations = JSON.parse(
    fs.readFileSync(path.join(dataPath, "zama_registrations_map.json"))
  );

  const ogRaw = JSON.parse(
    fs.readFileSync(path.join(dataPath, "og_minters.json"))
  );

  const ogMinters = new Set(ogRaw.map(normalize));

  const events = Object.entries(registrations)
    .map(([addr, d]) => ({
      address: normalize(addr),
      tx: d.tx,
      block: d.block,
      time: d.time,
      og: ogMinters.has(normalize(addr))
    }))
    .filter(e => e.address === q);

  res.status(200).json({
    registered: events.length > 0,
    og: ogMinters.has(q),
    count: events.length,
    events
  });
}
