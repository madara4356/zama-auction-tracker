import fs from "fs";
import path from "path";

const normalize = (a) =>
  typeof a === "string" ? a.toLowerCase().replace(/^0x0+/, "0x") : null;

export default function handler(req, res) {
  const dataPath = path.join(process.cwd(), "api/data");

  const registrations = JSON.parse(
    fs.readFileSync(path.join(dataPath, "zama_registrations_map.json"))
  );

  const ogRaw = JSON.parse(
    fs.readFileSync(path.join(dataPath, "og_minters.json"))
  );

  const ogMinters = new Set(ogRaw.map(normalize));

  const events = Object.entries(registrations).map(([addr, d]) => {
    const a = normalize(addr);
    return {
      address: a,
      tx: d.tx,
      block: d.block,
      time: d.time,
      status: "success",
      og: ogMinters.has(a)
    };
  });

  res.status(200).json(events);
}
