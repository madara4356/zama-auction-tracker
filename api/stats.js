import fs from "fs";
import path from "path";

const normalize = a => a.toLowerCase().replace(/^0x0+/, "0x");

export default function handler(req, res) {
  const dataDir = path.join(process.cwd(), "api", "data");

  const registrations = JSON.parse(
    fs.readFileSync(path.join(dataDir, "zama_registrations_map.json"), "utf8")
  );

  const og = JSON.parse(
    fs.readFileSync(path.join(dataDir, "og_minters.json"), "utf8")
  ).map(normalize);

  const registered = Object.keys(registrations).map(normalize);
  const ogSet = new Set(og);

  let totalOgRegistered = registered.filter(a => ogSet.has(a)).length;

  res.json({
    totalRegistered: registered.length,
    uniqueAddresses: registered.length,
    ogMinters: ogSet.size,
    totalOgRegistered
  });
}
