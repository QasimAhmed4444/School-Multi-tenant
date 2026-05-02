import { cp, rm, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("artifacts/school-portal/public");
const target = resolve("public");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

console.log(`Copied Vite output from ${source} to ${target}`);
