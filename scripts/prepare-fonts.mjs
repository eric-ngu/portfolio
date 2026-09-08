import { access, copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const required = [
  "BuilderSans-Regular.otf",
  "BuilderSans-Medium.otf",
  "BuilderSans-SemiBold.woff2",
  "BuilderSans-Bold.otf",
  "BuilderSans-ExtraBold.otf",
];

const dest = path.resolve("public/assets/fonts");

async function hasAll(dir) {
  try {
    await Promise.all(required.map((f) => access(path.join(dir, f))));
    return true;
  } catch {
    return false;
  }
}

if (await hasAll(dest)) {
  console.log("Builder Sans assets already present.");
  process.exit(0);
}

const parent = path.resolve("..");
const explicit = process.env.BUILDER_SANS_SOURCE
  ? [path.resolve(process.env.BUILDER_SANS_SOURCE)]
  : [];

const fixedCandidates = [
  ...explicit,
  path.join(parent, "eric-ngu-portfolio-v69-full-deploy", "public", "assets", "fonts"),
  path.join(parent, "eric-ngu-portfolio-v68-full-deploy", "public", "assets", "fonts"),
  path.join(parent, "eric-ngu-portfolio-v67-full-deploy", "public", "assets", "fonts"),
  path.join(parent, "eric-ngu-portfolio-v66-cloudflare", "assets", "fonts"),
  path.join(parent, "roblox-send-demo-pwa", "assets", "fonts"),
];

let candidates = [...fixedCandidates];
try {
  const siblings = await readdir(parent, { withFileTypes: true });
  for (const entry of siblings) {
    if (!entry.isDirectory()) continue;
    const root = path.join(parent, entry.name);
    candidates.push(path.join(root, "public", "assets", "fonts"));
    candidates.push(path.join(root, "assets", "fonts"));
  }
} catch {}

let source = null;
for (const candidate of [...new Set(candidates)]) {
  if (await hasAll(candidate)) {
    source = candidate;
    break;
  }
}

if (!source) {
  console.error("\nBuilder Sans source files were not found.");
  console.error("Keep your existing v69/v68 folder beside this v70 folder, or copy your existing Builder Sans files into public/assets/fonts/.\n");
  process.exit(1);
}

await mkdir(dest, { recursive: true });
for (const file of required) {
  await copyFile(path.join(source, file), path.join(dest, file));
}
console.log(`Prepared Builder Sans assets from: ${source}`);
