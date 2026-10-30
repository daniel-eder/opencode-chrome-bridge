import os from "node:os";
import path from "node:path";
import http from "node:http";
import { AsyncLocalStorage } from "node:async_hooks";
import { open, writeFile } from "node:fs/promises";
import { decodeSupportedImageDataUrl } from "./workspace-artifacts.js";

const STATE_DIR = process.env.OPENCODE_CHROME_BRIDGE_STATE_DIR || path.join(os.homedir(), ".opencode", "chrome-bridge");
const STATE_PATH = path.join(STATE_DIR, "state.json");
const TOKEN_RE = /^[A-Za-z0-9._~+/=-]{20,256}$/u;
const DEFAULT_REQUEST_TIMEOUT_MS = 35000;
const MAX_REQUEST_TIMEOUT_MS = 126000;
const MAX_CAPABILITY_HEADER_CHARS = 10_000;
const NATIVE_HOST_NAME = "com.opencode.chrome_bridge";
export const BRIDGE_CLIENT_VERSION = "1.5.0";
export const BRIDGE_PROTOCOL_MIN = "1.0.0";
export const BRIDGE_PROTOCOL_MAX = "1.0.0";
const DEFAULT_REQUIRED_CAPABILITIES = Object.freeze(["bridge.handshake"]);
const VERSION_RE = /^\d+\.\d+\.\d+$/u;
const CAPABILITY_RE = /^[a-z][a-z0-9.-]{0,99}$/u;
const pageScopeContext = new AsyncLocalStorage();
const ORIGIN_SCOPED_BRIDGE_METHODS = new Set([
  "accessibilityTree", "activateTab", "back", "browserBatch", "cdpCommand", "click", "clickElement",
  "closeTab", "domContent", "doubleClick", "evaluate", "fileUploadCommit", "fillElement",
  "findElements", "forward", "getConsoleLogs", "getTab", "hover", "keypress", "moveSequence",
  "navigate", "networkRequests", "pageText", "printPdf", "readPage", "reload", "resetViewport",
  "pageAssets",
  "webMcpList", "webMcpInvoke",
  "workflowRun",
  "screenshot", "screenshotRegion", "scroll", "setCursorState", "setFaviconBadge",
  "setViewport", "subscribeCdpEvents", "tabContext", "type", "unsubscribeCdpEvents", "waitFor"
]);

export async function readBridgeState() {
  const stateFile = await open(STATE_PATH, "r");
  let raw;
  try {
    const stateInfo = await stateFile.stat();
    if (process.platform !== "win32") {
      if ((stateInfo.mode & 0o077) !== 0) throw new Error("Bridge state file permissions are too broad");
      if (typeof process.getuid === "function" && stateInfo.uid !== process.getuid()) {
        throw new Error("Bridge state file is owned by another user");
      }
    }
    raw = await stateFile.readFile("utf8");
  } finally {
    await stateFile.close();
  }
  const state = JSON.parse(raw);
  if (state.host !== "127.0.0.1") throw new Error("Bridge state host is not local");
  if (!Number.isInteger(state.port) || state.port < 1 || state.port > 65535) {
    throw new Error("Bridge state has an invalid port");
  }
  if (typeof state.token !== "string" || !TOKEN_RE.test(state.token)) {
    throw new Error("Bridge state has an invalid token");
  }
  return state;
}

export async function bridgeStatus(requiredCapabilities = DEFAULT_REQUIRED_CAPABILITIES) {
  const required = validateCapabilityList(requiredCapabilities, "required capabilities");
  const capabilityHeader = required.join(",");
  if (capabilityHeader.length > MAX_CAPABILITY_HEADER_CHARS) {
    throw new Error("Bridge required capabilities are too large");
  }
  const payload = await request("GET", "/status", undefined, {
    "X-OpenCode-Bridge-Capabilities": capabilityHeader,
    "X-OpenCode-Bridge-Client-Version": BRIDGE_CLIENT_VERSION,
    "X-OpenCode-Bridge-Protocol-Max": BRIDGE_PROTOCOL_MAX,
    "X-OpenCode-Bridge-Protocol-Min": BRIDGE_PROTOCOL_MIN
  });
  return validateBridgeStatus(normalizeBridgeStatus(payload, required));
}

export function validateBridgeStatus(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Bridge status must be an object");
  }
  if (payload.ok !== true) throw new Error("Bridge status did not report success");
  if (typeof payload.connected !== "boolean") throw new Error("Bridge status connected must be a boolean");
  if (typeof payload.compatible !== "boolean") throw new Error("Bridge status compatible must be a boolean");
  const hostReachable = payload.hostReachable ?? true;
  const legacy = payload.legacy ?? false;
  if (typeof hostReachable !== "boolean") throw new Error("Bridge status hostReachable must be a boolean");
  if (typeof legacy !== "boolean") throw new Error("Bridge status legacy must be a boolean");
  const host = validatePeer(payload.host, "host");
  const client = validatePeer(payload.client, "client");
  const extension = payload.extension === null ? null : validateExtension(payload.extension);
  const missingCapabilities = validateCapabilityList(payload.missingCapabilities, "missing capabilities");
  const diagnostics = validateDiagnostics(payload.diagnostics);

  if ((!payload.connected || !payload.compatible) && diagnostics.length === 0) {
    throw new Error("Bridge status diagnostics are required when disconnected or incompatible");
  }
  if (legacy && (!hostReachable || payload.connected || payload.compatible || extension !== null)) {
    throw new Error("Legacy bridge status invariants are invalid");
  }
  if (legacy && !diagnostics.some((diagnostic) => diagnostic.code === "HOST_HANDSHAKE_MISSING")) {
    throw new Error("Legacy bridge status must include HOST_HANDSHAKE_MISSING diagnostics");
  }

  if (payload.connected && extension === null) {
    throw new Error("Connected bridge status must include the extension handshake");
  }
  if (!payload.connected && extension !== null) {
    throw new Error("Disconnected bridge status must not include an extension handshake");
  }
  if (extension !== null) {
    if (extension.hostName !== host.name) {
      throw new Error("Bridge status extension host name does not match the native host");
    }
    const protocolCompatible = isVersionInRange(extension.protocolVersion, host.protocolMin, host.protocolMax)
      && isVersionInRange(extension.protocolVersion, client.protocolMin, client.protocolMax);
    const expectedCompatible = protocolCompatible && missingCapabilities.length === 0 && diagnostics.length === 0;
    if (payload.compatible !== expectedCompatible) {
      throw new Error("Bridge status compatibility is inconsistent with the negotiated protocol, capabilities, or diagnostics");
    }
  } else if (payload.compatible) {
    throw new Error("Disconnected bridge status cannot be compatible");
  }

  return {
    ...payload,
    client,
    diagnostics,
    extension,
    host,
    hostReachable,
    legacy,
    missingCapabilities
  };
}

export async function requireBridgeCapabilities(requiredCapabilities, suppliedStatus) {
  const required = validateCapabilityList(requiredCapabilities, "required capabilities");
  const status = validateBridgeStatus(suppliedStatus ?? await bridgeStatus(required));
  const repair = status.diagnostics
    .map((diagnostic) => diagnostic.repair)
    .filter(Boolean)
    .join(" ");
  if (status.legacy) {
    throw new Error(`OpenCode Chrome Bridge native host is outdated and does not support capability negotiation. ${repair || "Run npm run install:native to update it."}`);
  }
  if (!status.connected) {
    throw new Error(`OpenCode Chrome Bridge is not connected. ${repair || "Reload Chrome or reinstall the native host."}`);
  }
  const available = new Set(status.extension?.capabilities ?? []);
  const missing = [...new Set([
    ...status.missingCapabilities,
    ...required.filter((capability) => !available.has(capability))
  ])].sort();
  if (!status.compatible || missing.length > 0) {
    const detail = missing.length > 0 ? ` Missing capabilities: ${missing.join(", ")}.` : "";
    throw new Error(`OpenCode Chrome Bridge is incompatible.${detail} ${repair || "Update the extension and native host together."}`);
  }
  return status;
}

function normalizeBridgeStatus(payload, requiredCapabilities) {
  if (!isLegacyBridgeStatus(payload)) return payload;
  return {
    client: {
      name: "opencode-plugin",
      protocolMax: BRIDGE_PROTOCOL_MAX,
      protocolMin: BRIDGE_PROTOCOL_MIN,
      version: BRIDGE_CLIENT_VERSION
    },
    compatible: false,
    connected: false,
    diagnostics: [{
      code: "HOST_HANDSHAKE_MISSING",
      message: "The reachable native host predates bridge capability negotiation.",
      repair: "Run npm run install:native from the current OpenCode Chrome Bridge checkout."
    }],
    extension: null,
    host: {
      name: NATIVE_HOST_NAME,
      protocolMax: "0.0.0",
      protocolMin: "0.0.0",
      version: "0.0.0"
    },
    hostReachable: true,
    legacy: true,
    missingCapabilities: [...requiredCapabilities],
    ok: true,
    pending: payload.pending,
    pid: payload.pid
  };
}

function isLegacyBridgeStatus(payload) {
  return payload !== null
    && typeof payload === "object"
    && !Array.isArray(payload)
    && JSON.stringify(Object.keys(payload).sort()) === JSON.stringify(["ok", "pending", "pid"])
    && payload.ok === true
    && payload.connected === undefined
    && payload.compatible === undefined
    && Number.isInteger(payload.pid)
    && payload.pid >= 0
    && Number.isInteger(payload.pending)
    && payload.pending >= 0;
}

export async function bridgeCommand(method, params = {}, options = {}) {
  const scope = pageScopeContext.getStore();
  if (scope && ORIGIN_SCOPED_BRIDGE_METHODS.has(method)) {
    params = {
      expectedBindings: scope.expectedBindings,
      expectedScopes: scope.expectedScopes,
      method,
      params
    };
    method = "scopedCommand";
  }
  const response = await request("POST", "/command", {
    method,
    params,
    timeoutMs: options.timeoutMs
  }, {}, options.signal);
  return response.result;
}

export function withoutBridgePageScopes(operation) {
  // Runs a bridge read outside any inherited page-scope context. Used for tab
  // metadata reads that feed a new authorization prompt: inside a scoped
  // operation the inherited scopes describe the pre-navigation page, so a
  // scoped getTab would be rejected by the extension's page guard before the
  // plugin can ask the user to approve the page the tab actually shows now.
  return pageScopeContext.exit(operation);
}

export function withBridgePageScopes(expectedScopes, operation, expectedBindings = []) {
  if (!Array.isArray(expectedScopes) || expectedScopes.length === 0) {
    throw new Error("withBridgePageScopes requires at least one expected page scope");
  }
  return pageScopeContext.run({
    expectedBindings: Array.isArray(expectedBindings) ? expectedBindings.map((entry) => ({ ...entry })) : [],
    expectedScopes: [...expectedScopes]
  }, operation);
}

export async function pollEvents(since = 0) {
  const sinceNum = Number.isFinite(Number(since)) ? Math.max(0, Math.floor(Number(since))) : 0;
  const params = new URLSearchParams({ since: String(sinceNum) });
  const response = await request("GET", `/events/poll?${params}`);
  return response;
}

export async function writeDataUrlToFile(dataUrl, outputPath) {
  const { data, mimeType } = decodeSupportedImageDataUrl(dataUrl);
  await writeFile(outputPath, data);
  return { bytes: data.length, mimeType, path: outputPath };
}

const MAX_PDF_ARTIFACT_BYTES = 10 * 1024 * 1024;

export async function writePdfDataUrlToFile(dataUrl, outputPath) {
  if (typeof dataUrl !== "string") throw new Error("PDF response was not a data URL");
  const match = /^data:([^;,]+)(;base64)?,(.*)$/u.exec(dataUrl);
  if (!match) throw new Error("PDF response was not a data URL");
  const mimeType = match[1].toLowerCase();
  if (mimeType !== "application/pdf") throw new Error("PDF response used an unsupported MIME type");
  if (match[2] !== ";base64") throw new Error("PDF response must use base64 encoding");
  const encoded = match[3];
  if (encoded.length === 0 || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/u.test(encoded)) {
    throw new Error("PDF response contained invalid base64 data");
  }
  const data = Buffer.from(encoded, "base64");
  if (data.length > MAX_PDF_ARTIFACT_BYTES) throw new Error("PDF response is too large to write");
  if (data.length < 5 || data.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new Error("PDF response did not contain a valid PDF signature");
  }
  await writeFile(outputPath, data);
  return { bytes: data.length, mimeType, path: outputPath };
}

async function request(method, pathname, body, extraHeaders = {}, externalSignal) {
  const state = await readBridgeState();
  const url = `http://${state.host}:${state.port}${pathname}`;
  const timeoutMs = requestTimeoutMs(body);
  const headers = {
    Authorization: `Bearer ${state.token}`,
    ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    ...extraHeaders
  };
  if (externalSignal) {
    return abortableHttpRequest({ body, headers, method, signal: externalSignal, timeoutMs, url });
  }
  const controller = timeoutMs > 0 ? new AbortController() : null;
  const timeout = controller === null ? null : setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(url, {
      method,
      signal: controller?.signal,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (error) {
    if (controller !== null && error?.name === "AbortError") {
      throw new Error(`Bridge request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    if (timeout !== null) clearTimeout(timeout);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error ?? `Bridge request failed with HTTP ${response.status}`);
  }
  if (payload === null || typeof payload !== "object") {
    throw new Error("Bridge returned an invalid JSON response");
  }
  return payload;
}

function abortableHttpRequest({ body, headers, method, signal, timeoutMs, url }) {
  const serialized = body === undefined ? undefined : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason instanceof Error ? signal.reason : new Error("Bridge request was cancelled"));
      return;
    }
    const req = http.request(url, {
      headers: {
        ...headers,
        ...(serialized === undefined ? {} : { "Content-Length": Buffer.byteLength(serialized) })
      },
      method,
      signal
    }, (res) => {
      const chunks = [];
      let bytes = 0;
      res.on("data", (chunk) => {
        bytes += chunk.length;
        if (bytes > 16 * 1024 * 1024) req.destroy(new Error("Bridge response is too large"));
        else chunks.push(chunk);
      });
      res.on("end", () => {
        let payload;
        try { payload = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { payload = null; }
        if ((res.statusCode ?? 500) >= 400 || payload?.ok === false) {
          reject(new Error(payload?.error ?? `Bridge request failed with HTTP ${res.statusCode}`));
          return;
        }
        if (payload === null || typeof payload !== "object") {
          reject(new Error("Bridge returned an invalid JSON response"));
          return;
        }
        resolve(payload);
      });
    });
    if (timeoutMs > 0) req.setTimeout(timeoutMs, () => req.destroy(new Error(`Bridge request timed out after ${timeoutMs}ms`)));
    req.on("error", (error) => {
      reject(signal.aborted && signal.reason instanceof Error ? signal.reason : error);
    });
    if (serialized !== undefined) req.end(serialized);
    else req.end();
  });
}

function validatePeer(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Bridge status ${label} must be an object`);
  }
  const name = requireBoundedString(value.name, `${label} name`, 1, 128);
  const version = requireVersion(value.version, `${label} version`);
  const protocolMin = requireVersion(value.protocolMin, `${label} protocol minimum`);
  const protocolMax = requireVersion(value.protocolMax, `${label} protocol maximum`);
  if (compareVersions(protocolMin, protocolMax) > 0) {
    throw new Error(`Bridge status ${label} protocol range is invalid`);
  }
  return { name, version, protocolMin, protocolMax };
}

function validateExtension(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Bridge status extension must be an object");
  }
  return {
    capabilities: validateCapabilityList(value.capabilities, "extension capabilities"),
    extensionId: requireBoundedString(value.extensionId, "extension id", 1, 256),
    extensionName: value.extensionName == null
      ? undefined
      : requireBoundedString(value.extensionName, "extension name", 1, 256),
    extensionVersion: requireVersion(value.extensionVersion, "extension version"),
    hostName: requireBoundedString(value.hostName, "extension host name", 1, 128),
    protocolVersion: requireVersion(value.protocolVersion, "extension protocol version")
  };
}

function validateCapabilityList(value, label) {
  if (!Array.isArray(value) || value.length > 200) throw new Error(`Bridge status ${label} must be a bounded array`);
  const capabilities = value.map((entry) => {
    if (typeof entry !== "string" || !CAPABILITY_RE.test(entry)) {
      throw new Error(`Bridge status ${label} contains an invalid capability`);
    }
    return entry;
  });
  return [...new Set(capabilities)].sort();
}

function validateDiagnostics(value) {
  if (!Array.isArray(value) || value.length > 20) throw new Error("Bridge status diagnostics must be a bounded array");
  return value.map((diagnostic) => {
    if (!diagnostic || typeof diagnostic !== "object" || Array.isArray(diagnostic)) {
      throw new Error("Bridge status diagnostic must be an object");
    }
    return {
      code: requireBoundedString(diagnostic.code, "diagnostic code", 1, 100),
      message: requireBoundedString(diagnostic.message, "diagnostic message", 1, 1000),
      repair: diagnostic.repair == null
        ? undefined
        : requireBoundedString(diagnostic.repair, "diagnostic repair", 1, 1000)
    };
  });
}

function requireVersion(value, label) {
  if (typeof value !== "string" || !VERSION_RE.test(value)) {
    throw new Error(`Bridge status ${label} is invalid`);
  }
  return value;
}

function requireBoundedString(value, label, min, max) {
  if (typeof value !== "string" || value.length < min || value.length > max) {
    throw new Error(`Bridge status ${label} is invalid`);
  }
  return value;
}

function isVersionInRange(version, minimum, maximum) {
  return compareVersions(version, minimum) >= 0 && compareVersions(version, maximum) <= 0;
}

function compareVersions(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function requestTimeoutMs(body) {
  const commandTimeout = body?.timeoutMs;
  if (commandTimeout === 0) return 0;
  const parsedTimeout = Number(commandTimeout);
  if (Number.isFinite(parsedTimeout) && parsedTimeout > 0) {
    return Math.min(MAX_REQUEST_TIMEOUT_MS, Math.max(1000, parsedTimeout + 1000));
  }
  return DEFAULT_REQUEST_TIMEOUT_MS;
}
