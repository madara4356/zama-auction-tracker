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
  const registeredSet = new Set(Object.keys(registrations).map(normalize));

  let totalOgRegistered = 0;
  for (const a of ogMinters) if (registeredSet.has(a)) totalOgRegistered++;

  res.status(200).json({
    totalRegistered: registeredSet.size,
    uniqueAddresses: registeredSet.size,
    ogMinters: ogMinters.size,
    totalOgRegistered
  });
}
