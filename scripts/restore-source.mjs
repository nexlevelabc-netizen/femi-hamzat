// Restores the application source from scripts/bundle.
// The bundle is a gzipped tar of the project source (excluding public/ and
// package-lock.json), stored as base64 slices c-*.txt, plus raw JSON slices
// l-*.txt of package-lock.json. Images under public/ live directly in git.
// Run before npm install when the repository was cloned without the source
// tree (for example on Render). Locally the source already exists, so the
// script exits immediately.

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const bundleDir = join(root, "scripts", "bundle");

if (existsSync(join(root, "src", "App.tsx"))) {
  console.log("source already present, skipping restore");
  process.exit(0);
}

const files = readdirSync(bundleDir).filter((f) => f.endsWith(".txt")).sort();

const codeParts = files.filter((f) => f.startsWith("c-"));
const lockParts = files.filter((f) => f.startsWith("l-"));

if (codeParts.length === 0 || lockParts.length === 0) {
  console.error("bundle slices missing in scripts/bundle");
  process.exit(1);
}

const b64 = codeParts.map((f) => readFileSync(join(bundleDir, f), "utf8").trim()).join("");
writeFileSync(join(root, "source.tar.gz"), Buffer.from(b64, "base64"));
execSync("tar -xzf source.tar.gz", { stdio: "inherit" });

const lock = lockParts.map((f) => readFileSync(join(bundleDir, f), "utf8").replace(/\n$/, "")).join("");
writeFileSync(join(root, "package-lock.json"), lock);

console.log(`source restored from bundle (${codeParts.length} code slices, ${lockParts.length} lockfile slices)`);
