#!/usr/bin/env node
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { parseJsonc } from "./lib/opencode-config.mjs";
import { scanTrackedFiles } from "./lib/release-artifact-scan.mjs";
import {
  createLauncher,
  isSupportedNodeVersion,
  nativeHostLayout,
  NATIVE_HOST_NAME,
  windowsRegistryQueryArgs
} from "./lib/platform-support.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);
const expectedExtensionId = "miccjajdhchpcdpmmiahheilooppepnl";
const expectedPermissions = [
  "alarms",
  "bookmarks",
  "debugger",
  "downloads",
  "downloads.ui",
  "history",
  "nativeMessaging",
  "notifications",
  "scripting",
  "storage",
  "tabGroups",
  "tabs",
  "webNavigation"
];

const packageJson = await checkJson("package.json");
const manifest = await checkJson("extension/manifest.json");
const packageLock = await checkJson("package-lock.json");
await access(path.join(repoRoot, "extension", "background.js"));
await access(path.join(repoRoot, "extension", "popup.html"));
await access(path.join(repoRoot, "extension", "content-scripts", "opencode.js"));
await access(path.join(repoRoot, "extension", "content-scripts", "a11y.js"));
await access(path.join(repoRoot, "extension", "managed_schema.json"));
await access(path.join(repoRoot, "extension", "images", "cursor-chat.png"));
await access(path.join(repoRoot, "native-host", "opencode-chrome-native-host.mjs"));
await access(path.join(repoRoot, "src", "opencode-plugin.js"));
await access(path.join(repoRoot, "src", "plugin-entry.js"));
if (packageJson.exports?.["./server"] !== "./src/plugin-entry.js") {
  throw new Error('package.json must expose the OpenCode entrypoint as exports["./server"]');
}

assertExactStringSet(manifest.permissions, expectedPermissions, "extension permissions");
assertExactStringSet(manifest.host_permissions, ["<all_urls>"], "extension host permissions");
for (const [name, version] of [
  ["package.json", packageJson.version],
  ["package-lock.json", packageLock.version],
  ["package-lock root", packageLock.packages?.[""]?.version],
  ["extension manifest", manifest.version]
]) {
  if (version !== "1.5.0") throw new Error(`${name} release version must be 1.5.0`);
}
const popupHtml = await readFile(path.join(repoRoot, "extension", "popup.html"), "utf8");
const popupJs = await readFile(path.join(repoRoot, "extension", "popup.js"), "utf8");
if (!popupHtml.includes('id="version">v1.5.0</span>') || !popupJs.includes('"v1.5.0"')) {
  throw new Error("popup release metadata must be v1.5.0");
}
const bridgeClientSource = await readFile(path.join(repoRoot, "src", "bridge-client.js"), "utf8");
const nativeHostSource = await readFile(path.join(repoRoot, "native-host", "opencode-chrome-native-host.mjs"), "utf8");
const readme = await readFile(path.join(repoRoot, "README.md"), "utf8");
const changelog = await readFile(path.join(repoRoot, "CHANGELOG.md"), "utf8");
const security = await readFile(path.join(repoRoot, "SECURITY.md"), "utf8");
for (const [name, source] of [
  ["bridge client", bridgeClientSource],
  ["native host", nativeHostSource]
]) {
  if (!source.includes('"1.5.0"')) throw new Error(`${name} release metadata must be v1.5.0`);
}
for (const required of [
  "chrome_workflow_start",
  "chrome_schedule_create",
  "chrome_webmcp_list",
  "chrome://flags/#enable-webmcp-testing",
  "browser.schedule-unattended"
]) {
  if (!readme.includes(required)) throw new Error(`README must document ${required}`);
}
if (!changelog.includes("## v1.5.0 — 2026-08-11")) throw new Error("CHANGELOG must contain the v1.5.0 release");
if (!security.includes("committed semantics") || !security.includes("irrevocable")) {
  throw new Error("SECURITY must document committed schedule and irrevocable WebMCP semantics");
}
const { stdout: trackedOutput } = await execFileAsync("git", ["ls-files", "-z"], { cwd: repoRoot, encoding: "buffer", windowsHide: true });
const trackedPaths = trackedOutput.toString("utf8").split("\0").filter(Boolean);
const releaseIssues = await scanTrackedFiles({ root: repoRoot, trackedPaths });
if (releaseIssues.length > 0) {
  throw new Error(`Release artifact scan failed: ${releaseIssues.map((issue) => `${issue.path}: ${issue.reason}`).join("; ")}`);
}

const csp = manifest.content_security_policy?.extension_pages;
if (typeof csp !== "string" || !/connect-src\s+'none'/u.test(csp) || /127\.0\.0\.1|localhost|ws:/u.test(csp)) {
  throw new Error("extension/manifest.json must block extension-page network access");
}

const webAccessible = manifest.web_accessible_resources ?? [];
const declaredResources = webAccessible.flatMap((entry) => entry.resources ?? []);
if (!declaredResources.includes("images/cursor-chat.png")) {
  throw new Error("extension/manifest.json must declare images/cursor-chat.png in web_accessible_resources");
}

const extensionId = extensionIdFromKey(manifest.key);
if (extensionId !== expectedExtensionId) {
  throw new Error(`Expected extension id ${expectedExtensionId}, got ${extensionId}`);
}

const opencodeConfig = parseJsonc(await readInstalledFile(opencodeConfigPath(), "OpenCode config", "npm run install:opencode"));
// OpenCode reads the `plugins` key and resolves the package root through the
// `./server` export to the plugin entrypoint. File paths are skipped because
// OpenCode only loads directories.
const pluginEntries = (opencodeConfig.plugins ?? []).map(
  (entry) => (typeof entry === "string" ? entry : entry?.package)
);
if (!Array.isArray(opencodeConfig.plugins) || !pluginEntries.includes(repoRoot)) {
  throw new Error(`OpenCode config must include plugins path ${repoRoot}`);
}
// The legacy `plugin` key is not installed anymore; anything left there would
// only produce failed-to-load warnings.
const legacyEntries = Array.isArray(opencodeConfig.plugin)
  ? opencodeConfig.plugin.map((entry) => (typeof entry === "string" ? entry : entry?.package))
  : [];
if (legacyEntries.includes(repoRoot)) {
  throw new Error(`OpenCode config still lists this repository under the legacy plugin key; re-run npm run install:opencode to remove it`);
}

const hostPath = path.join(repoRoot, "native-host", "opencode-chrome-native-host.mjs");
const { launcherPath: expectedLauncherPath, manifestPath, runtimeMetadataPath, requiresRegistry } = nativeHostLayout({
  platform: process.platform,
  homeDir: os.homedir()
});
if (requiresRegistry) {
  try {
    await execFileAsync("reg.exe", windowsRegistryQueryArgs(manifestPath), { windowsHide: true });
  } catch (error) {
    const detail = error?.stderr?.trim() || error?.message || String(error);
    throw new Error(`Chrome native messaging host is not registered at the expected HKCU manifest path ${manifestPath}: ${detail}`, { cause: error });
  }
}

const nativeManifest = JSON.parse(await readInstalledFile(manifestPath, "native messaging host manifest", "npm run install:native"));
const expectedOrigin = `chrome-extension://${expectedExtensionId}/`;
if (nativeManifest.name !== NATIVE_HOST_NAME) {
  throw new Error(`Native host manifest name must be ${NATIVE_HOST_NAME}`);
}
if (!samePath(nativeManifest.path, expectedLauncherPath)) {
  throw new Error("Native host manifest path does not point at the generated OpenCode launcher");
}
assertExactStringSet(nativeManifest.allowed_origins, [expectedOrigin], "native host allowed origins");
const runtimeMetadata = JSON.parse(await readInstalledFile(runtimeMetadataPath, "native host runtime metadata", "npm run install:native"));
if (typeof runtimeMetadata.nodePath !== "string" || !path.isAbsolute(runtimeMetadata.nodePath)) {
  throw new Error("Native host runtime metadata must contain an absolute Node executable path");
}
if (!samePath(runtimeMetadata.hostPath, hostPath)) {
  throw new Error("Native host runtime metadata points at a different host script");
}
let installedNodeVersion;
try {
  ({ stdout: installedNodeVersion } = await execFileAsync(runtimeMetadata.nodePath, ["--version"], { windowsHide: true }));
  installedNodeVersion = installedNodeVersion.trim();
} catch (error) {
  throw new Error(`Native host Node executable cannot be started: ${runtimeMetadata.nodePath}`, { cause: error });
}
if (runtimeMetadata.nodeVersion !== installedNodeVersion || !isSupportedNodeVersion(installedNodeVersion)) {
  throw new Error(`Native host must use a supported Node release; installed runtime is ${installedNodeVersion}`);
}
const launcher = await readFile(expectedLauncherPath, "utf8");
const expectedLauncher = createLauncher({ platform: process.platform, nodePath: runtimeMetadata.nodePath, hostPath });
if (launcher !== expectedLauncher) {
  throw new Error("Native host launcher does not match its verified runtime metadata");
}

console.log(JSON.stringify({
  ok: true,
  extensionId,
  nativeHostName: NATIVE_HOST_NAME,
  pluginPath: repoRoot
}, null, 2));

async function checkJson(relativePath) {
  return JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8"));
}

function extensionIdFromKey(keyBase64) {
  const key = Buffer.from(keyBase64, "base64");
  const digest = createHash("sha256").update(key).digest().subarray(0, 16);
  return [...digest].map((byte) => "abcdefghijklmnop"[byte >> 4] + "abcdefghijklmnop"[byte & 15]).join("");
}

function opencodeConfigPath() {
  const configDirectory = process.env.OPENCODE_CONFIG_DIR
    || path.join(os.homedir(), ".config", "opencode");
  return path.join(configDirectory, "opencode.jsonc");
}

async function readInstalledFile(filePath, label, repairCommand) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`${label} was not found at ${filePath}. Run ${repairCommand} from this checkout, then retry npm run verify.`, { cause: error });
    }
    throw error;
  }
}

function samePath(left, right) {
  const resolvedLeft = path.resolve(left);
  const resolvedRight = path.resolve(right);
  return process.platform === "win32"
    ? resolvedLeft.toLowerCase() === resolvedRight.toLowerCase()
    : resolvedLeft === resolvedRight;
}

function assertExactStringSet(actual, expected, label) {
  if (!Array.isArray(actual) || actual.some((value) => typeof value !== "string")) {
    throw new Error(`${label} must be an array of strings`);
  }
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  if (
    actual.length !== actualSet.size
    || actualSet.size !== expectedSet.size
    || [...expectedSet].some((value) => !actualSet.has(value))
  ) {
    throw new Error(`${label} must exactly match ${JSON.stringify([...expectedSet])}`);
  }
}
