import { access } from "node:fs/promises";

const requiredArtifacts = [
  "dist/server/server.js",
  "dist/web/index.html",
];

for (const artifact of requiredArtifacts) {
  try {
    await access(artifact);
  } catch {
    console.error(`Missing build artifact: ${artifact}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  process.exit();
}

console.log("Build smoke check passed.");
