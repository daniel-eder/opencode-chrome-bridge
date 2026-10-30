import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import vm from "node:vm";

const repoRoot = path.resolve(import.meta.dirname, "..");
const previousStateDir = process.env.OPENCODE_CHROME_BRIDGE_STATE_DIR;
const stateDir = await mkdtemp(path.join(os.tmpdir(), "opencode-handshake-test-"));
process.env.OPENCODE_CHROME_BRIDGE_STATE_DIR = stateDir;
await writeFile(path.join(stateDir, "state.json"), JSON.stringify({
  host: "127.0.0.1",
  port: 31337,
  token: "a".repeat(32)
}), { mode: 0o600 });
const bridgeClient = await import("../src/bridge-client.js");
const pluginModule = await import("../src/opencode-plugin.js");
const toolMetadata = await import("../src/tool-metadata.js");
const { requireBridgeCapabilities, validateBridgeStatus } = bridgeClient;
const OpenCodeChromeBridgePlugin = pluginModule.default;
const TOOL_CAPABILITY_REQUIREMENTS = toolMetadata.TOOL_CAPABILITY_REQUIREMENTS;
const ALL_TOOL_REQUIRED_CAPABILITIES = toolMetadata.ALL_TOOL_REQUIRED_CAPABILITIES;

after(async () => {
  if (previousStateDir === undefined) delete process.env.OPENCODE_CHROME_BRIDGE_STATE_DIR;
  else process.env.OPENCODE_CHROME_BRIDGE_STATE_DIR = previousStateDir;
  await rm(stateDir, { recursive: true, force: true });
});

const caps = (...capabilities) => ["bridge.handshake", ...capabilities].sort();
const EXPECTED_TOOL_CAPABILITIES = {
  chrome_accessibility_tree: caps("browser.accessibility", "browser.tabs"),
  chrome_activate_tab: caps("browser.tabs", "browser.windows"),
  chrome_back: caps("browser.navigation", "browser.tabs"),
  chrome_batch: caps("browser.batch"),
  chrome_blocked_urls: caps("browser.navigation"),
  chrome_bookmarks: caps("browser.bookmarks"),
  chrome_cdp: caps("browser.cdp"),
  chrome_cdp_targets: caps("browser.cdp"),
  chrome_claim_tab: caps("browser.tabs", "session.tab-leases"),
  chrome_click: caps("browser.cdp", "browser.tabs"),
  chrome_click_element: caps("browser.accessibility", "browser.cdp", "browser.tabs"),
  chrome_close_tab: caps("browser.tabs"),
  chrome_cursor_state: caps("browser.tabs"),
  chrome_dom_content: caps("browser.cdp", "browser.tabs"),
  chrome_double_click: caps("browser.cdp", "browser.tabs"),
  chrome_download_cancel: caps("browser.downloads"),
  chrome_download_pause: caps("browser.downloads"),
  chrome_download_resume: caps("browser.downloads"),
  chrome_download_show: caps("browser.downloads"),
  chrome_downloads_list: caps("browser.downloads"),
  chrome_drag: caps("browser.cdp", "browser.tabs"),
  chrome_end_turn: caps("browser.cdp", "browser.tabs", "session.tab-leases"),
  chrome_evaluate: caps("browser.cdp", "browser.tabs"),
  chrome_events: caps("browser.events"),
  chrome_favicon_badge: caps("browser.tabs"),
  chrome_fill_element: caps("browser.accessibility", "browser.cdp", "browser.tabs"),
  chrome_upload_files: caps("browser.accessibility", "browser.file-upload", "browser.tabs"),
  chrome_find: caps("browser.find", "browser.tabs"),
  chrome_finalize_tabs: caps("browser.cdp", "browser.tabs", "session.tab-leases"),
  chrome_forward: caps("browser.navigation", "browser.tabs"),
  chrome_get_console_logs: caps("browser.cdp", "browser.console", "browser.tabs"),
  chrome_get_tab: caps("browser.tabs"),
  chrome_get_window_state: caps("browser.windows"),
  chrome_group_tabs: caps("browser.tab-groups", "browser.tabs"),
  chrome_history: caps("browser.history"),
  chrome_hover: caps("browser.cdp", "browser.tabs"),
  chrome_keypress: caps("browser.cdp", "browser.tabs"),
  chrome_move: caps("browser.cdp", "browser.tabs"),
  chrome_network_requests: caps("browser.cdp", "browser.network", "browser.tabs"),
  chrome_notify: caps("browser.notifications"),
  chrome_open: caps("browser.navigation", "browser.tabs", "session.tab-leases"),
  chrome_open_window: caps("browser.navigation", "browser.tabs", "browser.windows", "session.tab-leases"),
  chrome_page_text: caps("browser.cdp", "browser.tabs"),
  chrome_page_assets: caps("browser.assets", "browser.cdp", "browser.tabs"),
  chrome_read_page: caps("browser.accessibility", "browser.page-context", "browser.screenshots", "browser.tabs", "browser.windows"),
  chrome_resume_session: caps("browser.tab-groups", "browser.tabs", "session.resume"),
  chrome_release_debuggers: caps("browser.cdp"),
  chrome_reload: caps("browser.navigation", "browser.tabs"),
  chrome_reset_viewport: caps("browser.cdp", "browser.tabs"),
  chrome_schedule_create: caps("browser.schedules", "browser.workflows"),
  chrome_schedule_delete: caps("browser.schedules"),
  chrome_schedule_history: caps("browser.schedules"),
  chrome_schedule_run_now: caps("browser.schedules", "browser.workflows"),
  chrome_schedule_update: caps("browser.schedules", "browser.workflows"),
  chrome_schedules: caps("browser.schedules"),
  chrome_screenshot: caps("browser.screenshots", "browser.tabs", "browser.windows"),
  chrome_screenshot_region: caps("browser.cdp", "browser.screenshots", "browser.tabs", "browser.windows"),
  chrome_print_pdf: caps("browser.cdp", "browser.screenshots", "browser.tabs"),
  chrome_zotero_detect: caps("browser.cdp", "browser.tabs"),
  chrome_zotero_save: caps("browser.cdp", "browser.screenshots", "browser.tabs"),
  chrome_scroll: caps("browser.cdp", "browser.tabs"),
  chrome_set_viewport: caps("browser.cdp", "browser.tabs"),
  chrome_set_window_state: caps("browser.windows"),
  chrome_subscribe_cdp: caps("browser.cdp", "browser.events", "browser.tabs"),
  chrome_tab_group_create: caps("browser.tab-groups", "browser.tabs"),
  chrome_tab_group_update: caps("browser.tab-groups", "browser.tabs"),
  chrome_tab_groups: caps("browser.tab-groups", "browser.tabs"),
  chrome_tab_context: caps("browser.page-context", "browser.tabs"),
  chrome_tabs: caps("browser.tabs"),
  chrome_type: caps("browser.cdp", "browser.tabs"),
  chrome_ungroup_tabs: caps("browser.tab-groups", "browser.tabs"),
  chrome_unsubscribe_cdp: caps("browser.cdp", "browser.events", "browser.tabs"),
  chrome_wait_for: caps("browser.cdp", "browser.downloads", "browser.tabs", "browser.wait"),
  chrome_webmcp_invoke: caps("browser.tabs", "browser.webmcp"),
  chrome_webmcp_list: caps("browser.tabs", "browser.webmcp"),
  chrome_workflow_cancel: caps("browser.workflows"),
  chrome_workflow_delete: caps("browser.workflows"),
  chrome_workflow_get: caps("browser.workflows"),
  chrome_workflow_import: caps("browser.workflows"),
  chrome_workflow_run: caps("browser.workflows"),
  chrome_workflow_start: caps("browser.workflows"),
  chrome_workflow_stop: caps("browser.workflows"),
  chrome_workflows: caps("browser.workflows"),
  chrome_wizard_step: caps("browser.cdp", "browser.screenshots", "browser.tabs", "browser.windows")
};

function compatibleStatus(overrides = {}) {
  return {
    ok: true,
    hostReachable: true,
    legacy: false,
    connected: true,
    compatible: true,
    host: {
      name: "com.opencode.chrome_bridge",
      version: "1.1.0",
      protocolMin: "1.0.0",
      protocolMax: "1.0.0"
    },
    client: {
      name: "opencode-plugin",
      version: "1.1.0",
      protocolMin: "1.0.0",
      protocolMax: "1.0.0"
    },
    extension: {
      extensionId: "extension-id",
      extensionVersion: "1.1.0",
      hostName: "com.opencode.chrome_bridge",
      protocolVersion: "1.0.0",
      capabilities: ["bridge.handshake", "browser.tabs"]
    },
    missingCapabilities: [],
    diagnostics: [],
    ...overrides
  };
}

test("bridge status schema accepts supported ranges and capabilities", () => {
  const status = validateBridgeStatus(compatibleStatus());

  assert.equal(status.compatible, true);
  assert.deepEqual(status.extension.capabilities, ["bridge.handshake", "browser.tabs"]);
});

test("bridge status schema rejects malformed protocol versions", () => {
  const malformed = compatibleStatus({
    extension: {
      ...compatibleStatus().extension,
      protocolVersion: "latest"
    }
  });

  assert.throws(() => validateBridgeStatus(malformed), /extension protocol version/u);
});

test("bridge status compatibility requires an empty diagnostics list", async () => {
  const contradictory = compatibleStatus({
    diagnostics: [{
      code: "CLIENT_VERSION_INVALID",
      message: "The client version is invalid.",
      repair: "Update the OpenCode plugin."
    }]
  });

  assert.throws(
    () => validateBridgeStatus(contradictory),
    /compatibility.*diagnostics|diagnostics.*compatibility/iu
  );
  await assert.rejects(
    () => requireBridgeCapabilities(["browser.tabs"], contradictory),
    /compatibility.*diagnostics|diagnostics.*compatibility/iu
  );
  assert.throws(
    () => validateBridgeStatus(compatibleStatus({ compatible: false })),
    /compatibility is inconsistent|diagnostics are required/iu
  );
});

test("disconnected and incompatible status payloads require diagnostics", () => {
  assert.throws(
    () => validateBridgeStatus(compatibleStatus({ connected: false, compatible: false, extension: null, diagnostics: [] })),
    /diagnostics.*required|require.*diagnostics/iu
  );
  assert.throws(
    () => validateBridgeStatus(compatibleStatus({
      compatible: false,
      diagnostics: [],
      extension: { ...compatibleStatus().extension, protocolVersion: "2.0.0" }
    })),
    /diagnostics.*required|require.*diagnostics/iu
  );
});

test("legacy host status is distinct from a current host with a disconnected extension", async () => {
  const originalFetch = globalThis.fetch;
  const responses = [
    { ok: true, pid: 101, pending: 0 },
    compatibleStatus({
      connected: false,
      compatible: false,
      extension: null,
      diagnostics: [{
        code: "EXTENSION_DISCONNECTED",
        message: "The Chrome extension did not answer the handshake.",
        repair: "Reload Chrome."
      }]
    })
  ];
  globalThis.fetch = async () => new Response(JSON.stringify(responses.shift()), {
    headers: { "Content-Type": "application/json" },
    status: 200
  });
  try {
    const legacy = await bridgeClient.bridgeStatus(["bridge.handshake", "browser.tabs"]);
    assert.equal(legacy.hostReachable, true);
    assert.equal(legacy.legacy, true);
    assert.equal(legacy.connected, false);
    assert.equal(legacy.compatible, false);
    assert.equal(legacy.diagnostics[0].code, "HOST_HANDSHAKE_MISSING");
    assert.deepEqual(legacy.missingCapabilities, ["bridge.handshake", "browser.tabs"]);
    await assert.rejects(
      () => requireBridgeCapabilities(["browser.tabs"], legacy),
      /native host.*outdated.*install:native/isu
    );

    const disconnected = await bridgeClient.bridgeStatus(["bridge.handshake", "browser.tabs"]);
    assert.equal(disconnected.hostReachable, true);
    assert.equal(disconnected.legacy, false);
    assert.equal(disconnected.connected, false);
    assert.equal(disconnected.diagnostics[0].code, "EXTENSION_DISCONNECTED");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("successful bridge responses with invalid JSON fail with a clear error", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("not json", {
    headers: { "Content-Type": "application/json" },
    status: 200
  });
  try {
    await assert.rejects(
      () => bridgeClient.bridgeCommand("listTabs"),
      /invalid JSON response/u
    );
    await assert.rejects(
      () => bridgeClient.pollEvents(0),
      /invalid JSON response/u
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("legacy host recognition rejects lookalike payloads with extra fields", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    ok: true,
    pending: 0,
    pid: 101,
    token: "must-not-be-normalized"
  }), { headers: { "Content-Type": "application/json" }, status: 200 });
  try {
    await assert.rejects(
      () => bridgeClient.bridgeStatus(["bridge.handshake"]),
      /connected must be a boolean/u
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("required capabilities fail with sorted actionable names", async () => {
  const status = compatibleStatus({
    compatible: false,
    missingCapabilities: ["browser.windows", "browser.downloads"],
    diagnostics: [{
      code: "MISSING_CAPABILITIES",
      message: "The extension is missing required capabilities.",
      repair: "Reload the current extension build."
    }]
  });

  await assert.rejects(
    () => requireBridgeCapabilities(["browser.windows", "browser.downloads"], status),
    /browser\.downloads, browser\.windows.*Reload the current extension build\./su
  );
});

test("disconnected and incompatible extensions produce different failures", async () => {
  const disconnected = compatibleStatus({
    connected: false,
    compatible: false,
    extension: null,
    diagnostics: [{
      code: "EXTENSION_DISCONNECTED",
      message: "The Chrome extension is not connected.",
      repair: "Reload Chrome or reinstall the native host."
    }]
  });
  const incompatible = compatibleStatus({
    compatible: false,
    extension: {
      ...compatibleStatus().extension,
      protocolVersion: "2.0.0"
    },
    diagnostics: [{
      code: "PROTOCOL_INCOMPATIBLE",
      message: "The extension protocol is outside the supported range.",
      repair: "Update the extension and native host together."
    }]
  });

  await assert.rejects(
    () => requireBridgeCapabilities(["bridge.handshake"], disconnected),
    /not connected.*Reload Chrome/su
  );
  await assert.rejects(
    () => requireBridgeCapabilities(["bridge.handshake"], incompatible),
    /incompatible.*Update the extension and native host together/su
  );
});

test("popup renders compatibility diagnostics returned by the service worker", async () => {
  const source = await readFile(path.join(repoRoot, "extension", "popup.js"), "utf8");
  const elements = new Map();
  for (const id of ["status", "statusText", "statusDetail", "version", "learnMore", "settingsButton", "copyrightLink"]) {
    elements.set(id, {
      classList: { toggle() {} },
      addEventListener() {},
      textContent: ""
    });
  }
  const response = compatibleStatus({
    compatible: false,
    diagnostics: [{
      code: "PROTOCOL_INCOMPATIBLE",
      message: "Protocol 2.0.0 is not supported.",
      repair: "Update the native host."
    }]
  });
  const context = vm.createContext({
    URL,
    chrome: {
      runtime: {
        getManifest: () => ({ version: "1.1.0" }),
        sendMessage: async () => response
      },
      tabs: { create() {} }
    },
    document: { getElementById: (id) => elements.get(id) ?? null },
    globalThis: null,
    open() {},
    setTimeout() {}
  });
  context.globalThis = context;

  vm.runInContext(source, context, { filename: "extension/popup.js" });
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(elements.get("statusText").textContent, "Update required");
  assert.equal(
    elements.get("statusDetail").textContent,
    "Protocol 2.0.0 is not supported. Update the native host."
  );
});

test("every public browser tool has an explicit exhaustive capability declaration", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const publicTools = Object.keys(plugin.tool).filter((name) => name !== "chrome_status").sort();

  assert.deepEqual(Object.keys(TOOL_CAPABILITY_REQUIREMENTS ?? {}).sort(), publicTools);
  assert.deepEqual(TOOL_CAPABILITY_REQUIREMENTS, EXPECTED_TOOL_CAPABILITIES);
  assert.deepEqual(
    ALL_TOOL_REQUIRED_CAPABILITIES,
    [...new Set(Object.values(EXPECTED_TOOL_CAPABILITIES).flat())].sort()
  );
});

test("chrome_status requests the sorted union of every public tool capability", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const originalFetch = globalThis.fetch;
  let requestedCapabilities;
  globalThis.fetch = async (_url, options) => {
    requestedCapabilities = options?.headers?.["X-OpenCode-Bridge-Capabilities"];
    return new Response(JSON.stringify(compatibleStatus({
      extension: {
        ...compatibleStatus().extension,
        capabilities: ALL_TOOL_REQUIRED_CAPABILITIES
      }
    })), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  };
  try {
    await plugin.tool.chrome_status.execute({});
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.equal(requestedCapabilities, ALL_TOOL_REQUIRED_CAPABILITIES.join(","));
});

test("every browser tool fails before execution when its negotiated capability is missing", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const statusWithoutToolCapabilities = compatibleStatus({
    extension: {
      ...compatibleStatus().extension,
      capabilities: ["bridge.handshake"]
    }
  });
  const originalFetch = globalThis.fetch;
  let statusRequests = 0;
  const requestedCapabilities = [];
  globalThis.fetch = async (_url, options) => {
    assert.equal(options?.method, "GET", "preflight must query status before a browser command");
    statusRequests += 1;
    requestedCapabilities.push(options?.headers?.["X-OpenCode-Bridge-Capabilities"]);
    return new Response(JSON.stringify(statusWithoutToolCapabilities), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  };
  try {
    for (const name of Object.keys(EXPECTED_TOOL_CAPABILITIES)) {
      const args = name === "chrome_batch"
        ? { actions: [{ type: "getTab", params: { tabId: 7 } }] }
        : {};
      const negotiated = pluginModule.requiredCapabilitiesForTool(name, args);
      let asked = 0;
      await assert.rejects(
        () => plugin.tool[name].execute(args, {
          ask: async () => { asked += 1; },
          directory: repoRoot
        }),
        (error) => {
          const missing = negotiated.filter((capability) => capability !== "bridge.handshake");
          assert.match(error.message, /Missing capabilities:/u, name);
          for (const capability of missing) assert.match(error.message, new RegExp(capability.replaceAll(".", "\\."), "u"), name);
          return true;
        },
        name
      );
      assert.equal(asked, 1, `${name} must ask exactly once before capability preflight`);
      assert.equal(requestedCapabilities.at(-1), negotiated.join(","), `${name} must negotiate only its required capabilities for the call`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.equal(statusRequests, Object.keys(EXPECTED_TOOL_CAPABILITIES).length);
});

test("chrome_read_page negotiates screenshot and window capabilities only when capturing", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const statusWithoutToolCapabilities = compatibleStatus({
    extension: {
      ...compatibleStatus().extension,
      capabilities: ["bridge.handshake"]
    }
  });
  const originalFetch = globalThis.fetch;
  const requestedCapabilities = [];
  globalThis.fetch = async (_url, options) => {
    requestedCapabilities.push(options?.headers?.["X-OpenCode-Bridge-Capabilities"]);
    return new Response(JSON.stringify(statusWithoutToolCapabilities), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  };
  try {
    await assert.rejects(
      plugin.tool.chrome_read_page.execute({ includeScreenshot: false }, { ask: async () => {}, directory: repoRoot }),
      /Missing capabilities:/u
    );
    await assert.rejects(
      plugin.tool.chrome_read_page.execute(
        { includeScreenshot: true, outputDirectory: "browser-output" },
        { ask: async () => {}, directory: repoRoot }
      ),
      /Missing capabilities:/u
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(
    requestedCapabilities[0],
    caps("browser.accessibility", "browser.page-context", "browser.tabs").join(",")
  );
  assert.equal(requestedCapabilities[1], EXPECTED_TOOL_CAPABILITIES.chrome_read_page.join(","));
});
