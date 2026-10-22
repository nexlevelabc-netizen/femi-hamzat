// Restores the application source from scripts/bundle.
// c-*.txt slices: base64 of a gzipped tar of the project source (excluding
// public/ and package-lock.json; images live directly in git).
// lg-*.txt slices: base64 of gzipped package-lock.json.
// q-*.txt slices (optional): base64 of a gzipped tar with source files that
// override the main bundle (email notification patch, applied after c-*).
// r-*.txt slices (optional): a second override archive (hero image swap,
// applied after q-*). s-*.txt slices (optional): a third override archive
// (layout, social icons and news imagery, applied after r-*).
// t-*.txt slices (optional): a fourth override archive (EKO Diaspora brand
// emblem and hero sizing, applied after s-*).
// u-*.txt slices (optional): a fifth override archive (hero image fills the
// left half, applied after t-*).
// v-*.txt slices (optional): a sixth override archive (health endpoint, error
// logging and the db-setup script, applied after u-*).
// w-*.txt slices (optional): a seventh override archive (news article and
// image, applied after v-*).
// x-*.txt slices (optional): an eighth override archive (full bright hero
// imagery on every page, applied after w-*).
// y-*.txt slices (optional): a ninth override archive (home hero alignment,
// applied after x-*).
// z-*.txt slices (optional): a tenth override archive (news images shown in
// full, uncropped, applied after y-*).
// Each prefix is ONE gzipped tar split into slices.
// scripts/lock-patch.json (optional): extra package-lock entries merged into
// the restored lockfile (used to add nodemailer without re-slicing lg-*).
// scripts/bundle/i-*.txt (optional): base64 of a gzipped tar of additional
// public images, extracted into public/ after the main restore.
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

// Merge extra lockfile entries (for example nodemailer) that were added
// after the lg-* slices were generated.
const lockPatchPath = join(root, "scripts", "lock-patch.json");
if (existsSync(lockPatchPath)) {
  const patch = JSON.parse(readFileSync(lockPatchPath, "utf8"));
  const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
  lock.packages[""].dependencies[patch.package] = patch.rootDep;
  lock.packages[`node_modules/${patch.package}`] = patch.entry;
  writeFileSync(join(root, "package-lock.json"), JSON.stringify(lock, null, 2) + "\n");
  console.log(`lockfile patched with ${patch.package}`);
}

// Apply source patch archives after the main bundle so their files win.
// q-* is the email notification patch; r-* is the hero image swap;
// s-* is the layout, social and news imagery update; t-* is the EKO
// Diaspora brand emblem update; u-* is the hero fill update; v-* is the
// health and db-setup update; w-* is the news article update; x-* is the
// full bright hero imagery update; y-* is the home hero alignment update;
// z-* is the full news image update. Each prefix is ONE gzipped tar split
// into slices.
for (const [prefix, label] of [["q-", "email"], ["r-", "hero"], ["s-", "layout"], ["t-", "brand"], ["u-", "hero fill"], ["v-", "health"], ["w-", "news"], ["x-", "hero imagery"], ["y-", "home hero"], ["z-", "news images"]]) {
  const b64 = joinSlices(prefix);
  if (!b64) continue;
  writeFileSync(join(root, `patch-${prefix}tar.gz`), Buffer.from(b64, "base64"));
  execSync(`tar -xzf patch-${prefix}tar.gz`, { stdio: "inherit" });
  console.log(`source patch (${label}) applied`);
}

// Restore additional public images that are not committed directly to git.
const imgB64 = joinSlices("i-");
if (imgB64) {
  writeFileSync(join(root, "images.tar.gz"), Buffer.from(imgB64, "base64"));
  execSync("mkdir -p public && tar -xzf images.tar.gz -C public", { stdio: "inherit" });
  console.log("public images restored from bundle");
}

console.log("source restored from bundle");