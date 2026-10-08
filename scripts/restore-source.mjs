// Restores the application source from scripts/bundle.
// c-*.txt slices: base64 of a gzipped tar of the project source (excluding
// public/ and package-lock.json; images live directly in git).
// lg-*.txt slices: base64 of gzipped package-lock.json.
// Run before npm install when the repository was cloned without the source
// tree (for example on Render). Locally the source already exists, so the
// script exits immediately.

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const root = process.cwd();
const bundleDir = join(root, "scripts", "bundle");

if (existsSync(join(root, "src", "App.tsx"))) {
  console.log("source already present, skipping restore");
  process.exit(0);
}

const files = readdirSync(bundleDir).filter((f) => f.endsWith(".txt")).sort();

const joinSlices = (prefix) =>
  files
    .filter((f) => f.startsWith(prefix))
    .map((f) => readFileSync(join(bundleDir, f), "utf8").trim())
    .join("");

const codeB64 = joinSlices("c-");
const lockB64 = joinSlices("lg-");

if (!codeB64 || !lockB64) {
  console.error("bundle slices missing in scripts/bundle");
  process.exit(1);
}

writeFileSync(join(root, "source.tar.gz"), Buffer.from(codeB64, "base64"));
execSync("tar -xzf source.tar.gz", { stdio: "inherit" });

writeFileSync(join(root, "package-lock.json"), gunzipSync(Buffer.from(lockB64, "base64")));

console.log("source restored from bundle");
