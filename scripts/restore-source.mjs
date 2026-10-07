// Restores the application source from scripts/bundle/part-*.txt.
// The bundle is a gzipped tar of the project source, stored as base64 text
// parts so it can live in git as plain text. Run before npm install when the
// repository was cloned without the source tree (for example on Render).
// Locally the source already exists, so the script exits immediately.

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const bundleDir = join(root, "scripts", "bundle");

if (existsSync(join(root, "src", "App.tsx"))) {
  console.log("source already present, skipping restore");
  process.exit(0);
}

const parts = readdirSync(bundleDir)
  .filter((f) => f.startsWith("part-") && f.endsWith(".txt"))
  .sort();

if (parts.length === 0) {
  console.error("no bundle parts found in scripts/bundle");
  process.exit(1);
}

const b64 = parts.map((f) => readFileSync(join(bundleDir, f), "utf8").trim()).join("");
writeFileSync(join(root, "source.tar.gz"), Buffer.from(b64, "base64"));

execSync("tar -xzf source.tar.gz", { stdio: "inherit" });
console.log("source restored from bundle");
