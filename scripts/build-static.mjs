// Frontend-only build for static hosting (GitHub Pages).
// API routes need a server, so they are moved aside during the build and always restored afterwards.
// Usage: NEXT_PUBLIC_BASE_PATH=/grant-ai npm run build:static  → output in ./out
import { execSync } from "node:child_process";
import { existsSync, renameSync, writeFileSync } from "node:fs";

const API = "src/app/api";
const ASIDE = "api-routes.disabled";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

if (existsSync(API)) renameSync(API, ASIDE);
try {
  execSync("npx next build", { stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_STATIC: "1" } });
  // "/" has no page of its own (the server normally redirects it) — send visitors to the Kazakh home page.
  const to = `${base}/kk/`;
  writeFileSync("out/index.html", `<!doctype html><meta charset="utf-8"><title>grant.ai</title><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><a href="${to}">grant.ai</a>`);
  writeFileSync("out/.nojekyll", "");
  console.log("\nStatic site ready in ./out");
} finally {
  if (existsSync(ASIDE)) renameSync(ASIDE, API);
}
