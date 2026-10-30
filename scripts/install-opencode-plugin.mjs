#!/usr/bin/env node
import os from "node:os";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { installOpenCodePlugin, LEGACY_PLUGIN_KEY, PLUGIN_KEY } from "./lib/opencode-config.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configDirectory = process.env.OPENCODE_CONFIG_DIR
  || path.join(os.homedir(), ".config", "opencode");
const configPath = path.join(configDirectory, "opencode.jsonc");

// OpenCode resolves a `plugins` directory through the package's `./server`
// export to the plugin entrypoint. It only loads directories, so a previous
// file-path entry is migrated in place. A legacy `plugin` entry pointing at
// this repository is removed; entries belonging to other plugins are kept.
const legacyEntry = path.join(repoRoot, "src", "plugin-entry-v2.js");
const result = await installOpenCodePlugin({
  configPath,
  configDirectory,
  pluginPath: repoRoot,
  key: PLUGIN_KEY,
  stale: [legacyEntry],
  prune: [{ key: LEGACY_PLUGIN_KEY, paths: [repoRoot] }],
  readFile,
  writeFile,
  mkdir
});
console.log(
  `plugins path installed: ${repoRoot}${result.changed ? "" : " (already configured)"}`
);
console.log(`OpenCode config: ${configPath}`);
