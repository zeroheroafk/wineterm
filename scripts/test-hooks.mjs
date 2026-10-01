/**
 * Module resolution for `node --test`, which runs the TypeScript sources
 * directly with Node's type stripping. Resolves the "@/" path alias from
 * tsconfig.json to src/, and extensionless relative imports to their .ts
 * file, as the bundler does. No dependencies.
 */

import { existsSync } from "node:fs";
import { registerHooks } from "node:module";

const SRC = new URL("../src/", import.meta.url);
const CANDIDATES = [".ts", "/index.ts"];

function locate(base) {
  for (const suffix of CANDIDATES) {
    const candidate = new URL(base.href + suffix);
    if (existsSync(candidate)) return candidate.href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    let base = null;
    if (specifier.startsWith("@/")) {
      base = new URL(specifier.slice(2), SRC);
    } else if (
      /^\.\.?\//.test(specifier) &&
      context.parentURL?.startsWith("file:") &&
      !/\.[cm]?[jt]sx?$/.test(specifier)
    ) {
      base = new URL(specifier, context.parentURL);
    }
    const found = base ? locate(base) : null;
    return nextResolve(found ?? specifier, context);
  },
});
