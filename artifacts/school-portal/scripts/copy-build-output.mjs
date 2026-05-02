import { cp, rm, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("dist", "public");
const target = resolve("public");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

console.log(`Copied app public output from ${source} to ${target}`);
