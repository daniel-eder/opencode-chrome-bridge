import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";

const previousStateDir = process.env.OPENCODE_CHROME_BRIDGE_STATE_DIR;
const stateDir = await mkdtemp(path.join(os.tmpdir(), "opencode-origin-permissions-"));
process.env.OPENCODE_CHROME_BRIDGE_STATE_DIR = stateDir;
await writeFile(path.join(stateDir, "state.json"), JSON.stringify({
  host: "127.0.0.1",
  port: 31337,
  token: "a".repeat(32)
}), { mode: 0o600 });

const pluginModule = await import("../src/opencode-plugin.js");
const toolMetadata = await import("../src/tool-metadata.js");
const OpenCodeChromeBridgePlugin = pluginModule.default;

after(async () => {
  if (previousStateDir === undefined) delete process.env.OPENCODE_CHROME_BRIDGE_STATE_DIR;
  else process.env.OPENCODE_CHROME_BRIDGE_STATE_DIR = previousStateDir;
  await rm(stateDir, { recursive: true, force: true });
});

function compatibleStatus() {
  return {
    ok: true,
    connected: true,
    compatible: true,
    hostReachable: true,
    legacy: false,
    host: { name: "com.opencode.chrome_bridge", version: "1.5.0", protocolMin: "1.0.0", protocolMax: "1.0.0" },
    client: { name: "opencode-plugin", version: "1.5.0", protocolMin: "1.0.0", protocolMax: "1.0.0" },
    extension: {
      extensionId: "extension-id", extensionName: "opencode-chrome-bridge", extensionVersion: "1.5.0", protocolVersion: "1.0.0",
      hostName: "com.opencode.chrome_bridge",
      capabilities: toolMetadata.ALL_TOOL_REQUIRED_CAPABILITIES
    },
    missingCapabilities: [],
    diagnostics: []
  };
}

function installBridge(respond) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const trace = [];
  globalThis.fetch = async (_url, options = {}) => {
    if (options.method === "GET") {
      trace.push("handshake");
      return new Response(JSON.stringify(compatibleStatus()), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    const request = JSON.parse(options.body);
    const command = request.method === "scopedCommand"
      ? { ...request.params, scoped: true }
      : request;
    calls.push(command);
    trace.push(command.method);
    const result = await respond(command, calls);
    return new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  return { calls, trace, restore: () => { globalThis.fetch = originalFetch; } };
}

function context(asks, sessionID = "session-a") {
  return {
    directory: path.resolve(import.meta.dirname, ".."),
    sessionID,
    ask: async (request) => { asks.push(request); }
  };
}

test("canonical page scopes include effective ports and normalized IDN paths", () => {
  assert.equal(
    pluginModule.canonicalPageScope("HTTPS://B\u00dcCHER.example:443/a/../caf%C3%A9/%7euser?token=x#part"),
    "https://xn--bcher-kva.example:443/caf%C3%A9/~user"
  );
  assert.equal(pluginModule.canonicalPageScope("http://Example.COM"), "http://example.com:80/");
  assert.equal(pluginModule.canonicalPageScope("https://example.com:444/a"), "https://example.com:444/a");
  assert.equal(pluginModule.canonicalPageScope("https://example.com/app/"), "https://example.com:443/app/");
  assert.throws(() => pluginModule.canonicalPageScope("file:///tmp/private"), /http.*https/iu);
  for (const ambiguous of [
    "https://example.com/app/..%2Fadmin",
    "https://example.com/app/..%5Cadmin",
    "https://example.com/app/%252e%252e%252fadmin"
  ]) {
    assert.throws(() => pluginModule.canonicalPageScope(ambiguous), /ambiguous|encoded|separator|traversal/iu);
  }
});

test("schedule creation requires a dedicated exact persistent approval after the generic tool grant", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const approval = {
    version: 1,
    pattern: `v1:${"a".repeat(64)}`,
    scheduleId: "schedule-1",
    workflowSchemaVersion: 1,
    workflowId: "workflow-1",
    workflowFingerprint: "b".repeat(64),
    recurrence: { kind: "daily", hour: 9, minute: 30 },
    recurrenceFingerprint: "c".repeat(64),
    notificationPolicy: "failure",
    requiredOrigins: ["https://example.com"],
    managedTabs: [{ tabId: 7, sessionId: "session-a", leaseId: "lease-a" }]
  };
  const bridge = installBridge(async (command) => {
    if (command.method === "scheduleApprovalPreview") return approval;
    throw new Error(`unexpected mutating bridge call ${command.method}`);
  });
  const asks = [];
  try {
    await assert.rejects(() => plugin.tool.chrome_schedule_create.execute({
      enabled: true,
      name: "Daily",
      notify: "failure",
      recurrence: { kind: "daily", hour: 9, minute: 30 },
      requiredOrigins: ["https://example.com"],
      workflowId: "workflow-1"
    }, {
      directory: path.resolve(import.meta.dirname, ".."),
      sessionID: "session-a",
      ask: async (request) => {
        asks.push(request);
        if (request.permission === "browser.schedule-unattended") throw new Error("dedicated approval denied");
      }
    }), /dedicated approval denied/u);
  } finally {
    bridge.restore();
  }
  assert.deepEqual(bridge.calls.map((entry) => entry.method), ["scheduleApprovalPreview"]);
  assert.equal(asks.length, 2);
  assert.equal(asks[0].permission, "chrome_schedule_create");
  assert.equal(asks[1].permission, "browser.schedule-unattended");
  assert.deepEqual(asks[1].patterns, [approval.pattern]);
  assert.deepEqual(asks[1].always, [approval.pattern]);
  assert.deepEqual(asks[1].metadata, {
    action: "Approve unattended browser workflow schedule",
    notificationPolicy: "failure",
    originCount: 1,
    origins: ["https://example.com"],
    recurrence: { kind: "daily", hour: 9, minute: 30 },
    scheduleId: "schedule-1",
    workflowFingerprint: "b".repeat(64),
    workflowId: "workflow-1",
    workflowSchemaVersion: 1
  });
  assert.equal(JSON.stringify(asks[1]).includes("lease-a"), false);
});

test("mocked public orchestration handshakes then runs context, find, batch, resume, workflow, and schedule preflight", async () => {
  pluginModule.clearPageOriginSessionGrants();
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const ctx = context(asks, "release-e2e");
  const workflow = {
    id: "workflow-e2e",
    name: "Release E2E",
    shortcut: "release-e2e",
    schemaVersion: 1,
    requiredCapabilities: ["browser.tabs"],
    requiredOrigins: ["https://example.com:443/app"],
    steps: [{ method: "getTab", params: { tabId: 7 }, timeoutMs: 1000 }]
  };
  const approval = {
    version: 1,
    pattern: `v1:${"a".repeat(64)}`,
    scheduleId: "schedule-e2e",
    workflowSchemaVersion: 1,
    workflowId: workflow.id,
    workflowFingerprint: "b".repeat(64),
    recurrence: { kind: "daily", hour: 9, minute: 30 },
    recurrenceFingerprint: "c".repeat(64),
    notificationPolicy: "failure",
    requiredOrigins: ["https://example.com:443/app"],
    managedTabs: [{ tabId: 7, sessionId: "release-e2e", leaseId: "lease-e2e" }]
  };
  const bridge = installBridge(({ method, params }) => {
    if (method === "getTab") return {
      active: true, documentId: "document-7", id: 7, index: 0,
      navigationGeneration: 2, title: "App", url: "https://example.com/app", windowId: 1
    };
    if (method === "tabContext") return {
      documentHeight: 900, documentWidth: 1440, mimeType: "text/html", selectedRefs: [],
      selection: "", tabId: 7, title: "App", url: "https://example.com/app", visibleText: "Pay now"
    };
    if (method === "findElements") return {
      matches: [{ name: "Pay now", ref: "e1", role: "button", score: 100 }], tabId: 7, truncated: false
    };
    if (method === "browserBatch") return {
      ok: true, results: [{ index: 0, ok: true, result: { id: 7, url: "https://example.com/app" }, type: params.actions[0].type }]
    };
    if (method === "resumeSession") return { resumed: true, sessionId: params.sessionId, tabs: [{ id: 7 }] };
    if (method === "workflowStartRecording") return { recording: true };
    if (method === "workflowStopRecording" || method === "workflowGet") return workflow;
    if (method === "workflowRun") return { ok: true, results: [{ index: 0, ok: true }], workflowId: workflow.id };
    if (method === "scheduleApprovalPreview") return approval;
    if (method === "scheduleCreate") return { enabled: true, id: approval.scheduleId, workflowId: workflow.id };
    throw new Error(`unexpected ${method}`);
  });
  try {
    assert.equal(JSON.parse(await plugin.tool.chrome_tab_context.execute({
      maxChars: 50000, maxSelectionChars: 2000, previewChars: 12000, saveText: false, tabId: 7
    }, ctx)).visibleText, "Pay now");
    assert.equal(JSON.parse(await plugin.tool.chrome_find.execute({
      interactiveOnly: true, limit: 20, query: "Pay", tabId: 7, visibleOnly: true
    }, ctx)).matches[0].ref, "e1");
    assert.equal(JSON.parse(await plugin.tool.chrome_batch.execute({
      actions: [{ type: "getTab", params: { tabId: 7 }, timeoutMs: 1000 }],
      stopOnError: true, totalTimeoutMs: 5000
    }, ctx)).ok, true);
    assert.equal(JSON.parse(await plugin.tool.chrome_resume_session.execute({
      sessionId: "release-e2e", turnId: "turn-2"
    }, ctx)).resumed, true);
    await plugin.tool.chrome_workflow_start.execute({ name: "Release E2E", shortcut: "release-e2e" }, ctx);
    await plugin.tool.chrome_workflow_stop.execute({}, ctx);
    assert.equal(JSON.parse(await plugin.tool.chrome_workflow_run.execute({
      id: workflow.id, totalTimeoutMs: 5000
    }, ctx)).ok, true);
    assert.equal(JSON.parse(await plugin.tool.chrome_schedule_create.execute({
      enabled: true,
      name: "Daily E2E",
      notify: "failure",
      recurrence: { kind: "daily", hour: 9, minute: 30 },
      requiredOrigins: ["https://example.com:443/app"],
      workflowId: workflow.id
    }, ctx)).id, approval.scheduleId);
  } finally {
    bridge.restore();
  }
  assert.equal(bridge.trace[0], "handshake");
  for (const method of [
    "tabContext", "findElements", "browserBatch", "resumeSession", "workflowStartRecording",
    "workflowStopRecording", "workflowRun", "scheduleApprovalPreview", "scheduleCreate"
  ]) assert.ok(bridge.trace.includes(method), `missing E2E command ${method}`);
  assert.ok(asks.some((entry) => entry.permission === "browser.schedule-unattended"));
  assert.ok(bridge.trace.indexOf("scheduleApprovalPreview") < bridge.trace.indexOf("scheduleCreate"));
});

test("path grants honor segment boundaries and never cross scheme or port", () => {
  assert.equal(pluginModule.pageScopeCovers("https://example.com:443/app", "https://example.com:443/app"), true);
  assert.equal(pluginModule.pageScopeCovers("https://example.com:443/app", "https://example.com:443/app/orders"), true);
  assert.equal(pluginModule.pageScopeCovers("https://example.com:443/app/", "https://example.com:443/app/orders"), true);
  assert.equal(pluginModule.pageScopeCovers("https://example.com:443/app", "https://example.com:443/apple"), false);
  assert.equal(pluginModule.pageScopeCovers("https://example.com:443/app", "http://example.com:80/app"), false);
  assert.equal(pluginModule.pageScopeCovers("https://example.com:443/app", "https://example.com:444/app"), false);
});

test("workflow run preflights its complete origin union in one approval before playback", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method, params }) => {
    if (method === "workflowGet") return {
      id: "checkout", requiredOrigins: ["https://untrusted-superset.example"],
      steps: [{ method: "getTab", params: { tabId: 7 } }, { method: "getTab", params: { tabId: 8 } }]
    };
    if (method === "getTab") return {
      documentId: `document-${params.tabId}`, id: params.tabId, navigationGeneration: 3,
      url: params.tabId === 7 ? "https://shop.example/cart" : "https://pay.example/checkout"
    };
    if (method === "workflowRun") {
      assert.deepEqual(params.expectedOrigins, ["https://pay.example:443/", "https://shop.example:443/"]);
      return { ok: true, results: [], workflowId: "checkout" };
    }
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_workflow_run.execute({ id: "checkout", totalTimeoutMs: 5000 }, context(asks));
  } finally {
    bridge.restore();
  }
  const originAsks = asks.filter((entry) => entry.permission === "browser.origin");
  assert.equal(originAsks.length, 1);
  assert.deepEqual(originAsks[0].patterns, ["https://pay.example:443/", "https://shop.example:443/"]);
  assert.deepEqual(bridge.calls.map((entry) => entry.method), ["workflowGet", "getTab", "getTab", "workflowGet", "workflowRun"]);
  const runCall = bridge.calls.at(-1);
  assert.equal(runCall.scoped, true);
  assert.deepEqual(runCall.expectedBindings.map((entry) => entry.tabId), [7, 8]);
});

test("evaluate asks once for the origin root and a prior path grant does not cover it", async () => {
  pluginModule.clearPageOriginSessionGrants();
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") return {
      documentId: "document-public", id: 7, navigationGeneration: 1, url: "https://example.com/public"
    };
    if (method === "pageText") return { text: "public" };
    if (method === "evaluate") return "evaluated";
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_page_text.execute({
      maxChars: 100, originGrant: "session", tabId: 7
    }, context(asks, "root-scope-session"));
    await plugin.tool.chrome_evaluate.execute({
      expression: "document.cookie", originGrant: "session", tabId: 7
    }, context(asks, "root-scope-session"));
  } finally {
    bridge.restore();
  }
  const originAsks = asks.filter((entry) => entry.permission === "browser.origin");
  assert.deepEqual(originAsks.map((entry) => entry.patterns), [
    ["https://example.com:443/public"],
    ["https://example.com:443/"]
  ]);
  assert.equal(originAsks.filter((entry) => entry.patterns[0] === "https://example.com:443/").length, 1);
  const evaluateCall = bridge.calls.find((entry) => entry.method === "evaluate");
  assert.deepEqual(evaluateCall.expectedScopes, ["https://example.com:443/public"]);
  assert.equal(evaluateCall.expectedBindings[0].documentId, "document-public");
});

test("wizard click-only stays path-scoped while expression mode asks one origin root", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") return {
      documentId: "document-public", id: 7, navigationGeneration: 1, url: "https://example.com/public"
    };
    if (method === "click") return { clicked: true };
    if (method === "evaluate") return "evaluated";
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_wizard_step.execute({ tabId: 7, waitMs: 0, x: 1, y: 2 }, context(asks, "wizard-path"));
    await plugin.tool.chrome_wizard_step.execute({
      expression: "document.cookie", tabId: 7, waitMs: 0, x: 1, y: 2
    }, context(asks, "wizard-root"));
  } finally {
    bridge.restore();
  }
  const originPatterns = asks.filter((entry) => entry.permission === "browser.origin").map((entry) => entry.patterns);
  assert.deepEqual(originPatterns, [
    ["https://example.com:443/public"],
    ["https://example.com:443/"]
  ]);
});

test("raw CDP Runtime object followups ask once for the current origin root", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") return {
      documentId: "document-public", id: 7, navigationGeneration: 1, url: "https://example.com/public"
    };
    if (method === "cdpCommand") return { result: { value: 1 } };
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_cdp.execute({
      commandParams: { objectId: "remote-object-1" }, method: "Runtime.getProperties", tabId: 7
    }, context(asks));
  } finally {
    bridge.restore();
  }
  const originAsks = asks.filter((entry) => entry.permission === "browser.origin");
  assert.deepEqual(originAsks.map((entry) => entry.patterns), [["https://example.com:443/"]]);
});

test("raw Page.navigate asks for the current origin root and exact destination without duplicates", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") return {
      documentId: "document-public", id: 7, navigationGeneration: 1, url: "https://example.com/public"
    };
    if (method === "cdpCommand") return { frameId: "frame-7" };
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_cdp.execute({
      commandParams: { url: "https://next.example/landing" }, method: "Page.navigate", tabId: 7
    }, context(asks));
  } finally {
    bridge.restore();
  }
  const originAsks = asks.filter((entry) => entry.permission === "browser.origin");
  assert.deepEqual(originAsks.map((entry) => entry.patterns), [[
    "https://example.com:443/",
    "https://next.example:443/landing"
  ]]);
});

test("open asks for its normalized destination and exposes the same scope as an always rule", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method, params }) => {
    if (method === "createTab") return { id: 9, url: params.url };
    assert.equal(method, "getTab");
    return { id: 9, url: "https://xn--bcher-kva.example/checkout" };
  });
  try {
    await plugin.tool.chrome_open.execute({ url: "https://B\u00dcCHER.example/shop/../checkout" }, context(asks));
  } finally {
    bridge.restore();
  }
  assert.equal(asks[0].permission, "chrome_open");
  assert.deepEqual(asks[1].patterns, ["https://xn--bcher-kva.example:443/checkout"]);
  assert.deepEqual(asks[1].always, ["https://xn--bcher-kva.example:443/checkout"]);
  assert.deepEqual(bridge.calls.map((entry) => entry.method), ["createTab", "getTab"]);
});

test("tab reads resolve minimal metadata after the tool prompt and re-prompt after a redirect", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  let metadataReads = 0;
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") {
      metadataReads += 1;
      return { id: 7, url: metadataReads === 1 ? "https://example.com/app" : "https://login.example.com/callback" };
    }
    assert.equal(method, "pageText");
    return { text: "redirected", url: "https://intermediate.example.org/continue" };
  });
  try {
    await plugin.tool.chrome_page_text.execute({ tabId: 7, maxChars: 100 }, context(asks));
  } finally {
    bridge.restore();
  }
  assert.deepEqual(asks.map((entry) => entry.permission), ["chrome_page_text", "browser.origin", "browser.origin"]);
  assert.deepEqual(asks[1].patterns, ["https://example.com:443/app"]);
  assert.deepEqual(asks[2].patterns, [
    "https://intermediate.example.org:443/continue",
    "https://login.example.com:443/callback"
  ]);
  assert.deepEqual(bridge.calls.map((entry) => entry.method), ["getTab", "pageText", "getTab"]);
});

test("new-tab redirects are re-evaluated before returning page metadata", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method, params }) => {
    if (method === "createTab") return { id: 12, url: params.url };
    if (method === "getTab") return { id: 12, url: "https://accounts.example.net/login" };
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_open.execute({ url: "https://example.com/app" }, context(asks));
  } finally {
    bridge.restore();
  }
  assert.deepEqual(
    asks.filter((entry) => entry.permission === "browser.origin").map((entry) => entry.patterns),
    [["https://example.com:443/app"], ["https://accounts.example.net:443/login"]]
  );
});

test("open survives a pending new-tab URL by falling back to the requested destination", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method, params }) => {
    if (method === "createTab") return { id: 13, url: params.url };
    if (method === "getTab") return { id: 13, url: "", pendingUrl: "" };
    throw new Error(`unexpected ${method}`);
  });
  let result;
  try {
    result = await plugin.tool.chrome_open.execute({ url: "https://example.com/app" }, context(asks));
  } finally {
    bridge.restore();
  }
  assert.match(String(result), /example\.com/);
  assert.deepEqual(
    asks.filter((entry) => entry.permission === "browser.origin").map((entry) => entry.patterns),
    [["https://example.com:443/app"]]
  );
});

test("tab scope prefers a committed pendingUrl when the committed URL is not ready", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") return { id: 7, pendingUrl: "https://example.com/app", url: "" };
    if (method === "pageText") return { text: "ok", url: "https://example.com/app" };
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_page_text.execute({ tabId: 7, maxChars: 100 }, context(asks));
  } finally {
    bridge.restore();
  }
  assert.deepEqual(
    asks.filter((entry) => entry.permission === "browser.origin").map((entry) => entry.patterns),
    [["https://example.com:443/app"]]
  );
});

test("explicit session grants are cached only inside their context sessionID", async () => {
  pluginModule.clearPageOriginSessionGrants();
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method }) => method === "getTab"
    ? { id: 7, url: "https://example.com/app" }
    : { text: "ok" });
  try {
    const args = { tabId: 7, maxChars: 100, originGrant: "session" };
    await plugin.tool.chrome_page_text.execute(args, context(asks, "session-a"));
    await plugin.tool.chrome_page_text.execute(args, context(asks, "session-a"));
    await plugin.tool.chrome_page_text.execute(args, context(asks, "session-b"));
  } finally {
    bridge.restore();
  }
  assert.equal(asks.filter((entry) => entry.permission === "chrome_page_text").length, 3);
  assert.equal(asks.filter((entry) => entry.permission === "browser.origin").length, 2);
});

test("session grants fail closed without an explicit context sessionID", async () => {
  pluginModule.clearPageOriginSessionGrants();
  const plugin = await OpenCodeChromeBridgePlugin();
  const bridge = installBridge(({ method }) => method === "getTab"
    ? { id: 7, url: "https://example.com/app" }
    : { text: "must not run" });
  try {
    await assert.rejects(() => plugin.tool.chrome_page_text.execute({
      tabId: 7,
      maxChars: 100,
      originGrant: "session"
    }, { directory: path.resolve(import.meta.dirname, ".."), ask: async () => {} }), /context\.sessionID/u);
  } finally {
    bridge.restore();
  }
  assert.deepEqual(bridge.calls.map((entry) => entry.method), ["getTab"]);
});

test("raw CDP rejects browser-wide Target methods before dispatch", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const bridge = installBridge(({ method }) => method === "getTab"
    ? { id: 7, url: "https://example.com/app" }
    : (() => { throw new Error("raw CDP must not dispatch"); })());
  try {
    await assert.rejects(() => plugin.tool.chrome_cdp.execute({
      tabId: 7,
      method: "Target.getTargets"
    }, context([])), /Target.*dedicated|browser-wide|not allowed/iu);
  } finally {
    bridge.restore();
  }
  assert.equal(bridge.calls.some((entry) => entry.method === "cdpCommand"), false);
});

test("raw CDP allowlist rejects global storage, cookie, and browser domains", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  for (const method of [
    "DOM.getDocument", "DOM.querySelector", "DOM.querySelectorAll", "DOM.getOuterHTML",
    "DOM.describeNode", "DOM.getAttributes", "DOM.getBoxModel", "DOMSnapshot.captureSnapshot",
    "Storage.getCookies", "Storage.clearDataForOrigin", "Network.getAllCookies",
    "Network.setCookie", "Browser.getVersion", "Security.enable", "SystemInfo.getInfo",
    "Fetch.enable", "Fetch.disable"
  ]) {
    const bridge = installBridge(({ method: bridgeMethod }) => bridgeMethod === "getTab"
      ? { id: 7, url: "https://example.com/app" }
      : (() => { throw new Error("forbidden CDP dispatched"); })());
    try {
      await assert.rejects(() => plugin.tool.chrome_cdp.execute({ tabId: 7, method }, context([])), /CDP method.*not allowed|dedicated/iu, method);
    } finally {
      bridge.restore();
    }
    assert.equal(bridge.calls.some((entry) => entry.method === "cdpCommand"), false, method);
  }
});

test("allowlisted targetId CDP resolves a top-level tab binding for evaluate and navigate", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const bridge = installBridge(({ method, params }) => {
    if (method === "cdpTargets") return [{ id: "target-7", tabId: 7, type: "page", url: "https://example.com/app" }];
    if (method === "getTab") return {
      documentId: "document-7", id: 7, navigationGeneration: 4, url: "https://example.com/app"
    };
    if (method === "cdpCommand") return params.method === "Runtime.evaluate" ? { result: { value: 2 } } : { frameId: "frame-7" };
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_cdp.execute({
      commandParams: { expression: "1 + 1", returnByValue: true }, method: "Runtime.evaluate", targetId: "target-7"
    }, context([]));
    await plugin.tool.chrome_cdp.execute({
      commandParams: { url: "https://next.example/path" }, method: "Page.navigate", targetId: "target-7"
    }, context([]));
  } finally {
    bridge.restore();
  }
  const dispatched = bridge.calls.filter((entry) => entry.method === "cdpCommand");
  assert.equal(dispatched.length, 2);
  assert.ok(dispatched.every((entry) => entry.params.tabId === 7 && entry.expectedBindings[0].documentId === "document-7"));
});

test("batch preflights a deduplicated origin union once before its first side effect", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method, params }) => {
    if (method === "getTab") return { id: params.tabId, url: "https://example.com/app" };
    if (method === "browserBatch") {
      const action = params.actions[0];
      return { results: [{ index: 0, ok: true, result: { id: action.params.tabId, url: action.params.url ?? "https://example.com/app" }, type: action.type }] };
    }
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_batch.execute({
      actions: [
        { type: "getTab", params: { tabId: 7 } },
        { type: "findElements", params: { tabId: 7, query: "Pay" } },
        { type: "navigate", params: { tabId: 7, url: "https://example.com/checkout" } },
        { type: "navigate", params: { tabId: 8, url: "https://example.com/checkout" } }
      ]
    }, context(asks));
  } finally {
    bridge.restore();
  }
  assert.equal(asks.filter((entry) => entry.permission === "browser.origin").length, 1);
  assert.deepEqual(asks[1].patterns, [
    "https://example.com:443/app",
    "https://example.com:443/checkout"
  ]);
  assert.equal(bridge.calls.filter((entry) => entry.method === "browserBatch").length, 4);
  assert.ok(
    bridge.calls.findIndex((entry) => entry.method === "browserBatch")
      > bridge.calls.findIndex((entry) => entry.method === "getTab"),
    "browserBatch must run only after minimal tab metadata preflight"
  );
});

test("batch origin denial fails before browserBatch and before any page side effect", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const calls = [];
  const bridge = installBridge(({ method, params }) => {
    calls.push(method);
    if (method === "getTab") return { id: params.tabId, url: "https://example.com/app" };
    throw new Error("side effect must not run");
  });
  const denyContext = context([]);
  denyContext.ask = async (request) => {
    if (request.permission === "browser.origin") throw new Error("origin denied");
  };
  try {
    await assert.rejects(() => plugin.tool.chrome_batch.execute({
      actions: [
        { type: "clickElement", params: { tabId: 7, ref: "e1" } },
        { type: "navigate", params: { tabId: 7, url: "https://example.com/checkout" } }
      ]
    }, denyContext), /origin denied/u);
  } finally {
    bridge.restore();
  }
  assert.deepEqual(calls, ["getTab"]);
});

test("batch navigation redirect requires the new scope before the following click", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  let navigated = false;
  const asks = [];
  const bridge = installBridge(({ method, params }) => {
    if (method === "getTab") return { id: 7, url: navigated ? "https://redirect.example/landing" : "https://example.com/start" };
    if (method === "browserBatch") {
      const type = params.actions[0].type;
      if (type === "navigate") {
        navigated = true;
        return { results: [{ index: 0, ok: true, result: { id: 7, url: "https://redirect.example/landing" }, type }] };
      }
      throw new Error("click must not run before redirect approval");
    }
    throw new Error(`unexpected ${method}`);
  });
  const denyRedirect = context(asks);
  denyRedirect.ask = async (request) => {
    asks.push(request);
    if (request.permission === "browser.origin" && request.patterns.includes("https://redirect.example:443/landing")) {
      throw new Error("redirect denied");
    }
  };
  try {
    await assert.rejects(() => plugin.tool.chrome_batch.execute({
      actions: [
        { type: "navigate", params: { tabId: 7, url: "https://example.com/next" } },
        { type: "clickElement", params: { tabId: 7, ref: "e1" } },
        { type: "fillElement", params: { tabId: 7, ref: "e2", text: "must-not-run" } }
      ],
      stopOnError: false
    }, denyRedirect), /redirect denied/u);
  } finally {
    bridge.restore();
  }
  assert.equal(bridge.calls.filter((entry) => entry.method === "browserBatch").length, 1);
});

test("batch rechecks its total timeout after a slow origin approval", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const bridge = installBridge(({ method }) => method === "getTab"
    ? { id: 7, url: "https://example.com/app" }
    : (() => { throw new Error("expired batch action executed"); })());
  const slow = context([]);
  slow.ask = async (request) => {
    if (request.permission === "browser.origin") await new Promise((resolve) => setTimeout(resolve, 70));
  };
  try {
    const output = JSON.parse(await plugin.tool.chrome_batch.execute({
      actions: [{ type: "clickElement", params: { tabId: 7, ref: "e1" } }],
      totalTimeoutMs: 50
    }, slow));
    assert.equal(output.ok, false);
    assert.match(output.results[0].error, /total timeout/iu);
  } finally {
    bridge.restore();
  }
  assert.equal(bridge.calls.some((entry) => entry.method === "browserBatch"), false);
});

test("batch stopOnError false continues after an action-specific failure", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  let batches = 0;
  const bridge = installBridge(({ method, params }) => {
    if (method === "getTab") return { id: params.tabId, url: "https://example.com/app" };
    if (method === "browserBatch") {
      batches += 1;
      const action = params.actions[0];
      return { results: [{ index: 0, ok: batches > 1, error: batches === 1 ? "first failed" : undefined, result: {}, type: action.type }] };
    }
    throw new Error(`unexpected ${method}`);
  });
  try {
    const output = JSON.parse(await plugin.tool.chrome_batch.execute({
      actions: [
        { type: "clickElement", params: { tabId: 7, ref: "e1" } },
        { type: "fillElement", params: { tabId: 8, ref: "e2", text: "ok" } }
      ],
      stopOnError: false
    }, context([])));
    assert.deepEqual(output.results.map((entry) => [entry.index, entry.ok]), [[0, false], [1, true]]);
  } finally {
    bridge.restore();
  }
});

test("internal tabs and targets are filtered before tool output", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method }) => {
    if (method === "listTabs") return [
      { id: 1, title: "Settings", url: "chrome://settings" },
      { id: 2, title: "Public", url: "https://example.com/app" }
    ];
    throw new Error(`unexpected ${method}`);
  });
  try {
    const tabs = JSON.parse(await plugin.tool.chrome_tabs.execute({}, context(asks)));
    assert.deepEqual(tabs.map((tab) => tab.id), [2]);
  } finally {
    bridge.restore();
  }
});

test("screenshot without tabId binds approval and capture to the actual active tab", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method, params }) => {
    if (method === "getActiveTab" || method === "getTab") return { active: true, id: 42, url: "https://example.com/capture" };
    if (method === "screenshot") {
      assert.equal(params.tabId, 42);
      return { dataUrl: "data:image/png;base64,iVBORw0KGgo=" };
    }
    throw new Error(`unexpected ${method}`);
  });
  const outputPath = "capture.png";
  const screenshotContext = context(asks);
  screenshotContext.directory = stateDir;
  try {
    await plugin.tool.chrome_screenshot.execute({ outputPath, format: "png" }, screenshotContext);
  } finally {
    bridge.restore();
    await rm(path.join(stateDir, outputPath), { force: true });
  }
  assert.deepEqual(asks[1].patterns, ["https://example.com:443/capture"]);
});

test("wizard stops after a click changes scope before eval or screenshot", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const wizardContext = context([]);
  wizardContext.ask = async (request) => {
    if (request.permission === "browser.origin" && request.patterns.includes("https://redirect.example:443/")) {
      throw new Error("redirect denied");
    }
  };
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") return { id: 7, url: "https://example.com/start" };
    if (method === "click") throw new Error("Page scope changed or is not authorized: https://redirect.example:443/next");
    throw new Error(`${method} must not run after the click transition`);
  });
  try {
    await assert.rejects(() => plugin.tool.chrome_wizard_step.execute({
      tabId: 7,
      x: 10,
      y: 10,
      expression: "document.title",
      screenshotPath: path.join(stateDir, "wizard.png")
    }, wizardContext), /redirect denied/iu);
  } finally {
    bridge.restore();
  }
  assert.equal(bridge.calls.some((entry) => entry.method === "evaluate" || entry.method === "screenshot"), false);
});

test("wizard can continue under the newly approved redirect scope without clicking twice", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  let tabReads = 0;
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") {
      tabReads += 1;
      return {
        documentId: tabReads === 1 ? "document-start" : "document-next",
        id: 7,
        navigationGeneration: tabReads === 1 ? 1 : 2,
        url: tabReads === 1 ? "https://example.com/start" : "https://redirect.example/next"
      };
    }
    if (method === "click") return { clicked: true, transition: {
      documentId: "document-next", navigationGeneration: 2,
      pageScope: "https://redirect.example:443/next", tabId: 7
    } };
    if (method === "evaluate") return "continued";
    throw new Error(`unexpected ${method}`);
  });
  try {
    const output = JSON.parse(await plugin.tool.chrome_wizard_step.execute({
      tabId: 7,
      x: 10,
      y: 10,
      waitMs: 0,
      expression: "document.title"
    }, context([])));
    assert.equal(output.evaluation, "continued");
  } finally {
    bridge.restore();
  }
  assert.equal(bridge.calls.filter((entry) => entry.method === "click").length, 1);
  assert.equal(bridge.calls.find((entry) => entry.method === "evaluate").expectedBindings[0].documentId, "document-next");
});

test("wizard re-resolves an asynchronous navigation committed during wait without re-clicking", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  let tabReads = 0;
  const asks = [];
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") {
      tabReads += 1;
      const redirected = tabReads > 1;
      return {
        documentId: redirected ? "document-b" : "document-a",
        id: 7,
        navigationGeneration: redirected ? 2 : 1,
        url: redirected ? "https://b.example/finish" : "https://a.example/start"
      };
    }
    if (method === "click") return { clicked: true };
    if (method === "evaluate") return "finished-on-b";
    throw new Error(`unexpected ${method}`);
  });
  try {
    const output = JSON.parse(await plugin.tool.chrome_wizard_step.execute({
      expression: "document.title", tabId: 7, waitMs: 0, x: 1, y: 2
    }, context(asks)));
    assert.equal(output.evaluation, "finished-on-b");
  } finally {
    bridge.restore();
  }
  assert.equal(bridge.calls.filter((entry) => entry.method === "click").length, 1);
  assert.ok(asks.some((request) => request.permission === "browser.origin" && request.patterns.includes("https://b.example:443/")));
  assert.equal(bridge.calls.find((entry) => entry.method === "evaluate").expectedBindings[0].documentId, "document-b");
});

test("wizard re-binding tab reads escape the stale pre-click page scopes", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  let tabReads = 0;
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") {
      tabReads += 1;
      const redirected = tabReads > 1;
      return {
        documentId: redirected ? "document-b" : "document-a",
        id: 7,
        navigationGeneration: redirected ? 2 : 1,
        url: redirected ? "https://b.example/finish" : "https://a.example/start"
      };
    }
    if (method === "click") return { clicked: true };
    if (method === "evaluate") return "finished-on-b";
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_wizard_step.execute({
      expression: "document.title", tabId: 7, waitMs: 0, x: 1, y: 2
    }, context([]));
  } finally {
    bridge.restore();
  }
  // In the live extension a scopedCommand getTab is rejected by the page
  // guard once the tab left the pre-click scope, so the reads that feed the
  // transition authorization prompt must be sent unscoped.
  assert.equal(
    bridge.calls.filter((entry) => entry.method === "getTab" && entry.scoped === true).length,
    0,
    "wizard tab metadata reads must not inherit the stale pre-click page scopes"
  );
});

test("scope race rejects combined page data before any workspace artifact is written", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const outputDirectory = path.join(stateDir, "race-artifacts");
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") return { id: 7, url: "https://example.com/start" };
    if (method === "readPage") throw new Error("Page scope changed or is not authorized: https://other.example:443/private");
    throw new Error(`unexpected ${method}`);
  });
  try {
    await assert.rejects(() => plugin.tool.chrome_read_page.execute({
      tabId: 7,
      includeScreenshot: true,
      outputDirectory,
      saveText: true
    }, context([])), /scope changed/iu);
    await assert.rejects(() => import("node:fs/promises").then(({ access }) => access(outputDirectory)));
  } finally {
    bridge.restore();
  }
});

test("CDP target listing filters internal and devtools targets", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const bridge = installBridge(({ method }) => {
    if (method === "cdpTargets") return [
      { id: "internal", title: "DevTools", url: "devtools://devtools/bundled" },
      { id: "web", title: "Web", url: "https://example.com/app" }
    ];
    throw new Error(`unexpected ${method}`);
  });
  try {
    const targets = JSON.parse(await plugin.tool.chrome_cdp_targets.execute({}, context([])));
    assert.deepEqual(targets.map((target) => target.id), ["web"]);
  } finally {
    bridge.restore();
  }
});

test("every public tool has an explicit page or browser origin classification", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const publicNames = Object.keys(plugin.tool).filter((name) => name !== "chrome_status").sort();
  assert.deepEqual(Object.keys(toolMetadata.TOOL_ORIGIN_SCOPE_CLASSIFICATION).sort(), publicNames);
  assert.equal(toolMetadata.TOOL_ORIGIN_SCOPE_CLASSIFICATION.chrome_cursor_state, "page");
  assert.equal(toolMetadata.TOOL_ORIGIN_SCOPE_CLASSIFICATION.chrome_favicon_badge, "page");
  assert.equal(toolMetadata.TOOL_ORIGIN_SCOPE_CLASSIFICATION.chrome_events, "page");
  assert.equal(toolMetadata.TOOL_ORIGIN_SCOPE_CLASSIFICATION.chrome_history, "browser");
});

test("WebMCP discovery and invocation require exact current-origin approval before isolated execution", async () => {
  const plugin = await OpenCodeChromeBridgePlugin();
  const asks = [];
  const bridge = installBridge(({ method }) => {
    if (method === "getTab") return {
      documentId: "document-webmcp", id: 7, navigationGeneration: 4, url: "https://shop.example/cart"
    };
    if (method === "webMcpList") return { supported: true, source: "document", tools: [] };
    throw new Error(`unexpected ${method}`);
  });
  try {
    await plugin.tool.chrome_webmcp_list.execute({ originGrant: "once", tabId: 7 }, context(asks));
    await assert.rejects(() => plugin.tool.chrome_webmcp_invoke.execute({
      input: {}, originGrant: "once", tabId: 7, timeoutMs: 1_000, toolName: "cart.add"
    }, {
      ...context(asks),
      ask: async (request) => {
        asks.push(request);
        if (request.permission === "browser.origin") throw new Error("WebMCP origin denied");
      }
    }), /WebMCP origin denied/u);
  } finally {
    bridge.restore();
  }
  assert.deepEqual(asks.map((entry) => entry.permission), [
    "chrome_webmcp_list", "browser.origin", "chrome_webmcp_invoke", "browser.origin"
  ]);
  assert.deepEqual(asks[1].patterns, ["https://shop.example:443/cart"]);
  assert.deepEqual(asks.at(-1).patterns, ["https://shop.example:443/cart"]);
  assert.deepEqual(bridge.calls.map((entry) => entry.method), ["getTab", "webMcpList", "getTab", "getTab"]);
  const listCall = bridge.calls.find((entry) => entry.method === "webMcpList");
  assert.equal(listCall.scoped, true);
  assert.equal(listCall.expectedBindings[0].documentId, "document-webmcp");
});

test("origin-bearing events drop internal page metadata before exposure", () => {
  const sanitized = pluginModule.sanitizeOriginBearingEvents({
    events: [
      { seq: 1, event: { tab: { title: "Settings", url: "chrome://settings" } } },
      { seq: 2, event: { tab: { title: "Web", url: "https://example.com/app" } } }
    ],
    nextSeq: 3
  });
  assert.deepEqual(sanitized.events.map((entry) => entry.seq), [2]);
});

test("CDP events without capture-time page provenance never expose params", () => {
  const sanitized = pluginModule.sanitizeOriginBearingEvents({
    events: [
      { seq: 1, event: { category: "cdp", method: "Runtime.consoleAPICalled", params: { args: [{ value: "secret-B" }], executionContextId: 12 } } },
      { seq: 2, event: { category: "cdp", method: "Runtime.consoleAPICalled", pageScope: "https://a.example:443/", navigationGeneration: 3, params: { args: [{ value: "allowed-A" }] } } }
    ]
  });
  assert.equal(sanitized.events.length, 1);
  assert.equal(sanitized.events[0].seq, 2);
});
