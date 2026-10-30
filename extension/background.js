const HOST_NAME = "com.opencode.chrome_bridge";
const BRIDGE_PROTOCOL_VERSION = "1.0.0";
const BRIDGE_CAPABILITIES = Object.freeze([
  "bridge.handshake",
  "browser.accessibility",
  "browser.assets",
  "browser.batch",
  "browser.bookmarks",
  "browser.cdp",
  "browser.console",
  "browser.downloads",
  "browser.events",
  "browser.file-upload",
  "browser.find",
  "browser.history",
  "browser.navigation",
  "browser.network",
  "browser.notifications",
  "browser.page-context",
  "browser.schedules",
  "browser.screenshots",
  "browser.tab-groups",
  "browser.tabs",
  "browser.wait",
  "browser.webmcp",
  "browser.windows",
  "browser.workflows",
  "session.resume",
  "session.tab-leases"
]);
const RECONNECT_ALARM = "opencode-chrome-bridge-reconnect";
const DEBUGGER_VERSION = "1.3";
const OVERLAY_SOURCE = "opencode-bridge";
const CONSOLE_LOG_METHODS = ["Runtime.consoleAPICalled", "Runtime.exceptionThrown"];
const CONSOLE_LOG_BUFFER_MAX = 500;
const CONSOLE_LOG_BUFFER_MAX_CHARS = 2_000_000;
const MAX_CONSOLE_LOG_TEXT_CHARS = 20_000;
const MAX_CONSOLE_LOG_URL_CHARS = 2_048;
const MAX_EXTENSION_EVENT_CHARS = 170_000;
const MAX_NATIVE_RESPONSE_BYTES = 15 * 1024 * 1024;
const MAX_NATIVE_ERROR_CHARS = 2_000;
const TAB_LEASES_STORAGE_KEY = "opencodeTabLeases";
const MANAGED_GROUP_COLOR = "blue";
const MANAGED_GROUP_TITLE_PREFIX = "OpenCode · ";
const MAX_CAPTURE_DIMENSION = 10000;
const MAX_CAPTURE_AREA = 25_000_000;
const MAX_SCREENSHOT_BASE64_CHARS = Math.ceil((10 * 1024 * 1024) / 3) * 4;
const MAX_PDF_BASE64_CHARS = Math.ceil((10 * 1024 * 1024) / 3) * 4;
const MAX_TEXT_CHARS = 100_000;
const MAX_EXPRESSION_CHARS = 200_000;
const MAX_KEY_CHARS = 100;
const MAX_MOVE_POINTS = 100;
const MAX_MOVE_EVENTS = 2000;
const MAX_MOVE_DURATION_MS = 30_000;
const MAX_TAB_IDS = 200;
const MAX_CDP_METHODS = 100;
const MAX_QUERY_CHARS = 1000;
const MAX_FIND_QUERY_CHARS = 500;
const MAX_FIND_ROLE_CHARS = 50;
const MAX_FIND_RESULTS = 100;
const MAX_WAIT_TIMEOUT_MS = 120_000;
const MIN_WAIT_TIMEOUT_MS = 50;
const MAX_WAIT_POLL_MS = 1_000;
const MIN_WAIT_POLL_MS = 10;
const MAX_WAIT_VALUE_CHARS = 2_000;
const MAX_WEBMCP_TOOLS = 100;
const MAX_WEBMCP_NAME_CHARS = 100;
const MAX_WEBMCP_DESCRIPTION_CHARS = 2_000;
const MAX_WEBMCP_INPUT_BYTES = 64 * 1024;
const MAX_WEBMCP_OUTPUT_BYTES = 512 * 1024;
const MAX_WEBMCP_SCHEMA_BYTES = 64 * 1024;
const MAX_WEBMCP_ENVELOPE_BYTES = 768 * 1024;
const MAX_WEBMCP_JSON_DEPTH = 20;
const MAX_WEBMCP_JSON_NODES = 5_000;
const MAX_WEBMCP_JSON_KEY_CHARS = 1_000;
const MIN_WEBMCP_TIMEOUT_MS = 50;
const MAX_WEBMCP_TIMEOUT_MS = 30_000;
const DEFAULT_WEBMCP_TIMEOUT_MS = 10_000;
const WEBMCP_PREPARED_REGISTRY_LIMIT = 8;
const WEBMCP_PREPARED_TTL_MS = 30_000;
const MAX_COMMITTED_WEBMCP_INVOKES = 8;
const WEBMCP_TOOL_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/u;
const MAX_NETWORK_REQUEST_STATES = 1_000;
const MAX_NETWORK_BUFFER_CHARS = 2_000_000;
const MAX_NETWORK_RESULT_LIMIT = 500;
const MAX_NETWORK_FILTER_VALUES = 20;
const MAX_NETWORK_URL_CHARS = 2_048;
const MAX_NETWORK_FAILURE_CHARS = 500;
const MAX_NETWORK_FILTER_CHARS = 500;
const MAX_UPLOAD_FILES = 20;
const MAX_CONCURRENT_UPLOADS = 4;
const MAX_UPLOAD_TOTAL_BYTES = 50 * 1024 * 1024;
const MAX_UPLOAD_CHUNK_BYTES = 256 * 1024;
const MAX_UPLOAD_CHUNKS = 256;
const MAX_UPLOAD_NAME_CHARS = 255;
const MAX_UPLOAD_MIME_CHARS = 255;
const MAX_PAGE_ASSETS = 2_000;
const MAX_PAGE_ASSET_SCAN_NODES = 20_000;
const MAX_PAGE_ASSET_FRAMES = 2_000;
const MAX_PAGE_ASSET_TOTAL_BYTES = 10 * 1024 * 1024;
const MAX_NOTIFICATION_TITLE_CHARS = 120;
const MAX_NOTIFICATION_MESSAGE_CHARS = 1_000;
const UPLOAD_TRANSFER_TTL_MS = 2 * 60 * 1000;
const SENSITIVE_QUERY_KEYS = new Set([
  "access", "accesstoken", "apikey", "assertion", "auth", "authorization", "authorizationcode",
  "authtoken", "bearer", "clientsecret", "code", "cookie", "credential", "credentials", "idtoken",
  "jwt", "key", "nonce", "oauth", "oauthtoken", "pass", "passwd", "password", "refresh",
  "refreshtoken", "relaystate", "samlrequest", "samlresponse", "secret", "session", "sig",
  "signature", "ticket", "token"
]);
const SENSITIVE_QUERY_KEY_FRAGMENTS = Object.freeze([
  "access", "assertion", "auth", "bearer", "code", "cookie", "credential", "idtoken", "jwt",
  "key", "nonce", "oauth", "pass", "refresh", "relaystate", "samlrequest", "samlresponse",
  "secret", "securitytoken", "session", "sig", "ticket", "token"
]);
const MAX_BATCH_ACTIONS = 25;
const MAX_BATCH_PAYLOAD_BYTES = 100_000;
const MIN_BATCH_TIMEOUT_MS = 50;
const MAX_BATCH_ACTION_TIMEOUT_MS = 30_000;
const MAX_BATCH_TOTAL_TIMEOUT_MS = 120_000;
const DEFAULT_BATCH_ACTION_TIMEOUT_MS = 10_000;
const DEFAULT_BATCH_TOTAL_TIMEOUT_MS = 60_000;
const WORKFLOW_SCHEMA_VERSION = 1;
const WORKFLOW_STORAGE_KEY = "opencodeWorkflows";
const WORKFLOW_RECORDING_STORAGE_KEY = "opencodeWorkflowRecording";
const MAX_WORKFLOWS = 100;
const MAX_WORKFLOW_STEPS = 100;
const MAX_WORKFLOW_ORIGINS = 100;
const MAX_WORKFLOW_STORAGE_BYTES = 500_000;
const MAX_WORKFLOW_NAME_CHARS = 120;
const MAX_WORKFLOW_SHORTCUT_CHARS = 80;
const DEFAULT_WORKFLOW_STEP_TIMEOUT_MS = 10_000;
const DEFAULT_WORKFLOW_TOTAL_TIMEOUT_MS = 60_000;
const SCHEDULE_SCHEMA_VERSION = 2;
const SCHEDULE_APPROVAL_VERSION = 1;
const SCHEDULE_STORAGE_KEY = "opencodeSchedules";
const SCHEDULE_ALARM_PREFIX = "opencode-workflow-schedule:";
const MAX_SCHEDULES = 100;
const MAX_SCHEDULE_HISTORY = 50;
const MAX_SCHEDULE_STORAGE_BYTES = 500_000;
const WORKFLOW_STEP_METHODS = Object.freeze({
  activateTab: { capability: ["browser.tabs", "browser.windows"], type: "activateTab" },
  back: { capability: ["browser.navigation", "browser.tabs"], type: "back" },
  clickElement: { capability: ["browser.accessibility", "browser.cdp", "browser.tabs"], type: "clickElement" },
  findElements: { capability: ["browser.find", "browser.tabs"], type: "findElements" },
  forward: { capability: ["browser.navigation", "browser.tabs"], type: "forward" },
  getTab: { capability: ["browser.tabs"], type: "getTab" },
  navigate: { capability: ["browser.navigation", "browser.tabs"], type: "navigate" },
  reload: { capability: ["browser.navigation", "browser.tabs"], type: "reload" },
  screenshot: { capability: ["browser.screenshots", "browser.tabs", "browser.windows"], type: null },
  tabContext: { capability: ["browser.page-context", "browser.tabs"], type: "tabContext" },
  waitFor: { capability: ["browser.tabs", "browser.wait"], type: "waitFor" }
});
const WORKFLOW_CONTROL_METHODS = new Set([
  "workflowStartRecording", "workflowStopRecording", "workflowCancelRecording",
  "workflowList", "workflowGet", "workflowImport", "workflowDelete", "workflowRun",
  "scheduleApprovalPreview", "scheduleCreate", "scheduleList", "scheduleUpdate", "scheduleDelete", "scheduleRunNow", "scheduleHistory"
]);
const BATCH_ACTION_METHODS = Object.freeze({
  activateTab: "activateTab",
  back: "back",
  clickElement: "clickElement",
  fillElement: "fillElement",
  findElements: "findElements",
  forward: "forward",
  getTab: "getTab",
  navigate: "navigate",
  reload: "reload",
  tabContext: "tabContext",
  waitFor: "waitFor"
});
const ORIGIN_SCOPED_COMMANDS = new Set([
  "accessibilityTree", "activateTab", "back", "browserBatch", "cdpCommand", "click", "clickElement",
  "closeTab", "domContent", "doubleClick", "evaluate", "fillElement", "findElements",
  "fileUploadCommit", "forward", "getConsoleLogs", "getTab", "hover", "keypress", "moveSequence",
  "navigate", "networkRequests", "pageText", "printPdf", "readPage", "reload", "resetViewport",
  "pageAssets",
  "webMcpList", "webMcpInvoke",
  "workflowRun",
  "screenshot", "screenshotRegion", "scroll", "setCursorState", "setFaviconBadge",
  "setViewport", "subscribeCdpEvents", "tabContext", "unsubscribeCdpEvents", "uploadFiles",
  "waitFor", "type"
]);
const ALLOWED_RAW_PAGE_CDP_METHODS = new Set([
  "Page.getLayoutMetrics", "Runtime.evaluate", "Runtime.getProperties", "Page.navigate"
]);
const NAVIGATION_BARRIER_COMMANDS = new Set([
  "cdpCommand", "click", "clickElement", "doubleClick", "evaluate", "fillElement", "hover",
  "getConsoleLogs", "keypress", "moveSequence", "networkRequests", "printPdf", "screenshotRegion", "scroll",
  "pageAssets", "webMcpList", "webMcpInvoke",
  "setViewport", "resetViewport", "subscribeCdpEvents", "type", "unsubscribeCdpEvents"
]);
const NAVIGATION_BARRIER_PERSISTENT_COMMANDS = new Set([
  "getConsoleLogs", "networkRequests", "subscribeCdpEvents", "unsubscribeCdpEvents"
]);
const NAVIGATION_BARRIER_BATCH_ACTIONS = new Set(["clickElement", "fillElement"]);

let nativePort = null;
let nativeHostReady = false;
let reconnecting = false;
let tabLeasesLoaded = false;
let tabLeasesLoadPromise = null;
let tabLeaseMutationQueue = Promise.resolve();

// Serialize debugger attach/detach per-target to avoid "Debugger already attached" races
const debuggerQueue = new Map();

// CDP event subscriptions: key=tabId, value=Set of subscribed CDP method names
const cdpSubscriptions = new Map();
let cdpEventSeq = 1;

// Per-tab ring buffer of console messages, network log entries, and uncaught exceptions
const consoleLogBuffers = new Map();
const consoleLogBufferChars = new Map();
// Tabs with a long-lived debugger attached for console log capture
const consoleLogAttached = new Set();
// Tabs with a long-lived debugger attached for CDP event subscriptions
const cdpEventAttached = new Set();
const cdpEnabledDomains = new Map();
// Bounded request state shared by deterministic network-idle waits and the
// high-level network summaries added in the next roadmap phase.
const networkRequestStates = new Map();
const networkTrackerAttached = new Set();
const networkCaptureAttached = new Set();
const networkWaitConsumers = new Map();
const navigationSequences = new Map();
const windowActivationGenerations = new Map();
const navigationBarriers = new Map();
const scopedDebuggerTargets = new Map();
const tabPageProvenance = new Map();
const executionContextScopes = new Map();
const tabMainFrameEpochs = new Map();
const observedMainFrames = new Map();
const tabNavigationAttempts = new Map();
const retiredMainFrameLoaders = new Map();
let navigationAttemptSequence = 1;
const activeNativeCommands = new Map();
const activeCommittedWebMcpInvokes = new Set();
const tabLeases = new Map();
const uploadTransfers = new Map();
let workflowMutationQueue = Promise.resolve();
let workflowRecordingFault = null;
let scheduleMutationQueue = Promise.resolve();

chrome.runtime.onInstalled.addListener(async () => {
  connectNativeHost();
  await restoreScheduleAlarms();
});
chrome.runtime.onStartup.addListener(async () => {
  connectNativeHost();
  await restoreScheduleAlarms();
});
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === RECONNECT_ALARM) {
    connectNativeHost();
    return;
  }
  if (typeof alarm?.name === "string" && alarm.name.startsWith(SCHEDULE_ALARM_PREFIX)) {
    try {
      await executeSchedule(alarm.name.slice(SCHEDULE_ALARM_PREFIX.length), {
        scheduledTime: alarm.scheduledTime,
        trigger: "alarm"
      });
    } catch (error) {
      sendEvent({ category: "scheduler", type: "alarmFailed", error: sanitizeScheduleError(error) });
    }
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_BRIDGE_STATUS") {
    // connectNative "succeeds" even when the native host is not installed, so a
    // non-null port alone is a false positive until the host announces itself
    // (bridgeReady event) or sends any other message. Once ready, an active
    // ping/pong round trip also detects a host that is present but wedged.
    if (nativePort === null || !nativeHostReady) {
      sendResponse(disconnectedPopupStatus());
      return false;
    }
    pingNativeHost().then((pong) => {
      sendResponse(popupStatusFromPong(pong));
    });
    return true;
  }
  if (message?.type === "STOP_AGENT_REQUEST" && Number.isInteger(sender?.tab?.id)) {
    // The in-page Stop button asks the user's agent to halt. Forward it to the
    // native host so OpenCode clients see it through event polling.
    sendEvent({ category: "bridge", type: "stopRequested", tabId: sender.tab.id });
    sendResponse({ ok: true });
  }
  return false;
});

registerBrowserEventListeners();

connectNativeHost();
// A service worker can be suspended and later recreated without Chrome firing
// runtime.onStartup. Reconcile durable schedule state on every module load too.
void restoreScheduleAlarms();

function connectNativeHost() {
  if (nativePort || reconnecting) return;
  reconnecting = true;
  try {
    nativeHostReady = false;
    nativePort = chrome.runtime.connectNative(HOST_NAME);
    nativePort.onMessage.addListener(handleNativeMessage);
    nativePort.onDisconnect.addListener(() => {
      const disconnectError = new Error("Native host disconnected");
      for (const controller of activeNativeCommands.values()) controller.abort(disconnectError);
      activeNativeCommands.clear();
      for (const pending of pendingPings.values()) {
        clearTimeout(pending.timer);
        pending.resolve(null);
      }
      pendingPings.clear();
      nativePort = null;
      nativeHostReady = false;
      scheduleReconnect();
    });
    chrome.alarms.clear(RECONNECT_ALARM).catch(() => {});
  } catch {
    nativePort = null;
    scheduleReconnect();
  } finally {
    reconnecting = false;
  }
}

const pendingPings = new Map();
let pingSeq = 1;

function pingNativeHost(timeoutMs = 1000) {
  const port = nativePort;
  if (!port) return Promise.resolve(null);
  return new Promise((resolve) => {
    const id = `ping:${pingSeq++}`;
    const timer = setTimeout(() => {
      pendingPings.delete(id);
      resolve(null);
    }, timeoutMs);
    pendingPings.set(id, { resolve, timer });
    try {
      port.postMessage({ type: "ping", id, handshake: createExtensionHandshake() });
    } catch {
      pendingPings.delete(id);
      clearTimeout(timer);
      resolve(null);
    }
  });
}

function createExtensionHandshake() {
  const manifest = chrome.runtime.getManifest();
  return {
    capabilities: [...BRIDGE_CAPABILITIES],
    extensionId: chrome.runtime.id,
    extensionName: manifest.name,
    extensionVersion: manifest.version,
    hostName: HOST_NAME,
    protocolVersion: BRIDGE_PROTOCOL_VERSION
  };
}

function disconnectedPopupStatus() {
  return {
    compatible: false,
    connected: false,
    diagnostics: [{
      code: "EXTENSION_DISCONNECTED",
      message: "The native host is not connected.",
      repair: "Reload the extension or reinstall the native host."
    }],
    extension: createExtensionHandshake(),
    host: null,
    missingCapabilities: []
  };
}

function popupStatusFromPong(host) {
  if (host === null) return disconnectedPopupStatus();
  const requiredCapabilities = normalizePopupCapabilities(host?.requiredCapabilities);
  const validHost = isVersionString(host.version)
    && isVersionString(host.protocolMin)
    && isVersionString(host.protocolMax)
    && host.name === HOST_NAME
    && requiredCapabilities !== null;
  if (!validHost) {
    return {
      ...disconnectedPopupStatus(),
      connected: true,
      diagnostics: [{
        code: "HOST_HANDSHAKE_MISSING",
        message: "The native host does not support protocol negotiation.",
        repair: "Reinstall the current native host."
      }]
    };
  }
  const protocolCompatible = compareVersions(BRIDGE_PROTOCOL_VERSION, host.protocolMin) >= 0
    && compareVersions(BRIDGE_PROTOCOL_VERSION, host.protocolMax) <= 0;
  const extension = createExtensionHandshake();
  const missingCapabilities = requiredCapabilities
    .filter((capability) => !extension.capabilities.includes(capability))
    .sort();
  const diagnostics = [];
  if (missingCapabilities.length > 0) {
    diagnostics.push({
      code: "MISSING_CAPABILITIES",
      message: `The extension is missing required capabilities: ${missingCapabilities.join(", ")}.`,
      repair: "Update and reload the extension."
    });
  }
  if (!protocolCompatible) {
    diagnostics.push({
      code: "PROTOCOL_INCOMPATIBLE",
      message: `Extension protocol ${BRIDGE_PROTOCOL_VERSION} is outside the host range ${host.protocolMin}-${host.protocolMax}.`,
      repair: "Update the extension and native host together."
    });
  }
  return {
    compatible: protocolCompatible && missingCapabilities.length === 0,
    connected: true,
    diagnostics,
    extension,
    host: {
      name: host.name,
      protocolMax: host.protocolMax,
      protocolMin: host.protocolMin,
      requiredCapabilities,
      version: host.version
    },
    missingCapabilities
  };
}

function normalizePopupCapabilities(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 200
    || value.some((entry) => typeof entry !== "string" || !/^[a-z][a-z0-9.-]{0,99}$/u.test(entry))) {
    return null;
  }
  return [...new Set(value)].sort();
}

function isVersionString(value) {
  return typeof value === "string" && /^\d+\.\d+\.\d+$/u.test(value);
}

function compareVersions(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function scheduleReconnect() {
  // Chrome MV3 silently clamps alarm periods to a minimum of 1 minute in
  // production builds (smaller values only work in unpacked developer mode).
  // Use the smallest production-safe values so reconnect latency is bounded
  // and predictable across installed extensions.
  chrome.alarms.create(RECONNECT_ALARM, { delayInMinutes: 1, periodInMinutes: 1 }).catch(() => {});
}

async function handleNativeMessage(message) {
  // Any message proves a live native host on the other end of the port.
  nativeHostReady = true;
  if (message?.type === "pong" && typeof message.id === "string") {
    const pending = pendingPings.get(message.id);
    if (pending) {
      pendingPings.delete(message.id);
      clearTimeout(pending.timer);
      pending.resolve(message.host ?? {});
    }
    return;
  }
  if (message?.type === "cancel" && typeof message.id === "string") {
    activeNativeCommands.get(message.id)?.abort(new Error(`Chrome command ${message.id} was cancelled`));
    return;
  }
  if (message?.type !== "command" || typeof message.id !== "string") return;
  const settlementTracked = message.method === "scopedCommand" && message.params?.method === "webMcpInvoke";
  const controller = new AbortController();
  activeNativeCommands.set(message.id, controller);
  try {
    const result = await executeCommand(message.method, message.params ?? {}, { signal: controller.signal });
    if (controller.signal.aborted) return;
    postNativeResponse({ type: "response", id: message.id, ok: true, result });
  } catch (error) {
    if (controller.signal.aborted) return;
    postNativeResponse({
      type: "response",
      id: message.id,
      ok: false,
      error: truncateString(error?.message || String(error), MAX_NATIVE_ERROR_CHARS)
    });
  } finally {
    if (settlementTracked && controller.signal.aborted) {
      try { postNativeResponse({ type: "settled", id: message.id }); } catch {}
    }
    if (activeNativeCommands.get(message.id) === controller) activeNativeCommands.delete(message.id);
  }
}

function postNativeResponse(message) {
  const port = nativePort;
  if (!port) return;
  const serialized = JSON.stringify(message);
  if (new TextEncoder().encode(serialized).byteLength > MAX_NATIVE_RESPONSE_BYTES) {
    throw new Error("Chrome command response is too large for the local bridge");
  }
  try {
    port.postMessage(message);
  } catch {
    // The native host disconnected after the command completed. Its reconnect
    // listener owns recovery, so do not turn this into an unhandled rejection.
  }
}

async function executeCommand(method, params, options = {}) {
  if (options.workflowInternal === true || WORKFLOW_CONTROL_METHODS.has(method)) {
    return executeCommandCore(method, params, options);
  }
  const decision = await queueWorkflowMutation(async () => {
    throwIfAborted(options.signal);
    const recording = await loadWorkflowRecording();
    if (!recording) return { recording: false };
    if (workflowRecordingFault) throw new Error(`Workflow recording is fail-closed: ${workflowRecordingFault}`);
    if (recording.pendingStep) throw new Error("Workflow recording is fail-closed because its durable journal has a pending browser effect; cancel the recording");
    const plan = await prepareWorkflowRecordingStep(recording, method, params);
    const journaled = await journalWorkflowRecordingStep(recording, plan);
    let result;
    try {
      throwIfAborted(options.signal);
      result = await executeCommandCore(method, params, options);
    } catch (error) {
      try {
        await clearJournaledWorkflowStep(journaled);
      } catch (clearError) {
        workflowRecordingFault = clearError?.message ?? String(clearError);
        sendEvent({ category: "workflow", type: "recordingFailed", error: workflowRecordingFault });
      }
      throw error;
    }
    try {
      await commitJournaledWorkflowStep(journaled);
    } catch (error) {
      workflowRecordingFault = error?.message ?? String(error);
      sendEvent({ category: "workflow", type: "recordingFailed", error: workflowRecordingFault });
    }
    return { recording: true, result };
  });
  if (decision.recording) return decision.result;
  return executeCommandCore(method, params, { ...options, workflowInternal: true });
}

async function executeCommandCore(method, params, options = {}) {
  switch (method) {
    case "scopedCommand":
      return executeScopedPageCommand(params, options);
    case "handshake":
      return createExtensionHandshake();
    case "status":
      return { connected: true, extensionId: chrome.runtime.id, hostName: HOST_NAME };
    case "listTabs":
      return (await chrome.tabs.query({})).map(tabInfo);
    case "getActiveTab": {
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (tabs.length !== 1 || !Number.isInteger(tabs[0]?.id)) throw new Error("Active Chrome tab cannot be resolved deterministically");
      return { ...tabInfo(tabs[0]), ...await currentPageBinding(tabs[0].id, tabs[0].url) };
    }
    case "getTab": {
      throwIfAborted(options.signal);
      const tab = await chrome.tabs.get(requireTabId(params));
      throwIfAborted(options.signal);
      return { ...tabInfo(tab), ...await currentPageBinding(tab.id, tab.url) };
    }
    case "createTab": {
      validateOptionalLeaseParams(params);
      const createUrl = params.url ?? "about:blank";
      if (params.url != null) await assertNavigationAllowed(params.url);
      const tab = await chrome.tabs.create({ active: params.active !== false, url: createUrl });
      await maybeClaimTabFromParams(tab.id, params, "agent");
      return tabInfo(tab);
    }
    case "closeTab":
      await chrome.tabs.remove(requireTabId(params));
      return { closed: true };
    case "activateTab":
      return activateTab(requireTabId(params), options.signal);
    case "navigate":
      return navigateTab(params, options.signal);
    case "reload":
      throwIfAborted(options.signal);
      await chrome.tabs.reload(requireTabId(params));
      throwIfAborted(options.signal);
      return { reloaded: true };
    case "back":
      throwIfAborted(options.signal);
      await chrome.tabs.goBack(requireTabId(params));
      throwIfAborted(options.signal);
      return { ok: true };
    case "forward":
      throwIfAborted(options.signal);
      await chrome.tabs.goForward(requireTabId(params));
      throwIfAborted(options.signal);
      return { ok: true };
    case "screenshot":
      return captureScreenshot(params, options.signal, options.pageGuard);
    case "screenshotRegion":
      return captureScreenshotRegion(params, options.pageGuard);
    case "printPdf":
      return printPdf(params, options.pageGuard);
    case "getConsoleLogs":
      return getConsoleLogs(params, options.pageGuard);
    case "networkRequests":
      return getNetworkRequests(params, options.signal, options.pageGuard);
    case "pageAssets":
      return getPageAssets(params, options.signal, options.pageGuard);
    case "notify":
      return createNotification(params);
    case "fileUploadBegin":
      return beginFileUpload(params, options.signal);
    case "fileUploadChunk":
      return appendFileUploadChunk(params, options.signal);
    case "fileUploadCommit":
      return commitFileUpload(params, options.signal);
    case "fileUploadAbort":
      return abortFileUpload(params);
    case "click":
      return dispatchClick(params, options.signal, options.pageGuard);
    case "doubleClick":
      return dispatchDoubleClick(params, options.pageGuard);
    case "hover":
      return dispatchHover(params, options.pageGuard);
    case "type":
      return insertText(params, options.pageGuard);
    case "keypress":
      return dispatchKey(params, options.pageGuard);
    case "evaluate":
      return evaluateInTab(params, options.pageGuard);
    case "pageText":
      return pageText(params);
    case "domContent":
      return domContent(params);
    case "scroll":
      return dispatchScroll(params, options.pageGuard);
    case "setViewport":
      return setViewport(params, options.pageGuard);
    case "resetViewport":
      return resetViewport(params, options.pageGuard);
    case "cdpTargets":
      return cdpTargets();
    case "cdpCommand":
      return cdpCommand(params, options.pageGuard);
    case "history":
      return searchHistory(params);
    case "bookmarks":
      return searchBookmarks(params);
    case "setWindowState":
      return setWindowState(params);
    case "getWindowState":
      return getWindowState(params);
    case "createWindow":
      return createWindow(params);
    case "claimTab":
      return claimTab(params);
    case "resumeSession":
      return resumeSession(params);
    case "finalizeTabs":
      return finalizeTabs(params);
    case "endTurn":
      return endTurn(params);
    case "releaseDebuggers":
      return releaseDebuggers(params);
    case "moveSequence":
      return moveSequence(params, options.pageGuard);
    case "listDownloads":
      return listDownloads(params);
    case "cancelDownload":
      return cancelDownload(params);
    case "pauseDownload":
      return pauseDownload(params);
    case "resumeDownload":
      return resumeDownload(params);
    case "showDownload":
      return showDownload(params);
    case "createTabGroup":
      return createTabGroup(params);
    case "updateTabGroup":
      return updateTabGroup(params);
    case "listTabGroups":
      return listTabGroups(params);
    case "groupTabs":
      return groupTabs(params);
    case "ungroupTabs":
      return ungroupTabs(params);
    case "subscribeCdpEvents":
      return subscribeCdpEvents(params, options.pageGuard);
    case "unsubscribeCdpEvents":
      return unsubscribeCdpEvents(params, options.pageGuard);
    case "setCursorState":
      return setCursorState(params);
    case "setFaviconBadge":
      return setFaviconBadge(params);
    case "accessibilityTree":
      return accessibilityTree(params);
    case "tabContext":
      return tabContext(params, options.signal);
    case "readPage":
      return readPage(params, options.signal, options.pageGuard);
    case "findElements":
      return findElements(params, options.signal);
    case "waitFor":
      return waitFor(params, options);
    case "webMcpList":
      return listWebMcpTools(params, options.webMcpExternalSignal, options.pageGuard, options.webMcpDeadlineEpochMs);
    case "webMcpInvoke":
      return invokeWebMcpTool(params, options.webMcpExternalSignal, options.pageGuard, options.webMcpDeadlineEpochMs);
    case "browserBatch":
      return browserBatch(params, options);
    case "clickElement":
      return clickElement(params, options.signal, options.pageGuard);
    case "fillElement":
      return fillElement(params, options.signal, options.pageGuard);
    case "workflowStartRecording":
      return startWorkflowRecording(params);
    case "workflowStopRecording":
      return stopWorkflowRecording();
    case "workflowCancelRecording":
      return cancelWorkflowRecording();
    case "workflowList":
      return listWorkflows();
    case "workflowGet":
      return getWorkflow(params);
    case "workflowImport":
      return importWorkflow(params);
    case "workflowDelete":
      return deleteWorkflow(params);
    case "workflowRun":
      return runWorkflow(params, options);
    case "scheduleApprovalPreview":
      return previewScheduleApproval(params);
    case "scheduleCreate":
      return createSchedule(params);
    case "scheduleList":
      return listSchedules();
    case "scheduleUpdate":
      return updateSchedule(params);
    case "scheduleDelete":
      return deleteSchedule(params);
    case "scheduleRunNow":
      return runScheduleNow(params, options);
    case "scheduleHistory":
      return scheduleHistory(params);
    case "getBlockedUrlPatterns":
      return { patterns: await loadBlockedUrlPatterns() };
    default:
      throw new Error(`Unsupported command: ${method}`);
  }
}

function startWorkflowRecording(params) {
  return queueWorkflowMutation(async () => {
    if (await loadWorkflowRecording()) throw new Error("A workflow recording is already active");
    if (!isRecord(params)) throw new Error("workflow recording params must be an object");
    const name = requireBoundedWorkflowString(params.name, MAX_WORKFLOW_NAME_CHARS, "name");
    const shortcut = normalizeWorkflowShortcut(params.shortcut ?? name);
    const recording = {
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      name, shortcut, requiredCapabilities: [], requiredOrigins: [], steps: [],
      pendingStep: null, revision: 0, startedAt: new Date().toISOString()
    };
    await saveWorkflowRecording(recording);
    workflowRecordingFault = null;
    return { name, recording: true, shortcut };
  });
}

async function stopWorkflowRecording() {
  return queueWorkflowMutation(async () => {
    const recording = await loadWorkflowRecording();
    if (!recording) throw new Error("No workflow recording is active");
    if (workflowRecordingFault) throw new Error(`Workflow recording is fail-closed: ${workflowRecordingFault}`);
    if (recording.pendingStep) throw new Error("Workflow recording is fail-closed because its durable journal has a pending browser effect; cancel the recording");
    if (recording.steps.length === 0) throw new Error("A workflow must contain at least one recorded step");
    const collection = await loadWorkflowCollection();
    if (collection.workflows.some((entry) => entry.shortcut === recording.shortcut)) {
      throw new Error(`Workflow shortcut ${recording.shortcut} already exists and must be unique`);
    }
    if (collection.workflows.length >= MAX_WORKFLOWS) throw new Error(`Workflow storage is full; max ${MAX_WORKFLOWS} workflows`);
    const now = new Date().toISOString();
    const workflow = await validateWorkflowSchema({
      schemaVersion: WORKFLOW_SCHEMA_VERSION, id: crypto.randomUUID(), name: recording.name,
      shortcut: recording.shortcut, requiredCapabilities: recording.requiredCapabilities,
      requiredOrigins: recording.requiredOrigins, steps: recording.steps,
      createdAt: recording.startedAt, updatedAt: now
    });
    await saveWorkflowCollection({ schemaVersion: WORKFLOW_SCHEMA_VERSION, workflows: [...collection.workflows, workflow] });
    await clearWorkflowRecording();
    workflowRecordingFault = null;
    return workflow;
  });
}

function cancelWorkflowRecording() {
  return queueWorkflowMutation(async () => {
    if (!await loadWorkflowRecording()) throw new Error("No workflow recording is active");
    await clearWorkflowRecording();
    workflowRecordingFault = null;
    return { cancelled: true };
  });
}

async function prepareWorkflowRecordingStep(recording, method, params) {
  let recordedMethod = method;
  let recordedParams = params;
  let expectedOrigins = [];
  if (method === "scopedCommand") {
    if (!isRecord(params)) throw new Error("Scoped workflow recording params are invalid");
    recordedMethod = params.method;
    recordedParams = params.params;
    expectedOrigins = Array.isArray(params.expectedScopes) ? params.expectedScopes : [];
  }
  if (!Object.hasOwn(WORKFLOW_STEP_METHODS, recordedMethod)) throw new Error(`Command ${recordedMethod} is not recordable while workflow recording is active`);
  if (recordedMethod === "waitFor" && ["text", "url"].includes(recordedParams?.condition?.type)) {
    throw new Error(`Sensitive waitFor ${recordedParams.condition.type} conditions are not recordable`);
  }
  if (containsSensitiveWorkflowField(recordedParams)) throw new Error(`Command ${recordedMethod} contains sensitive fields and is not recordable`);
  if (recording.steps.length >= MAX_WORKFLOW_STEPS) {
    throw new Error(`Workflow recording is limited to ${MAX_WORKFLOW_STEPS} steps`);
  }
  const step = await validateWorkflowStep({ method: recordedMethod, params: cloneWorkflowValue(recordedParams) });
  return { expectedOrigins, recordedMethod, recordedParams, step };
}

function workflowRecordingMetadata(recording, plan) {
  const capabilities = new Set(recording.requiredCapabilities);
  const origins = new Set(recording.requiredOrigins);
  for (const capability of workflowStepCapabilities(plan.step)) {
    capabilities.add(capability);
  }
  for (const scope of plan.expectedOrigins) origins.add(workflowOrigin(scope));
  if (plan.recordedMethod === "navigate") origins.add(workflowOrigin(plan.recordedParams.url));
  const requiredOrigins = [...origins].sort();
  assertWorkflowOriginCount(requiredOrigins, "Workflow recording origins");
  return { requiredCapabilities: [...capabilities].sort(), requiredOrigins };
}

async function journalWorkflowRecordingStep(recording, plan) {
  const metadata = workflowRecordingMetadata(recording, plan);
  const journaled = {
    ...recording,
    pendingStep: { ...metadata, step: plan.step },
    revision: recording.revision + 1
  };
  await saveWorkflowRecording(journaled);
  return journaled;
}

async function commitJournaledWorkflowStep(recording) {
  const pending = recording.pendingStep;
  if (!pending) throw new Error("Workflow recording journal is missing its pending step");
  await saveWorkflowRecording({
    ...recording,
    pendingStep: null,
    requiredCapabilities: pending.requiredCapabilities,
    requiredOrigins: pending.requiredOrigins,
    revision: recording.revision + 1,
    steps: [...recording.steps, pending.step]
  });
}

async function clearJournaledWorkflowStep(recording) {
  await saveWorkflowRecording({ ...recording, pendingStep: null, revision: recording.revision + 1 });
}

function queueWorkflowMutation(operation) {
  const next = workflowMutationQueue.then(operation, operation);
  workflowMutationQueue = next.catch(() => {});
  return next;
}

async function loadWorkflowRecording() {
  let stored;
  try {
    stored = await chrome.storage.local.get(WORKFLOW_RECORDING_STORAGE_KEY);
  } catch (error) {
    throw new Error(`Could not read active workflow recording: ${error?.message ?? String(error)}`);
  }
  const raw = stored?.[WORKFLOW_RECORDING_STORAGE_KEY];
  if (raw == null) return null;
  if (!isRecord(raw) || raw.schemaVersion !== WORKFLOW_SCHEMA_VERSION) throw new Error("Active workflow recording schema is invalid or unsupported");
  const allowed = ["schemaVersion", "name", "shortcut", "requiredCapabilities", "requiredOrigins", "steps", "pendingStep", "revision", "startedAt"];
  const extra = Object.keys(raw).filter((field) => !allowed.includes(field));
  if (extra.length > 0) throw new Error(`Active workflow recording contains unsupported fields: ${extra.join(", ")}`);
  const name = requireBoundedWorkflowString(raw.name, MAX_WORKFLOW_NAME_CHARS, "name");
  const shortcut = normalizeWorkflowShortcut(raw.shortcut);
  if (!Array.isArray(raw.steps) || raw.steps.length > MAX_WORKFLOW_STEPS) throw new Error("Active workflow recording steps are invalid");
  const steps = await Promise.all(raw.steps.map(validateWorkflowStep));
  const derivedCapabilities = [...new Set(steps.flatMap(workflowStepCapabilities))].sort();
  if (!Array.isArray(raw.requiredCapabilities)
    || JSON.stringify([...new Set(raw.requiredCapabilities)].sort()) !== JSON.stringify(derivedCapabilities)) {
    throw new Error("Active workflow recording capabilities do not match its typed steps");
  }
  if (!Array.isArray(raw.requiredOrigins) || raw.requiredOrigins.length > MAX_WORKFLOW_ORIGINS) throw new Error("Active workflow recording origins are invalid");
  const requiredOrigins = [...new Set(raw.requiredOrigins.map(workflowOrigin))].sort();
  if (!Number.isSafeInteger(raw.revision) || raw.revision < 0) throw new Error("Active workflow recording revision is invalid");
  let pendingStep = null;
  if (raw.pendingStep != null) {
    if (!isRecord(raw.pendingStep)
      || Object.keys(raw.pendingStep).some((field) => !["step", "requiredCapabilities", "requiredOrigins"].includes(field))) {
      throw new Error("Active workflow recording pending journal schema is invalid");
    }
    const step = await validateWorkflowStep(raw.pendingStep.step);
    const pendingCapabilities = [...new Set([...derivedCapabilities, ...workflowStepCapabilities(step)])].sort();
    if (!Array.isArray(raw.pendingStep.requiredCapabilities)
      || JSON.stringify([...new Set(raw.pendingStep.requiredCapabilities)].sort()) !== JSON.stringify(pendingCapabilities)) {
      throw new Error("Active workflow recording pending journal capabilities are invalid");
    }
    if (!Array.isArray(raw.pendingStep.requiredOrigins) || raw.pendingStep.requiredOrigins.length > MAX_WORKFLOW_ORIGINS) {
      throw new Error("Active workflow recording pending journal origins are invalid");
    }
    pendingStep = {
      requiredCapabilities: pendingCapabilities,
      requiredOrigins: [...new Set(raw.pendingStep.requiredOrigins.map(workflowOrigin))].sort(),
      step
    };
  }
  const startedAt = requireWorkflowTimestamp(raw.startedAt, "startedAt");
  return {
    schemaVersion: WORKFLOW_SCHEMA_VERSION, name, shortcut, pendingStep,
    requiredCapabilities: derivedCapabilities, requiredOrigins, revision: raw.revision, steps, startedAt
  };
}

async function saveWorkflowRecording(recording) {
  assertWorkflowOriginCount(recording.requiredOrigins, "Active workflow recording origins");
  if (recording.pendingStep) {
    assertWorkflowOriginCount(recording.pendingStep.requiredOrigins, "Active workflow recording pending origins");
  }
  const serialized = JSON.stringify(recording);
  if (new TextEncoder().encode(serialized).byteLength > MAX_WORKFLOW_STORAGE_BYTES) throw new Error("Active workflow recording payload is too large");
  try {
    await chrome.storage.local.set({ [WORKFLOW_RECORDING_STORAGE_KEY]: recording });
  } catch (error) {
    throw new Error(`Could not persist active workflow recording: ${error?.message ?? String(error)}`);
  }
}

async function clearWorkflowRecording() {
  try {
    await chrome.storage.local.set({ [WORKFLOW_RECORDING_STORAGE_KEY]: null });
  } catch (error) {
    throw new Error(`Could not clear active workflow recording: ${error?.message ?? String(error)}`);
  }
}

function containsSensitiveWorkflowField(value, key = "") {
  const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/gu, "");
  if (["text", "expression", "data", "base64", "body", "content", "headers", "password", "passwd", "secret", "token", "credential", "cookie", "authorization", "path", "paths", "files"].some((term) => normalized.includes(term))) {
    return true;
  }
  if (normalized === "url" && typeof value === "string") {
    try {
      const parsed = new URL(value);
      if (parsed.username || parsed.password || [...parsed.searchParams.keys()].some(isSensitiveQueryKey)) return true;
    } catch {
      return true;
    }
  }
  if (Array.isArray(value)) return value.some((entry) => containsSensitiveWorkflowField(entry));
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([field, entry]) => containsSensitiveWorkflowField(entry, field));
}

async function listWorkflows() {
  const { workflows } = await loadWorkflowCollection();
  return workflows.map(({ steps, ...workflow }) => ({ ...workflow, stepCount: steps.length }));
}

async function getWorkflow(params) {
  return resolveWorkflow(await loadWorkflowCollection(), params);
}

async function importWorkflow(params) {
  return queueWorkflowMutation(async () => {
    if (!isRecord(params) || !isRecord(params.workflow)) throw new Error("workflowImport requires a workflow object");
    const collection = await loadWorkflowCollection();
    const workflow = await validateWorkflowSchema(params.workflow);
    if (collection.workflows.length >= MAX_WORKFLOWS) throw new Error(`Workflow storage is full; max ${MAX_WORKFLOWS} workflows`);
    if (collection.workflows.some((entry) => entry.id === workflow.id || entry.name === workflow.name || entry.shortcut === workflow.shortcut)) {
      throw new Error("Imported workflow id, name, and shortcut must be unique");
    }
    await saveWorkflowCollection({ schemaVersion: WORKFLOW_SCHEMA_VERSION, workflows: [...collection.workflows, workflow] });
    return workflow;
  });
}

async function deleteWorkflow(params) {
  return queueWorkflowMutation(async () => {
    const collection = await loadWorkflowCollection();
    const workflow = resolveWorkflow(collection, params);
    await saveWorkflowCollection({
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
      workflows: collection.workflows.filter((entry) => entry.id !== workflow.id)
    });
    return { deleted: true, id: workflow.id };
  });
}

async function runWorkflow(params, options = {}) {
  throwIfAborted(options.signal);
  if (!isRecord(params)) throw new Error("workflowRun params must be an object");
  const totalTimeoutMs = strictBatchInteger(params.totalTimeoutMs, MIN_BATCH_TIMEOUT_MS, MAX_BATCH_TOTAL_TIMEOUT_MS, DEFAULT_WORKFLOW_TOTAL_TIMEOUT_MS, "totalTimeoutMs");
  const collection = await loadWorkflowCollection();
  throwIfAborted(options.signal);
  const workflow = await validateWorkflowSchema(resolveWorkflow(collection, params), { hydrateOrigins: true });
  const missingCapabilities = workflow.requiredCapabilities.filter((capability) => !BRIDGE_CAPABILITIES.includes(capability));
  if (missingCapabilities.length > 0) throw new Error(`Workflow capability preflight failed: ${missingCapabilities.join(", ")}`);
  if (!Array.isArray(params.expectedOrigins)) throw new Error("Workflow origin preflight requires expectedOrigins");
  const expectedOrigins = new Set(params.expectedOrigins.map(workflowOrigin));
  const missingOrigins = workflow.requiredOrigins.filter((origin) => !expectedOrigins.has(origin));
  if (missingOrigins.length > 0) throw new Error(`Workflow origin preflight failed; origins are not authorized: ${missingOrigins.join(", ")}`);
  // Validate every step before any browser effect. This also rejects meta/recursive
  // commands and malformed values that may have reached persisted storage.
  const steps = await Promise.all(workflow.steps.map(validateWorkflowStep));
  throwIfAborted(options.signal);
  const runtimeOrigins = await resolveWorkflowRuntimeOrigins(steps);
  const unauthorizedRuntimeOrigins = runtimeOrigins.filter((origin) => !expectedOrigins.has(origin));
  if (unauthorizedRuntimeOrigins.length > 0) {
    throw new Error(`Workflow origin preflight failed; current tab origins are not authorized: ${unauthorizedRuntimeOrigins.join(", ")}`);
  }
  const authorizedScopes = options.workflowExpectedScopes
    ?? [...expectedOrigins].map((origin) => canonicalPermissionScope(`${origin}/`));
  const bindings = new Map((options.workflowExpectedBindings ?? []).map((binding) => [binding.tabId, binding]));
  for (const tabId of [...new Set(steps.map((step) => step.params.tabId).filter(Number.isInteger))]) {
    const current = await currentPageBinding(tabId);
    throwIfAborted(options.signal);
    if (!workflowScopeAuthorized(current.pageScope, authorizedScopes)) {
      throw new Error(`Workflow origin preflight failed; current page scope is not authorized: ${current.pageScope}`);
    }
    const expected = bindings.get(tabId);
    if (expected && !workflowBindingMatches(current, expected)) {
      throw new Error(`Workflow document binding changed before playback for tab ${tabId}`);
    }
    if (!expected) bindings.set(tabId, current);
  }
  const startedAt = Date.now();
  const deadline = startedAt + totalTimeoutMs;
  const results = [];
  for (let index = 0; index < steps.length; index += 1) {
    throwIfAborted(options.signal);
    const step = steps[index];
    const remainingMs = deadline - Date.now();
    if (remainingMs < MIN_BATCH_TIMEOUT_MS) throw new Error(`Workflow total timeout after ${totalTimeoutMs}ms at step ${index}`);
    try {
      const hasTab = Number.isInteger(step.params.tabId);
      const expected = hasTab ? bindings.get(step.params.tabId) : null;
      if (hasTab) {
        const current = await currentPageBinding(step.params.tabId);
        throwIfAborted(options.signal);
        if (!expected || !workflowBindingMatches(current, expected)) {
          throw new Error(`Workflow document binding changed before step ${index}`);
        }
      }
      if (step.method === "navigate" && !workflowScopeAuthorized(canonicalPermissionScope(step.params.url), authorizedScopes)) {
        throw new Error(`Workflow navigation destination was not included in origin preflight: ${step.params.url}`);
      }
      const stepScopes = hasTab && expected
        ? [...new Set([...authorizedScopes, expected.pageScope])]
        : authorizedScopes;
      const value = await executeWorkflowStep(
        step,
        Math.min(step.timeoutMs, remainingMs),
        options.signal,
        (stepSignal) => step.method === "waitFor" && step.params.condition.type === "download"
          ? executeCommand(step.method, cloneWorkflowValue(step.params), { signal: stepSignal, workflowInternal: true })
          : executeScopedPageCommand({
            expectedBindings: expected ? [expected] : [],
            expectedScopes: stepScopes,
            method: step.method,
            params: cloneWorkflowValue(step.params)
          }, { signal: stepSignal, workflowInternal: true })
      );
      const after = hasTab ? await currentPageBinding(step.params.tabId, value?.url) : null;
      if (step.method === "navigate") {
        if (!workflowScopeAuthorized(after.pageScope, authorizedScopes)) {
          throw new Error(`Workflow navigation left its preauthorized origin union: ${after.pageScope}`);
        }
        bindings.set(step.params.tabId, after);
      } else if (hasTab && !workflowBindingMatches(after, expected)) {
        throw new Error(`Workflow document binding changed during step ${index}`);
      }
      results.push({ index, method: step.method, ok: true, value });
    } catch (error) {
      results.push({ error: error?.message ?? String(error), index, method: step.method, ok: false });
      return { completed: results.length, elapsedMs: Date.now() - startedAt, ok: false, results, stoppedAt: index, totalSteps: steps.length, workflowId: workflow.id };
    }
  }
  return { completed: results.length, elapsedMs: Date.now() - startedAt, ok: true, results, stoppedAt: null, totalSteps: steps.length, workflowId: workflow.id };
}

function workflowBindingMatches(current, expected) {
  return current.documentId === expected.documentId
    && current.navigationGeneration === expected.navigationGeneration
    && current.pageScope === expected.pageScope;
}

function workflowScopeAuthorized(scope, authorizedScopes) {
  const actual = new URL(canonicalPermissionScope(scope));
  return authorizedScopes.some((allowedScope) => {
    const allowed = new URL(canonicalPermissionScope(allowedScope));
    if (actual.protocol !== allowed.protocol || actual.hostname !== allowed.hostname || actual.port !== allowed.port) return false;
    const prefix = allowed.pathname === "/" ? "/" : allowed.pathname.replace(/\/$/u, "");
    return prefix === "/" || actual.pathname === prefix || actual.pathname.startsWith(`${prefix}/`);
  });
}

async function resolveWorkflowRuntimeOrigins(steps) {
  const tabIds = [...new Set(steps.map((step) => step.params.tabId).filter(Number.isInteger))];
  const origins = await Promise.all(tabIds.map(async (tabId) => {
    const tab = await chrome.tabs.get(tabId);
    if (typeof tab?.url !== "string") throw new Error(`Workflow origin preflight could not resolve tab ${tabId}`);
    return workflowOrigin(tab.url);
  }));
  return [...new Set(origins)].sort();
}

function executeWorkflowStep(step, timeoutMs, parentSignal, operation) {
  const controller = new AbortController();
  const onParentAbort = () => controller.abort(parentSignal.reason);
  if (parentSignal?.aborted) controller.abort(parentSignal.reason);
  else parentSignal?.addEventListener("abort", onParentAbort, { once: true });
  let rejectOnAbort;
  const abortPromise = new Promise((_, reject) => {
    rejectOnAbort = () => reject(controller.signal.reason ?? new Error("Workflow step was cancelled"));
    controller.signal.addEventListener("abort", rejectOnAbort, { once: true });
  });
  const timer = setTimeout(() => controller.abort(new Error(`Workflow step ${step.method} timed out after ${timeoutMs}ms`)), timeoutMs);
  const execution = Promise.resolve().then(() => {
    throwIfAborted(controller.signal);
    return operation(controller.signal);
  });
  return Promise.race([execution, abortPromise]).catch(async (error) => {
    if (controller.signal.aborted) await execution.catch(() => {});
    throw error;
  }).finally(() => {
    clearTimeout(timer);
    parentSignal?.removeEventListener("abort", onParentAbort);
    controller.signal.removeEventListener("abort", rejectOnAbort);
  });
}

async function loadWorkflowCollection() {
  let stored;
  try {
    stored = await chrome.storage.local.get(WORKFLOW_STORAGE_KEY);
  } catch (error) {
    throw new Error(`Could not read workflow local storage: ${error?.message ?? String(error)}`);
  }
  const raw = stored?.[WORKFLOW_STORAGE_KEY];
  if (raw == null) return { schemaVersion: WORKFLOW_SCHEMA_VERSION, workflows: [] };
  if (new TextEncoder().encode(JSON.stringify(raw)).byteLength > MAX_WORKFLOW_STORAGE_BYTES) {
    throw new Error(`Workflow storage payload is too large; max ${MAX_WORKFLOW_STORAGE_BYTES} bytes`);
  }
  const collectionExtra = isRecord(raw) ? Object.keys(raw).filter((field) => !["schemaVersion", "workflows"].includes(field)) : [];
  if (!isRecord(raw) || collectionExtra.length > 0 || raw.schemaVersion !== WORKFLOW_SCHEMA_VERSION || !Array.isArray(raw.workflows) || raw.workflows.length > MAX_WORKFLOWS) {
    throw new Error("Persisted workflow collection schema is invalid or unsupported");
  }
  const workflows = await Promise.all(raw.workflows.map(async (entry) => {
    const migratedEntry = migrateWorkflow(entry);
    return validateWorkflowSchema(migratedEntry);
  }));
  assertUniqueWorkflows(workflows);
  const collection = { schemaVersion: WORKFLOW_SCHEMA_VERSION, workflows };
  return collection;
}

async function saveWorkflowCollection(collection) {
  assertUniqueWorkflows(collection.workflows);
  for (const workflow of collection.workflows) {
    assertWorkflowOriginCount(workflow.requiredOrigins, `Workflow ${workflow.id ?? "unknown"} origins`);
  }
  const serialized = JSON.stringify(collection);
  if (new TextEncoder().encode(serialized).byteLength > MAX_WORKFLOW_STORAGE_BYTES) {
    throw new Error(`Workflow storage payload is too large; max ${MAX_WORKFLOW_STORAGE_BYTES} bytes`);
  }
  try {
    await chrome.storage.local.set({ [WORKFLOW_STORAGE_KEY]: collection });
  } catch (error) {
    throw new Error(`Could not write workflow local storage: ${error?.message ?? String(error)}`);
  }
}

function migrateWorkflow(value) {
  if (!isRecord(value) || value.schemaVersion !== 0) return value;
  if (!Array.isArray(value.steps)) throw new Error("Legacy workflow steps must be an array");
  return {
    ...value,
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    steps: value.steps.map((step) => {
      if (!isRecord(step) || typeof step.command !== "string" || Object.hasOwn(step, "method")) {
        throw new Error("Legacy workflow step schema cannot be migrated safely");
      }
      const { command, ...rest } = step;
      return { ...rest, method: command };
    })
  };
}

async function validateWorkflowSchema(value, { hydrateOrigins = false } = {}) {
  if (!isRecord(value) || value.schemaVersion !== WORKFLOW_SCHEMA_VERSION) throw new Error("Workflow schemaVersion is unsupported");
  const allowed = ["schemaVersion", "id", "name", "shortcut", "requiredCapabilities", "requiredOrigins", "steps", "createdAt", "updatedAt"];
  const extra = Object.keys(value).filter((field) => !allowed.includes(field));
  if (extra.length > 0) throw new Error(`Workflow contains unsupported fields: ${extra.join(", ")}`);
  const id = requireBoundedWorkflowString(value.id, 100, "id");
  const name = requireBoundedWorkflowString(value.name, MAX_WORKFLOW_NAME_CHARS, "name");
  const shortcut = normalizeWorkflowShortcut(value.shortcut);
  if (!Array.isArray(value.steps) || value.steps.length === 0 || value.steps.length > MAX_WORKFLOW_STEPS) throw new Error(`Workflow steps must contain 1 to ${MAX_WORKFLOW_STEPS} entries`);
  if (!Array.isArray(value.requiredCapabilities) || value.requiredCapabilities.length > 100) throw new Error("Workflow requiredCapabilities is invalid");
  if (!Array.isArray(value.requiredOrigins) || value.requiredOrigins.length > MAX_WORKFLOW_ORIGINS) throw new Error("Workflow requiredOrigins is invalid");
  const steps = await Promise.all(value.steps.map(validateWorkflowStep));
  const requiredCapabilities = [...new Set(steps.flatMap(workflowStepCapabilities))].sort();
  const requiredOrigins = new Set(steps
    .filter((step) => step.method === "navigate")
    .map((step) => workflowOrigin(step.params.url)));
  if (hydrateOrigins) {
    const tabIds = [...new Set(steps.map((step) => step.params.tabId).filter(Number.isInteger))];
    for (const tabId of tabIds) {
      const tab = await chrome.tabs.get(tabId);
      if (typeof tab?.url !== "string") throw new Error(`Workflow origin metadata could not resolve tab ${tabId}`);
      requiredOrigins.add(workflowOrigin(tab.url));
    }
  } else {
    for (const origin of value.requiredOrigins) requiredOrigins.add(workflowOrigin(origin));
  }
  const normalizedOrigins = [...requiredOrigins].sort();
  assertWorkflowOriginCount(normalizedOrigins, "Workflow required origins");
  const createdAt = requireWorkflowTimestamp(value.createdAt, "createdAt");
  const updatedAt = requireWorkflowTimestamp(value.updatedAt, "updatedAt");
  return { schemaVersion: WORKFLOW_SCHEMA_VERSION, id, name, shortcut, requiredCapabilities, requiredOrigins: normalizedOrigins, steps, createdAt, updatedAt };
}

function workflowStepCapabilities(step) {
  if (step?.method === "waitFor") {
    const conditionType = step.params?.condition?.type;
    if (conditionType === "download") return ["browser.downloads", "browser.wait"];
    if (conditionType === "networkIdle") return ["browser.cdp", "browser.tabs", "browser.wait"];
  }
  return WORKFLOW_STEP_METHODS[step.method].capability;
}

function assertWorkflowOriginCount(origins, label) {
  if (!Array.isArray(origins) || origins.length > MAX_WORKFLOW_ORIGINS) {
    throw new Error(`${label} are limited to ${MAX_WORKFLOW_ORIGINS}`);
  }
}

async function validateWorkflowStep(value) {
  if (!isRecord(value) || typeof value.method !== "string" || !Object.hasOwn(WORKFLOW_STEP_METHODS, value.method)) {
    throw new Error("Workflow step method is not allowed; recursive and meta commands are prohibited");
  }
  const extra = Object.keys(value).filter((field) => !["method", "params", "timeoutMs"].includes(field));
  if (extra.length > 0 || !isRecord(value.params) || containsSensitiveWorkflowField(value.params)) throw new Error("Workflow step contains unsupported or sensitive fields");
  if (value.method === "waitFor" && ["text", "url"].includes(value.params?.condition?.type)) {
    throw new Error(`Sensitive waitFor ${value.params.condition.type} conditions are not allowed in workflows`);
  }
  const timeoutMs = strictBatchInteger(value.timeoutMs, MIN_BATCH_TIMEOUT_MS, MAX_BATCH_ACTION_TIMEOUT_MS, DEFAULT_WORKFLOW_STEP_TIMEOUT_MS, "workflow step timeoutMs");
  let params;
  if (value.method === "screenshot") {
    const allowed = ["format", "quality", "tabId"];
    assertBatchFields(value.params, allowed, "workflow screenshot");
    requireTabId(value.params);
    if (value.params.format != null && !["png", "jpeg"].includes(value.params.format)) throw new Error("workflow screenshot format must be png or jpeg");
    if (value.params.quality != null) strictBatchInteger(value.params.quality, 1, 100, 80, "workflow screenshot quality");
    params = { ...value.params };
  } else {
    const type = WORKFLOW_STEP_METHODS[value.method].type;
    params = (await validateBatchAction({ type, params: value.params, timeoutMs }, 0)).params;
  }
  return { method: value.method, params: cloneWorkflowValue(params), timeoutMs };
}

function resolveWorkflow(collection, params) {
  if (!isRecord(params)) throw new Error("Workflow selector must be an object");
  const selectors = ["id", "name", "shortcut"].filter((field) => params[field] != null);
  if (selectors.length !== 1) throw new Error("Select exactly one workflow by id, name, or shortcut");
  const field = selectors[0];
  const needle = field === "shortcut" ? normalizeWorkflowShortcut(params[field]) : requireBoundedWorkflowString(params[field], 120, field);
  const workflow = collection.workflows.find((entry) => entry[field] === needle);
  if (!workflow) throw new Error(`Workflow ${field} was not found`);
  return workflow;
}

function assertUniqueWorkflows(workflows) {
  for (const field of ["id", "name", "shortcut"]) {
    const values = workflows.map((entry) => entry[field]);
    if (new Set(values).size !== values.length) throw new Error(`Workflow ${field} values must be unique`);
  }
}

function normalizeWorkflowShortcut(value) {
  const raw = requireBoundedWorkflowString(value, MAX_WORKFLOW_SHORTCUT_CHARS, "shortcut");
  const normalized = raw.toLowerCase().trim().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "");
  if (normalized.length === 0 || normalized.length > MAX_WORKFLOW_SHORTCUT_CHARS) throw new Error("Workflow shortcut is invalid");
  return normalized;
}

function workflowOrigin(value) {
  if (typeof value !== "string") throw new Error("Workflow origin must be a string");
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error("Workflow origin must be a valid absolute URL"); }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Workflow origins must use http or https");
  return parsed.origin;
}

function requireBoundedWorkflowString(value, max, label) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) throw new Error(`Workflow ${label} must be a non-empty string of at most ${max} characters`);
  return value.trim();
}

function requireWorkflowTimestamp(value, label) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw new Error(`Workflow ${label} must be an ISO timestamp`);
  return new Date(value).toISOString();
}

function cloneWorkflowValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function queueScheduleMutation(operation) {
  const next = scheduleMutationQueue.then(operation, operation);
  scheduleMutationQueue = next.catch(() => {});
  return next;
}

async function createSchedule(params) {
  return queueScheduleMutation(async () => {
    assertScheduleFields(params, ["approval", "enabled", "name", "notify", "recurrence", "requiredOrigins", "workflowId"], "schedule create");
    const workflow = await scheduledWorkflowSnapshot(params.workflowId);
    const requiredOrigins = normalizeScheduleOrigins(params.requiredOrigins);
    assertSameStringSet(requiredOrigins, workflow.requiredOrigins, "Schedule requiredOrigins must exactly match the workflow's current origin requirements");
    const recurrence = validateScheduleRecurrence(params.recurrence);
    const notify = validateScheduleNotify(params.notify ?? "none");
    const enabled = params.enabled !== false;
    const proposedApproval = validateScheduleApproval(params.approval);
    if (proposedApproval.scheduleId === null) throw new Error("Dedicated schedule approval must bind the new schedule id");
    const collection = await loadScheduleMutationCollection();
    const nextCreateGeneration = collection.createGeneration + 1;
    if (proposedApproval.approvalGeneration !== nextCreateGeneration) {
      throw new Error("Schedule creation approval was already consumed or is stale");
    }
    const approval = await requireExactScheduleApproval(proposedApproval, {
      approvalGeneration: nextCreateGeneration, enabled, notify, recurrence, requiredOrigins,
      scheduleId: proposedApproval.scheduleId, workflow
    });
    const now = new Date().toISOString();
    const schedule = validateSchedule({
      schemaVersion: SCHEDULE_SCHEMA_VERSION,
      id: approval.scheduleId,
      name: requireBoundedWorkflowString(params.name, MAX_WORKFLOW_NAME_CHARS, "schedule name"),
      workflowId: workflow.id,
      requiredCapabilities: workflow.requiredCapabilities,
      requiredOrigins,
      approval,
      enabled,
      notify,
      recurrence,
      nextRunAt: 0,
      lastScheduledFor: null,
      executionClaim: null,
      history: [],
      createdAt: now,
      updatedAt: now
    });
    schedule.nextRunAt = nextScheduleRunAt(schedule.recurrence, Date.now());
    if (collection.schedules.length >= MAX_SCHEDULES) throw new Error(`Schedule storage is full; max ${MAX_SCHEDULES}`);
    if (collection.schedules.some((entry) => entry.id === schedule.id)) {
      throw new Error("Schedule creation ids are single-use and must not replace an existing schedule");
    }
    await transitionScheduleAlarm({ ...collection, createGeneration: nextCreateGeneration }, {
      operation: "upsert", scheduleId: schedule.id, nextSchedule: schedule
    });
    return schedule;
  });
}

async function listSchedules() {
  const { schedules } = await loadScheduleCollection();
  return schedules.map(({ history, ...schedule }) => ({ ...schedule, historyCount: history.length }));
}

async function scheduleHistory(params) {
  const schedule = resolveSchedule(await loadScheduleCollection(), params);
  return schedule.history;
}

async function updateSchedule(params) {
  return queueScheduleMutation(async () => {
    assertScheduleFields(params, ["approval", "enabled", "id", "name", "notify", "recurrence", "requiredOrigins"], "schedule update");
    const collection = await loadScheduleMutationCollection();
    const existing = resolveSchedule(collection, { id: params.id });
    const workflow = await scheduledWorkflowSnapshot(existing.workflowId);
    const requiredOrigins = params.requiredOrigins == null ? existing.requiredOrigins : normalizeScheduleOrigins(params.requiredOrigins);
    assertSameStringSet(requiredOrigins, workflow.requiredOrigins, "Schedule requiredOrigins must exactly match the workflow's current origin requirements");
    const recurrence = params.recurrence == null ? existing.recurrence : validateScheduleRecurrence(params.recurrence);
    const notify = params.notify == null ? existing.notify : validateScheduleNotify(params.notify);
    const enabled = params.enabled ?? existing.enabled;
    const approval = await requireExactScheduleApproval(params.approval, {
      approvalGeneration: existing.approval.approvalGeneration + 1,
      enabled, notify, recurrence, requiredOrigins, scheduleId: existing.id, workflow
    });
    const updated = validateSchedule({
      ...existing,
      enabled,
      name: params.name == null ? existing.name : requireBoundedWorkflowString(params.name, MAX_WORKFLOW_NAME_CHARS, "schedule name"),
      notify,
      recurrence,
      requiredCapabilities: workflow.requiredCapabilities,
      requiredOrigins,
      approval,
      nextRunAt: nextScheduleRunAt(recurrence, Date.now()),
      updatedAt: new Date().toISOString()
    });
    await transitionScheduleAlarm(collection, { operation: "upsert", scheduleId: updated.id, nextSchedule: updated });
    return updated;
  });
}

async function deleteSchedule(params) {
  return queueScheduleMutation(async () => {
    const collection = await loadScheduleMutationCollection();
    const schedule = resolveSchedule(collection, params);
    await transitionScheduleAlarm(collection, { operation: "delete", scheduleId: schedule.id, nextSchedule: null });
    return { deleted: true, id: schedule.id };
  });
}

function runScheduleNow(params, options = {}) {
  if (!isRecord(params) || Object.keys(params).some((field) => field !== "id")) {
    throw new Error("scheduleRunNow requires exactly one id");
  }
  return executeSchedule(requireBoundedWorkflowString(params.id, 100, "schedule id"), {
    signal: options.signal,
    trigger: "manual"
  });
}

function executeSchedule(id, { scheduledTime, signal, trigger }) {
  return queueScheduleMutation(async () => {
    throwIfAborted(signal);
    const collection = await loadScheduleMutationCollection();
    const schedule = resolveSchedule(collection, { id });
    const occurrence = trigger === "alarm"
      ? (Number.isFinite(scheduledTime) ? Math.trunc(scheduledTime) : schedule.nextRunAt)
      : null;
    if (trigger === "alarm" && occurrence !== schedule.nextRunAt) {
      return { stale: true, ok: false, scheduleId: schedule.id };
    }
    if (trigger === "alarm" && schedule.lastScheduledFor === occurrence) {
      return { duplicate: true, ok: false, scheduleId: schedule.id };
    }
    let claimed = schedule;
    if (trigger === "alarm") {
      const startedAt = new Date().toISOString();
      claimed = {
        ...schedule,
        executionClaim: {
          executionId: crypto.randomUUID(),
          phase: "preflight",
          scheduledFor: occurrence,
          startedAt
        },
        lastScheduledFor: occurrence,
        updatedAt: startedAt
      };
      await replaceSchedule(collection, claimed);
    }
    const startedAt = new Date().toISOString();
    let ok = false;
    let error;
    try {
      if (trigger === "alarm" && claimed.enabled !== true) throw new Error("Schedule is disabled");
      const workflow = await scheduledWorkflowSnapshot(claimed.workflowId);
      assertSameStringSet(claimed.requiredCapabilities, workflow.requiredCapabilities, "Workflow capability requirements changed");
      assertSameStringSet(claimed.requiredOrigins, workflow.requiredOrigins, "Workflow origin requirements changed");
      await requireExactScheduleApproval(claimed.approval, {
        approvalGeneration: claimed.approval.approvalGeneration,
        enabled: claimed.enabled,
        notify: claimed.notify,
        recurrence: claimed.recurrence,
        requiredOrigins: claimed.requiredOrigins,
        scheduleId: claimed.id,
        workflow
      });
      throwIfAborted(signal);
      if (trigger === "alarm") {
        claimed = {
          ...claimed,
          executionClaim: { ...claimed.executionClaim, phase: "workflow" },
          updatedAt: new Date().toISOString()
        };
        await replaceSchedule(await loadScheduleCollection(), claimed);
      }
      const result = await runWorkflow({
        id: workflow.id,
        expectedOrigins: claimed.requiredOrigins,
        totalTimeoutMs: DEFAULT_WORKFLOW_TOTAL_TIMEOUT_MS
      }, {
        signal,
        workflowExpectedScopes: claimed.requiredOrigins.map((origin) => canonicalPermissionScope(`${origin}/`)),
        workflowInternal: true
      });
      throwIfAborted(signal);
      if (result.ok !== true) throw new Error(result.results?.find((entry) => entry.ok === false)?.error ?? "Workflow execution failed");
      ok = true;
    } catch (executionError) {
      if (signal?.aborted) throwIfAborted(signal);
      error = sanitizeScheduleError(executionError);
    }
    const entry = {
      id: crypto.randomUUID(),
      finishedAt: new Date().toISOString(),
      ok,
      startedAt,
      trigger,
      ...(error ? { error } : {})
    };
    const latest = resolveSchedule(await loadScheduleCollection(), { id: claimed.id });
    const nextRunAt = trigger === "alarm"
      ? nextScheduleRunAt(latest.recurrence, Math.max(occurrence, Date.now()))
      : latest.nextRunAt;
    const updated = {
      ...latest,
      executionClaim: null,
      history: [...latest.history, entry].slice(-MAX_SCHEDULE_HISTORY),
      nextRunAt,
      updatedAt: new Date().toISOString()
    };
    const latestCollection = await loadScheduleCollection();
    if (trigger === "alarm") {
      await transitionScheduleAlarm(latestCollection, { operation: "upsert", scheduleId: updated.id, nextSchedule: updated });
    } else {
      await replaceSchedule(latestCollection, updated);
    }
    await notifyScheduleResult(updated, entry);
    return { ...entry, scheduleId: updated.id };
  });
}

async function scheduledWorkflowSnapshot(workflowId) {
  const id = requireBoundedWorkflowString(workflowId, 100, "workflow id");
  const collection = await loadWorkflowCollection();
  const workflow = collection.workflows.find((entry) => entry.id === id);
  if (!workflow) throw new Error(`Scheduled workflow ${id} was not found`);
  const hydrated = await validateWorkflowSchema(workflow, { hydrateOrigins: true });
  const missing = hydrated.requiredCapabilities.filter((capability) => !BRIDGE_CAPABILITIES.includes(capability));
  if (missing.length > 0) throw new Error(`Scheduled workflow capabilities are unavailable: ${missing.join(", ")}`);
  await ensureTabLeasesLoaded();
  const managedTabs = [];
  for (const tabId of [...new Set(hydrated.steps.map((step) => step.params.tabId).filter(Number.isInteger))].sort((left, right) => left - right)) {
    const tab = await chrome.tabs.get(tabId);
    if (tab?.incognito === true) throw new Error(`Incognito tab ${tabId} cannot be used by a schedule`);
    const lease = tabLeases.get(tabId);
    if (!lease || typeof lease.leaseId !== "string" || lease.leaseId.length === 0 || typeof lease.sessionId !== "string") {
      throw new Error(`Scheduled workflow tab ${tabId} requires a stable managed session lease`);
    }
    managedTabs.push({ tabId, sessionId: lease.sessionId, leaseId: lease.leaseId });
  }
  const workflowFingerprint = await sha256ScheduleValue({
    schemaVersion: hydrated.schemaVersion,
    id: hydrated.id,
    requiredCapabilities: hydrated.requiredCapabilities,
    requiredOrigins: hydrated.requiredOrigins,
    steps: hydrated.steps,
    managedTabs
  });
  return { ...hydrated, managedTabs, workflowFingerprint };
}

async function previewScheduleApproval(params) {
  if (!isRecord(params)) throw new Error("Schedule approval preview params must be an object");
  if (params.id != null) {
    assertScheduleFields(params, ["enabled", "id", "name", "notify", "recurrence", "requiredOrigins"], "schedule approval preview");
    const existing = resolveSchedule(await loadScheduleMutationCollection(), { id: params.id });
    const workflow = await scheduledWorkflowSnapshot(existing.workflowId);
    const requiredOrigins = params.requiredOrigins == null ? existing.requiredOrigins : normalizeScheduleOrigins(params.requiredOrigins);
    assertSameStringSet(requiredOrigins, workflow.requiredOrigins, "Schedule requiredOrigins must exactly match the workflow's current origin requirements");
    return buildScheduleApproval({
      approvalGeneration: existing.approval.approvalGeneration + 1,
      enabled: params.enabled ?? existing.enabled,
      notify: params.notify == null ? existing.notify : validateScheduleNotify(params.notify),
      recurrence: params.recurrence == null ? existing.recurrence : validateScheduleRecurrence(params.recurrence),
      requiredOrigins,
      scheduleId: existing.id,
      workflow
    });
  }
  assertScheduleFields(params, ["enabled", "name", "notify", "recurrence", "requiredOrigins", "workflowId"], "schedule approval preview");
  const collection = await loadScheduleMutationCollection();
  const workflow = await scheduledWorkflowSnapshot(params.workflowId);
  const requiredOrigins = normalizeScheduleOrigins(params.requiredOrigins);
  assertSameStringSet(requiredOrigins, workflow.requiredOrigins, "Schedule requiredOrigins must exactly match the workflow's current origin requirements");
  return buildScheduleApproval({
    approvalGeneration: collection.createGeneration + 1,
    enabled: params.enabled !== false,
    notify: validateScheduleNotify(params.notify ?? "none"),
    recurrence: validateScheduleRecurrence(params.recurrence),
    requiredOrigins,
    scheduleId: crypto.randomUUID(),
    workflow
  });
}

async function buildScheduleApproval({ approvalGeneration, enabled, notify, recurrence, requiredOrigins, scheduleId, workflow }) {
  const recurrenceFingerprint = await sha256ScheduleValue(recurrence);
  const descriptor = {
    version: SCHEDULE_APPROVAL_VERSION,
    approvalGeneration,
    enabled,
    scheduleId,
    workflowSchemaVersion: workflow.schemaVersion,
    workflowId: workflow.id,
    workflowFingerprint: workflow.workflowFingerprint,
    recurrence: { ...recurrence },
    recurrenceFingerprint,
    recurrenceKind: recurrence.kind,
    notificationPolicy: notify,
    requiredOrigins: [...requiredOrigins],
    managedTabs: workflow.managedTabs.map((entry) => ({ ...entry }))
  };
  return { ...descriptor, pattern: `v1:${await sha256ScheduleValue(descriptor)}` };
}

async function requireExactScheduleApproval(value, expectedInput) {
  const approval = validateScheduleApproval(value);
  const expected = await buildScheduleApproval(expectedInput);
  if (canonicalScheduleValue(approval) !== canonicalScheduleValue(expected)) {
    throw new Error("Dedicated schedule approval does not exactly match the canonical fingerprint");
  }
  return approval;
}

function validateScheduleApproval(value) {
  const allowed = ["version", "approvalGeneration", "enabled", "scheduleId", "pattern", "workflowSchemaVersion", "workflowId", "workflowFingerprint", "recurrence", "recurrenceFingerprint", "recurrenceKind", "notificationPolicy", "requiredOrigins", "managedTabs"];
  if (!isRecord(value) || Object.keys(value).some((field) => !allowed.includes(field)) || value.version !== SCHEDULE_APPROVAL_VERSION) {
    throw new Error("Dedicated schedule approval is required");
  }
  if (typeof value.pattern !== "string" || !/^v1:[a-f0-9]{64}$/u.test(value.pattern)
    || value.workflowSchemaVersion !== WORKFLOW_SCHEMA_VERSION
    || typeof value.workflowFingerprint !== "string" || !/^[a-f0-9]{64}$/u.test(value.workflowFingerprint)
    || typeof value.recurrenceFingerprint !== "string" || !/^[a-f0-9]{64}$/u.test(value.recurrenceFingerprint)
    || !["daily", "weekly", "monthly", "annual"].includes(value.recurrenceKind)) {
    throw new Error("Dedicated schedule approval fingerprint is invalid");
  }
  const workflowId = requireBoundedWorkflowString(value.workflowId, 100, "approval workflow id");
  if (!Number.isSafeInteger(value.approvalGeneration) || value.approvalGeneration < 1 || value.approvalGeneration > 1_000_000) throw new Error("Schedule approval generation is invalid");
  if (typeof value.enabled !== "boolean") throw new Error("Schedule approval enabled state is invalid");
  const scheduleId = value.scheduleId === null ? null : requireBoundedWorkflowString(value.scheduleId, 100, "approval schedule id");
  const recurrence = validateScheduleRecurrence(value.recurrence);
  if (recurrence.kind !== value.recurrenceKind) throw new Error("Schedule approval recurrence kind is inconsistent");
  const notificationPolicy = validateScheduleNotify(value.notificationPolicy);
  const requiredOrigins = normalizeScheduleOrigins(value.requiredOrigins);
  if (!Array.isArray(value.managedTabs) || value.managedTabs.length > MAX_TAB_IDS) throw new Error("Schedule approval managed tabs are invalid");
  const managedTabs = value.managedTabs.map((entry) => {
    if (!isRecord(entry) || JSON.stringify(Object.keys(entry).sort()) !== JSON.stringify(["leaseId", "sessionId", "tabId"])) throw new Error("Schedule approval managed tab is invalid");
    return {
      tabId: requireTabId({ tabId: entry.tabId }),
      sessionId: requireBoundedWorkflowString(entry.sessionId, MAX_KEY_CHARS, "approval session id"),
      leaseId: requireBoundedWorkflowString(entry.leaseId, MAX_KEY_CHARS, "approval lease id")
    };
  }).sort((left, right) => left.tabId - right.tabId);
  if (new Set(managedTabs.map((entry) => entry.tabId)).size !== managedTabs.length) throw new Error("Schedule approval managed tabs must be unique");
  return {
    version: SCHEDULE_APPROVAL_VERSION,
    approvalGeneration: value.approvalGeneration,
    enabled: value.enabled,
    scheduleId,
    pattern: value.pattern,
    workflowSchemaVersion: value.workflowSchemaVersion,
    workflowId,
    workflowFingerprint: value.workflowFingerprint,
    recurrence,
    recurrenceFingerprint: value.recurrenceFingerprint,
    recurrenceKind: value.recurrenceKind,
    notificationPolicy,
    requiredOrigins,
    managedTabs
  };
}

async function sha256ScheduleValue(value) {
  const bytes = new TextEncoder().encode(canonicalScheduleValue(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function canonicalScheduleValue(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalScheduleValue).join(",")}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalScheduleValue(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

async function replaceSchedule(collection, schedule) {
  await saveScheduleCollection({
    alarmJournal: collection.alarmJournal,
    createGeneration: collection.createGeneration,
    schemaVersion: SCHEDULE_SCHEMA_VERSION,
    schedules: collection.schedules.map((entry) => entry.id === schedule.id ? schedule : entry)
  });
}

async function transitionScheduleAlarm(collection, transition) {
  if (collection.alarmJournal.length >= MAX_SCHEDULES) throw new Error("Schedule alarm journal is full");
  const journalEntry = validateScheduleAlarmJournalEntry({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...transition
  });
  const pending = {
    alarmJournal: [...collection.alarmJournal, journalEntry],
    createGeneration: collection.createGeneration,
    schemaVersion: SCHEDULE_SCHEMA_VERSION,
    schedules: collection.schedules
  };
  await saveScheduleCollection(pending);
  await applyScheduleAlarmJournalEntry(journalEntry);
  const schedules = journalEntry.operation === "delete"
    ? collection.schedules.filter((entry) => entry.id !== journalEntry.scheduleId)
    : collection.schedules.some((entry) => entry.id === journalEntry.scheduleId)
      ? collection.schedules.map((entry) => entry.id === journalEntry.scheduleId ? journalEntry.nextSchedule : entry)
      : [...collection.schedules, journalEntry.nextSchedule];
  await saveScheduleCollection({
    alarmJournal: pending.alarmJournal.filter((entry) => entry.id !== journalEntry.id),
    createGeneration: pending.createGeneration,
    schemaVersion: SCHEDULE_SCHEMA_VERSION,
    schedules
  });
}

async function applyScheduleAlarmJournalEntry(entry) {
  const name = scheduleAlarmName(entry.scheduleId);
  if (entry.operation === "delete" || entry.nextSchedule.enabled !== true) {
    await chrome.alarms.clear(name);
    return;
  }
  await chrome.alarms.create(name, { when: entry.nextSchedule.nextRunAt });
}

async function restoreScheduleAlarms() {
  try {
    await queueScheduleMutation(async () => {
      let collection = await loadScheduleCollection();
      const reconciledIds = new Set();
      for (const journalEntry of [...collection.alarmJournal]) {
        await applyScheduleAlarmJournalEntry(journalEntry);
        reconciledIds.add(journalEntry.scheduleId);
        const schedules = journalEntry.operation === "delete"
          ? collection.schedules.filter((entry) => entry.id !== journalEntry.scheduleId)
          : collection.schedules.some((entry) => entry.id === journalEntry.scheduleId)
            ? collection.schedules.map((entry) => entry.id === journalEntry.scheduleId ? journalEntry.nextSchedule : entry)
            : [...collection.schedules, journalEntry.nextSchedule];
        collection = {
          alarmJournal: collection.alarmJournal.filter((entry) => entry.id !== journalEntry.id),
          createGeneration: collection.createGeneration,
          schemaVersion: SCHEDULE_SCHEMA_VERSION,
          schedules
        };
        await saveScheduleCollection(collection);
      }
      for (const schedule of [...collection.schedules]) {
        const claim = schedule.executionClaim;
        if (!claim && schedule.lastScheduledFor !== schedule.nextRunAt) continue;
        const finishedAt = new Date().toISOString();
        const interrupted = claim ? {
          id: crypto.randomUUID(),
          executionId: claim.executionId,
          phase: claim.phase,
          status: "interrupted",
          startedAt: claim.startedAt,
          finishedAt,
          trigger: "alarm",
          ok: false,
          error: "Scheduled execution was interrupted before completion"
        } : null;
        const baseline = claim?.scheduledFor ?? schedule.nextRunAt;
        const recovered = {
          ...schedule,
          executionClaim: null,
          history: interrupted ? [...schedule.history, interrupted].slice(-MAX_SCHEDULE_HISTORY) : schedule.history,
          nextRunAt: nextScheduleRunAt(schedule.recurrence, Math.max(baseline, Date.now())),
          updatedAt: finishedAt
        };
        await transitionScheduleAlarm(collection, {
          operation: "upsert",
          scheduleId: recovered.id,
          nextSchedule: recovered
        });
        reconciledIds.add(recovered.id);
        collection = await loadScheduleCollection();
      }
      for (const schedule of collection.schedules) {
        if (!reconciledIds.has(schedule.id)) await armScheduleAlarm(schedule);
      }
    });
  } catch (error) {
    sendEvent({ category: "scheduler", type: "restoreFailed", error: sanitizeScheduleError(error) });
  }
}

async function armScheduleAlarm(schedule) {
  const name = scheduleAlarmName(schedule.id);
  if (schedule.enabled !== true) {
    await chrome.alarms.clear(name);
    return;
  }
  await chrome.alarms.create(name, { when: schedule.nextRunAt });
}

function scheduleAlarmName(id) {
  return `${SCHEDULE_ALARM_PREFIX}${id}`;
}

async function loadScheduleCollection() {
  let stored;
  try { stored = await chrome.storage.local.get(SCHEDULE_STORAGE_KEY); }
  catch (error) { throw new Error(`Could not read schedule storage: ${error?.message ?? String(error)}`); }
  const raw = stored?.[SCHEDULE_STORAGE_KEY];
  if (raw == null) return { schemaVersion: SCHEDULE_SCHEMA_VERSION, schedules: [], alarmJournal: [], createGeneration: 0 };
  if (new TextEncoder().encode(JSON.stringify(raw)).byteLength > MAX_SCHEDULE_STORAGE_BYTES) throw new Error("Schedule storage payload is too large");
  if (!isRecord(raw)
    || JSON.stringify(Object.keys(raw).sort()) !== JSON.stringify(["alarmJournal", "createGeneration", "schedules", "schemaVersion"])
    || raw.schemaVersion !== SCHEDULE_SCHEMA_VERSION
    || !Array.isArray(raw.schedules)
    || raw.schedules.length > MAX_SCHEDULES
    || !Array.isArray(raw.alarmJournal)
    || raw.alarmJournal.length > MAX_SCHEDULES
    || !Number.isSafeInteger(raw.createGeneration)
    || raw.createGeneration < 0
    || raw.createGeneration >= 1_000_000) throw new Error("Persisted schedule collection schema is invalid");
  const schedules = raw.schedules.map(validateSchedule);
  const alarmJournal = raw.alarmJournal.map(validateScheduleAlarmJournalEntry);
  if (new Set(schedules.map((entry) => entry.id)).size !== schedules.length) throw new Error("Schedule ids must be unique");
  return { schemaVersion: SCHEDULE_SCHEMA_VERSION, schedules, alarmJournal, createGeneration: raw.createGeneration };
}

async function loadScheduleMutationCollection() {
  const collection = await loadScheduleCollection();
  if (collection.alarmJournal.length > 0) {
    throw new Error("A pending schedule alarm transition must be reconciled before another mutation");
  }
  return collection;
}

async function saveScheduleCollection(collection) {
  if (!isRecord(collection) || collection.schemaVersion !== SCHEDULE_SCHEMA_VERSION || !Array.isArray(collection.schedules)) {
    throw new Error("Schedule collection is invalid");
  }
  const validated = {
    alarmJournal: (collection.alarmJournal ?? []).map(validateScheduleAlarmJournalEntry),
    createGeneration: collection.createGeneration,
    schemaVersion: SCHEDULE_SCHEMA_VERSION,
    schedules: collection.schedules.map(validateSchedule)
  };
  if (!Number.isSafeInteger(validated.createGeneration)
    || validated.createGeneration < 0
    || validated.createGeneration >= 1_000_000) throw new Error("Schedule create generation is invalid");
  if (validated.schedules.length > MAX_SCHEDULES) throw new Error(`Schedule storage is full; max ${MAX_SCHEDULES}`);
  if (validated.alarmJournal.length > MAX_SCHEDULES) throw new Error("Schedule alarm journal is full");
  const serialized = JSON.stringify(validated);
  if (new TextEncoder().encode(serialized).byteLength > MAX_SCHEDULE_STORAGE_BYTES) throw new Error("Schedule storage payload is too large");
  try { await chrome.storage.local.set({ [SCHEDULE_STORAGE_KEY]: validated }); }
  catch (error) { throw new Error(`Could not write schedule storage: ${error?.message ?? String(error)}`); }
}

function validateScheduleAlarmJournalEntry(value) {
  if (!isRecord(value)
    || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(["createdAt", "id", "nextSchedule", "operation", "scheduleId"])) {
    throw new Error("Schedule alarm journal entry is invalid");
  }
  const id = requireBoundedWorkflowString(value.id, 100, "schedule alarm journal id");
  const scheduleId = requireBoundedWorkflowString(value.scheduleId, 100, "schedule alarm journal schedule id");
  const createdAt = requireWorkflowTimestamp(value.createdAt, "schedule alarm journal createdAt");
  if (!['delete', 'upsert'].includes(value.operation)) throw new Error("Schedule alarm journal operation is invalid");
  const nextSchedule = value.operation === "delete" && value.nextSchedule === null
    ? null
    : validateSchedule(value.nextSchedule);
  if (value.operation === "upsert" && nextSchedule?.id !== scheduleId) throw new Error("Schedule alarm journal target is invalid");
  return { id, createdAt, operation: value.operation, scheduleId, nextSchedule };
}

function validateSchedule(value) {
  if (!isRecord(value) || value.schemaVersion !== SCHEDULE_SCHEMA_VERSION) throw new Error("Schedule schemaVersion is unsupported");
  const allowed = ["schemaVersion", "id", "name", "workflowId", "requiredCapabilities", "requiredOrigins", "approval", "enabled", "notify", "recurrence", "nextRunAt", "lastScheduledFor", "executionClaim", "history", "createdAt", "updatedAt"];
  const extra = Object.keys(value).filter((field) => !allowed.includes(field));
  if (extra.length > 0) throw new Error(`Schedule contains unsupported fields: ${extra.join(", ")}`);
  const id = requireBoundedWorkflowString(value.id, 100, "schedule id");
  const name = requireBoundedWorkflowString(value.name, MAX_WORKFLOW_NAME_CHARS, "schedule name");
  const workflowId = requireBoundedWorkflowString(value.workflowId, 100, "workflow id");
  if (!Array.isArray(value.requiredCapabilities) || value.requiredCapabilities.length > 100
    || value.requiredCapabilities.some((entry) => typeof entry !== "string" || !/^[a-z][a-z0-9.-]{0,99}$/u.test(entry))) {
    throw new Error("Schedule requiredCapabilities are invalid");
  }
  const requiredCapabilities = [...new Set(value.requiredCapabilities)].sort();
  const requiredOrigins = normalizeScheduleOrigins(value.requiredOrigins);
  const approval = validateScheduleApproval(value.approval);
  if (typeof value.enabled !== "boolean") throw new Error("Schedule enabled flag must be a boolean");
  const notify = validateScheduleNotify(value.notify);
  const recurrence = validateScheduleRecurrence(value.recurrence);
  if (!Number.isSafeInteger(value.nextRunAt) || value.nextRunAt < 0) throw new Error("Schedule nextRunAt is invalid");
  if (value.lastScheduledFor !== null && (!Number.isSafeInteger(value.lastScheduledFor) || value.lastScheduledFor < 0)) throw new Error("Schedule lastScheduledFor is invalid");
  const executionClaim = validateScheduleExecutionClaim(value.executionClaim);
  if (!Array.isArray(value.history) || value.history.length > MAX_SCHEDULE_HISTORY) throw new Error("Schedule history is invalid");
  const history = value.history.map(validateScheduleHistoryEntry);
  const createdAt = requireWorkflowTimestamp(value.createdAt, "schedule createdAt");
  const updatedAt = requireWorkflowTimestamp(value.updatedAt, "schedule updatedAt");
  return { schemaVersion: SCHEDULE_SCHEMA_VERSION, id, name, workflowId, requiredCapabilities, requiredOrigins, approval, enabled: value.enabled, notify, recurrence, nextRunAt: value.nextRunAt, lastScheduledFor: value.lastScheduledFor, executionClaim, history, createdAt, updatedAt };
}

function validateScheduleExecutionClaim(value) {
  if (value === null) return null;
  if (!isRecord(value)
    || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(["executionId", "phase", "scheduledFor", "startedAt"])) {
    throw new Error("Schedule execution claim is invalid");
  }
  const executionId = requireBoundedWorkflowString(value.executionId, 100, "schedule execution id");
  if (!["preflight", "workflow"].includes(value.phase)) throw new Error("Schedule execution phase is invalid");
  if (!Number.isSafeInteger(value.scheduledFor) || value.scheduledFor < 0) throw new Error("Schedule execution occurrence is invalid");
  const startedAt = requireWorkflowTimestamp(value.startedAt, "schedule execution startedAt");
  return { executionId, phase: value.phase, scheduledFor: value.scheduledFor, startedAt };
}

function validateScheduleHistoryEntry(value) {
  if (!isRecord(value) || Object.keys(value).some((field) => !["id", "startedAt", "finishedAt", "trigger", "ok", "error", "executionId", "phase", "status"].includes(field))) {
    throw new Error("Schedule history entry is invalid");
  }
  const id = requireBoundedWorkflowString(value.id, 100, "schedule history id");
  const startedAt = requireWorkflowTimestamp(value.startedAt, "schedule history startedAt");
  const finishedAt = requireWorkflowTimestamp(value.finishedAt, "schedule history finishedAt");
  if (!['alarm', 'manual'].includes(value.trigger) || typeof value.ok !== "boolean") throw new Error("Schedule history status is invalid");
  const error = value.error == null ? undefined : sanitizeScheduleError(value.error);
  const executionId = value.executionId == null ? undefined : requireBoundedWorkflowString(value.executionId, 100, "schedule history execution id");
  const phase = value.phase == null ? undefined : requireBoundedWorkflowString(value.phase, 20, "schedule history phase");
  const status = value.status == null ? undefined : requireBoundedWorkflowString(value.status, 20, "schedule history status");
  return { id, startedAt, finishedAt, trigger: value.trigger, ok: value.ok, ...(error ? { error } : {}), ...(executionId ? { executionId } : {}), ...(phase ? { phase } : {}), ...(status ? { status } : {}) };
}

function validateScheduleRecurrence(value) {
  if (!isRecord(value) || !["daily", "weekly", "monthly", "annual"].includes(value.kind)) throw new Error("Schedule recurrence kind is invalid");
  const allowed = { daily: ["kind", "hour", "minute"], weekly: ["kind", "weekday", "hour", "minute"], monthly: ["kind", "day", "hour", "minute"], annual: ["kind", "month", "day", "hour", "minute"] }[value.kind];
  if (Object.keys(value).some((field) => !allowed.includes(field))) throw new Error("Schedule recurrence contains unsupported fields");
  if (!Number.isInteger(value.hour) || value.hour < 0 || value.hour > 23 || !Number.isInteger(value.minute) || value.minute < 0 || value.minute > 59) throw new Error("Schedule local time is invalid");
  if (value.kind === "weekly" && (!Number.isInteger(value.weekday) || value.weekday < 0 || value.weekday > 6)) throw new Error("Schedule weekday is invalid");
  if (["monthly", "annual"].includes(value.kind) && (!Number.isInteger(value.day) || value.day < 1 || value.day > 31)) throw new Error("Schedule day is invalid");
  if (value.kind === "annual" && (!Number.isInteger(value.month) || value.month < 1 || value.month > 12)) throw new Error("Schedule month is invalid");
  return { ...value };
}

function nextScheduleRunAt(rawRecurrence, afterMs) {
  const recurrence = validateScheduleRecurrence(rawRecurrence);
  if (!Number.isFinite(afterMs)) throw new Error("Schedule recurrence baseline is invalid");
  const after = new Date(afterMs);
  const candidateFor = (year, month, day) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(day, lastDay), recurrence.hour, recurrence.minute, 0, 0).getTime();
  };
  if (recurrence.kind === "daily" || recurrence.kind === "weekly") {
    for (let offset = 0; offset <= 370; offset += 1) {
      const date = new Date(after.getFullYear(), after.getMonth(), after.getDate() + offset);
      if (recurrence.kind === "weekly" && date.getDay() !== recurrence.weekday) continue;
      const candidate = candidateFor(date.getFullYear(), date.getMonth(), date.getDate());
      if (candidate > afterMs) return candidate;
    }
  } else if (recurrence.kind === "monthly") {
    for (let offset = 0; offset <= 24; offset += 1) {
      const month = new Date(after.getFullYear(), after.getMonth() + offset, 1);
      const candidate = candidateFor(month.getFullYear(), month.getMonth(), recurrence.day);
      if (candidate > afterMs) return candidate;
    }
  } else {
    for (let offset = 0; offset <= 200; offset += 1) {
      const candidate = candidateFor(after.getFullYear() + offset, recurrence.month - 1, recurrence.day);
      if (candidate > afterMs) return candidate;
    }
  }
  throw new Error("Could not compute the next schedule occurrence");
}

function normalizeScheduleOrigins(value) {
  if (!Array.isArray(value) || value.length > MAX_WORKFLOW_ORIGINS) throw new Error("Schedule requiredOrigins are invalid");
  return [...new Set(value.map(workflowOrigin))].sort();
}

function validateScheduleNotify(value) {
  if (!["none", "success", "failure", "always"].includes(value)) throw new Error("Schedule notify must be none, success, failure, or always");
  return value;
}

function assertSameStringSet(left, right, message) {
  if (JSON.stringify([...new Set(left)].sort()) !== JSON.stringify([...new Set(right)].sort())) throw new Error(message);
}

function assertScheduleFields(value, allowed, label) {
  if (!isRecord(value)) throw new Error(`${label} params must be an object`);
  const extra = Object.keys(value).filter((field) => !allowed.includes(field));
  if (extra.length > 0) throw new Error(`${label} contains unsupported fields: ${extra.join(", ")}`);
}

function resolveSchedule(collection, params) {
  if (!isRecord(params) || Object.keys(params).some((field) => field !== "id")) throw new Error("Select exactly one schedule by id");
  const id = requireBoundedWorkflowString(params.id, 100, "schedule id");
  const schedule = collection.schedules.find((entry) => entry.id === id);
  if (!schedule) throw new Error(`Schedule ${id} was not found`);
  return schedule;
}

function sanitizeScheduleError(error) {
  const raw = typeof error === "string" ? error : error?.message ?? String(error);
  return truncateString(raw, 500)
    .replace(/https?:\/\/[^\s]+/giu, "[redacted-url]")
    .replace(/(?:token|secret|password|authorization|cookie)\s*[=:]\s*[^\s,;]+/giu, "$1=[redacted]")
    .replace(/[\u0000-\u001f\u007f]/gu, " ")
    .trim();
}

async function notifyScheduleResult(schedule, entry) {
  if (schedule.notify === "none" || (entry.ok && schedule.notify === "failure") || (!entry.ok && schedule.notify === "success")) return;
  const title = entry.ok ? "OpenCode schedule completed" : "OpenCode schedule failed";
  const message = entry.ok ? `${schedule.name} completed.` : `${schedule.name} failed. Open schedule history for details.`;
  await createNotification({ title, message }).catch(() => {});
}

async function executeScopedPageCommand(envelope, options) {
  if (!isRecord(envelope) || !ORIGIN_SCOPED_COMMANDS.has(envelope.method) || !isRecord(envelope.params)) {
    throw new Error("scoped page command is invalid or not allowed");
  }
  const method = envelope.method;
  const expectedScopes = validateExpectedPageScopes(
    envelope.expectedScopes,
    options.workflowInternal === true ? 101 : method === "workflowRun" ? 100 : 25
  );
  const expectedBindings = validateExpectedPageBindings(envelope.expectedBindings);
  const params = envelope.params;
  let commandOptions = options;
  if (["webMcpList", "webMcpInvoke"].includes(method)) {
    const timeoutMs = strictBatchInteger(
      params.timeoutMs, MIN_WEBMCP_TIMEOUT_MS, MAX_WEBMCP_TIMEOUT_MS,
      DEFAULT_WEBMCP_TIMEOUT_MS, "WebMCP timeoutMs"
    );
    const webMcpDeadlineEpochMs = Date.now() + timeoutMs;
    const deadlineSignal = AbortSignal.timeout(timeoutMs);
    commandOptions = {
      ...options,
      signal: options.signal ? AbortSignal.any([options.signal, deadlineSignal]) : deadlineSignal,
      webMcpDeadlineEpochMs,
      webMcpExternalSignal: options.signal ?? null
    };
  }
  if (method === "workflowRun") {
    return executeCommand(method, params, {
      ...options, workflowExpectedBindings: expectedBindings,
      workflowExpectedScopes: expectedScopes, workflowInternal: true
    });
  }
  if (method === "evaluate" || (method === "cdpCommand" && params.method === "Runtime.evaluate")) {
    params.__expectedScopes = expectedScopes;
  }
  if (method === "fileUploadCommit") params.__expectedScopes = expectedScopes;
  if (method === "fileUploadCommit") params.__expectedBindings = expectedBindings;
  if (method === "setCursorState" || method === "setFaviconBadge") params.__expectedScopes = expectedScopes;
  if (method === "setCursorState" || method === "setFaviconBadge") params.__expectedBindings = expectedBindings;
  const expectedTabBinding = Number.isInteger(params.tabId)
    ? expectedBindings.find((entry) => entry.tabId === params.tabId)
    : undefined;
  if (expectedTabBinding && ["fileUploadCommit", "setCursorState", "setFaviconBadge"].includes(method)) {
    params.__expectedDocumentId = expectedTabBinding.documentId;
  }
  const rawPageGuard = createPageGuard(method, params, expectedScopes, expectedBindings);
  const pageGuard = (...args) => abortableChromeOperation(rawPageGuard(...args), commandOptions.signal);
  if (method === "browserBatch") {
    if (!Array.isArray(params.actions) || params.actions.length !== 1) {
      throw new Error("origin-scoped browser batches must contain exactly one action");
    }
    const action = params.actions[0];
    if (action?.type === "navigate") {
      assertAuthorizedDestination(action.params?.url, expectedScopes);
      return executeCommand(method, params, { ...options, workflowInternal: true });
    }
    const tabId = action?.params?.tabId;
    if (!Number.isInteger(tabId)) throw new Error("origin-scoped batch action requires a deterministic tabId");
    const actionPageGuard = (override = action.params, result) => pageGuard(override, result);
    const runBatch = async () => {
      await actionPageGuard();
      const batchResult = await executeCommand(method, params, { ...options, pageGuard: actionPageGuard, workflowInternal: true });
      await actionPageGuard();
      return batchResult;
    };
    if (!NAVIGATION_BARRIER_BATCH_ACTIONS.has(action?.type)) return runBatch();
    const batchResult = await withScopedNavigationBarrier(
      tabId, actionPageGuard, runBatch, options.signal
    );
    await actionPageGuard();
    return batchResult;
  }
  if (method === "cdpCommand" && !ALLOWED_RAW_PAGE_CDP_METHODS.has(params.method)) {
    throw new Error(`CDP method ${String(params.method)} is not allowed; use a dedicated high-level browser tool`);
  }
  if (method === "subscribeCdpEvents"
    && Array.isArray(params.methods)
    && params.methods.some((entry) => typeof entry === "string" && entry.startsWith("Fetch."))) {
    throw new Error("Fetch-domain CDP subscriptions are not allowed because navigation requests require exclusive barrier ownership");
  }
  if (method === "cdpCommand" && params.method === "Page.navigate") {
    assertAuthorizedDestination(params.commandParams?.url, expectedScopes);
  } else if (method === "navigate") {
    assertAuthorizedDestination(params.url, expectedScopes);
  } else {
    await pageGuard(params);
  }
  let result;
  try {
    const persistentMutation = NAVIGATION_BARRIER_PERSISTENT_COMMANDS.has(method);
    const run = async () => {
      const value = await executeCommand(method, params, { ...commandOptions, pageGuard, workflowInternal: true });
      if (persistentMutation) await pageGuard(params, value);
      return value;
    };
    const barrierTabId = Number.isInteger(params.tabId) ? params.tabId : null;
    result = barrierTabId !== null
      && NAVIGATION_BARRIER_COMMANDS.has(method)
      && !(method === "cdpCommand" && params.method === "Page.navigate")
      ? await withScopedNavigationBarrier(barrierTabId, pageGuard, run, commandOptions.signal, { persistentMutation })
      : await run();
  } catch (error) {
    if (method !== "click" || error?.authorizedPageEffect !== true) throw error;
    const transition = await currentPageBindingForCommand(method, params);
    if (!transition || pageBindingMatches(transition, expectedBindings, expectedScopes)) throw error;
    return { clicked: true, transition };
  }
  if (method !== "closeTab") {
    const after = await currentPageBindingForCommand(method, params, result);
    if (method === "click" && after && !pageBindingMatches(after, expectedBindings, expectedScopes)) {
      return { ...result, transition: after };
    }
    if (method !== "navigate"
      && (!(["webMcpList", "webMcpInvoke"].includes(method)) || !commandOptions.signal?.aborted)) {
      await pageGuard(params, result);
    }
  }
  return result;
}

function validateExpectedPageBindings(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry) => isRecord(entry)
    && Number.isInteger(entry.tabId)
    && typeof entry.documentId === "string"
    && Number.isInteger(entry.navigationGeneration))
    .map((entry) => ({
      documentId: entry.documentId,
      navigationGeneration: entry.navigationGeneration,
      pageScope: canonicalPermissionScope(entry.pageScope),
      tabId: entry.tabId
    }));
}

function createPageGuard(method, params, expectedScopes, expectedBindings) {
  return async (override = params, result) => {
    const current = await currentPageBindingForCommand(method, override, result);
    if (!current || !pageBindingMatches(current, expectedBindings, expectedScopes)) {
      throw new Error(`Page scope or document changed and is not authorized: ${current?.pageScope ?? "unknown"}`);
    }
    return current;
  };
}

function pageBindingMatches(current, expectedBindings, expectedScopes) {
  if (!expectedScopes.includes(current.pageScope)) return false;
  const expected = expectedBindings.find((entry) => entry.tabId === current.tabId);
  return Boolean(expected
    && expected.documentId === current.documentId
    && expected.navigationGeneration === current.navigationGeneration
    && expected.pageScope === current.pageScope);
}

async function currentPageBindingForCommand(method, params, result) {
  const tabId = Number.isInteger(params?.tabId) ? params.tabId : Number.isInteger(result?.tabId) ? result.tabId : null;
  if (tabId === null) return null;
  const tab = await chrome.tabs.get(tabId);
  return currentPageBinding(tabId, tab.url);
}

async function currentPageBinding(tabId, knownUrl) {
  let documentId;
  if (typeof chrome.webNavigation?.getFrame === "function") {
    try { documentId = (await chrome.webNavigation.getFrame({ tabId, frameId: 0 }))?.documentId; } catch {}
  }
  const navigationGeneration = navigationSequences.get(tabId) ?? 0;
  return {
    documentId: typeof documentId === "string" ? documentId : `generation:${navigationGeneration}`,
    navigationGeneration,
    pageScope: canonicalPermissionScope(knownUrl ?? (await chrome.tabs.get(tabId)).url),
    tabId
  };
}

function validateExpectedPageScopes(value, maxScopes = 25) {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxScopes) {
    throw new Error("scoped page command expectedScopes must be a bounded non-empty array");
  }
  return [...new Set(value.map(canonicalPermissionScope))].sort();
}

async function currentCommandPageScope(method, params, result) {
  if (Number.isInteger(params.tabId)) {
    const tab = await chrome.tabs.get(params.tabId);
    return canonicalPermissionScope(tab.url);
  }
  if (method === "cdpCommand" && typeof params.targetId === "string") {
    const target = (await chrome.debugger.getTargets()).find((entry) => entry.id === params.targetId);
    if (!target || typeof target.url !== "string") throw new Error("CDP target page scope cannot be resolved");
    return canonicalPermissionScope(target.url);
  }
  if (Number.isInteger(result?.tabId)) {
    const tab = await chrome.tabs.get(result.tabId);
    return canonicalPermissionScope(tab.url);
  }
  throw new Error(`${method} requires a deterministic tab for origin-scoped execution`);
}

function assertAuthorizedDestination(value, expectedScopes) {
  const destination = canonicalPermissionScope(value);
  assertExpectedScopeAuthorized(destination, expectedScopes);
}

function assertExpectedScopeAuthorized(actualScope, expectedScopes) {
  if (!expectedScopes.includes(actualScope)) {
    throw new Error(`Page scope changed or is not authorized: ${actualScope}`);
  }
}

function canonicalPermissionScope(value) {
  if (typeof value !== "string") throw new Error("Page scope must be a string URL");
  if (hasAmbiguousPermissionEncoding(value)) {
    throw new Error("Page scope contains an ambiguous encoded separator or traversal");
  }
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error("Page scope must be an absolute http or https URL"); }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Page scope supports only http and https URLs");
  }
  const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
  const pathname = (parsed.pathname || "/").replace(/%([0-9a-fA-F]{2})/gu, (encoded, hex) => {
    const character = String.fromCharCode(Number.parseInt(hex, 16));
    return /[A-Za-z0-9._~-]/u.test(character) ? character : `%${hex.toUpperCase()}`;
  });
  return `${parsed.protocol}//${parsed.hostname}:${port}${pathname}`;
}

function hasAmbiguousPermissionEncoding(value) {
  const pathPart = value.split(/[?#]/u, 1)[0];
  return /\\|%(?:2f|5c|2e|25)/iu.test(pathPart);
}

function tabInfo(tab) {
  return {
    active: tab.active === true,
    id: tab.id,
    index: tab.index,
    title: tab.title,
    url: tab.url,
    windowId: tab.windowId
  };
}

function requireTabId(params) {
  if (!Number.isInteger(params.tabId)) throw new Error("tabId must be an integer");
  return params.tabId;
}

async function listWebMcpTools(params, signal, pageGuard, deadlineEpochMs) {
  assertWebMcpFields(params, ["tabId", "timeoutMs"], "WebMCP list");
  const tabId = requireTabId(params);
  const timeoutMs = strictBatchInteger(
    params.timeoutMs, MIN_WEBMCP_TIMEOUT_MS, MAX_WEBMCP_TIMEOUT_MS,
    DEFAULT_WEBMCP_TIMEOUT_MS, "WebMCP timeoutMs"
  );
  if (!Number.isFinite(deadlineEpochMs)) throw new Error("WebMCP deadline is unavailable");
  const documentId = await requireWebMcpDocumentBinding(pageGuard, params);
  const abortChannel = `opencode-webmcp-abort-${crypto.randomUUID()}`;
  const envelope = await runWebMcpIsolatedAdapter(tabId, documentId, "list", { abortChannel, deadlineEpochMs, timeoutMs }, signal);
  if (envelope.supported === false) {
    if (!["WEBMCP_UNSUPPORTED", "WEBMCP_DISCOVERY_UNSUPPORTED", "WEBMCP_DISCOVERY_TIMEOUT"].includes(envelope.error?.code)) {
      throw new Error(`WebMCP metadata is invalid: ${sanitizeWebMcpError(envelope.error?.message)}`);
    }
    return {
      error: validateWebMcpError(envelope.error),
      source: null,
      supported: false,
      tools: []
    };
  }
  if (envelope.supported !== true || !["document", "navigator"].includes(envelope.source)) {
    throw new Error("WebMCP metadata response is invalid");
  }
  return {
    source: envelope.source,
    supported: true,
    tools: validateWebMcpTools(envelope.tools)
  };
}

async function invokeWebMcpTool(params, signal, pageGuard, deadlineEpochMs) {
  assertWebMcpFields(params, ["input", "tabId", "timeoutMs", "toolName"], "WebMCP invoke");
  const tabId = requireTabId(params);
  const toolName = requireWebMcpToolName(params.toolName);
  const timeoutMs = strictBatchInteger(
    params.timeoutMs, MIN_WEBMCP_TIMEOUT_MS, MAX_WEBMCP_TIMEOUT_MS,
    DEFAULT_WEBMCP_TIMEOUT_MS, "WebMCP timeoutMs"
  );
  if (!Number.isFinite(deadlineEpochMs)) throw new Error("WebMCP deadline is unavailable");
  const input = cloneBoundedWebMcpJson(
    Object.hasOwn(params, "input") ? params.input : {},
    "WebMCP input",
    MAX_WEBMCP_INPUT_BYTES
  );
  const inputJson = JSON.stringify(input);
  const documentId = await requireWebMcpDocumentBinding(pageGuard, params);
  const abortChannel = `opencode-webmcp-abort-${crypto.randomUUID()}`;
  const webMcpPrepareToken = crypto.randomUUID();
  let preparationIssued = false;
  let committed = false;
  let extensionCommitTracked = false;
  let envelope;
  try {
    preparationIssued = true;
    const preparation = await runWebMcpIsolatedAdapter(tabId, documentId, "prepare", {
      abortChannel, deadlineEpochMs, registryLimit: WEBMCP_PREPARED_REGISTRY_LIMIT,
      timeoutMs, token: webMcpPrepareToken, ttlMs: WEBMCP_PREPARED_TTL_MS, toolName
    }, signal);
    if (preparation?.prepared !== true || preparation.toolName !== toolName
      || preparation.tool?.name !== toolName
      || !["document", "navigator"].includes(preparation.source)) {
      envelope = preparation;
    } else {
      await pageGuard(params);
      throwIfAborted(signal);
      if (Date.now() >= deadlineEpochMs) {
        envelope = webMcpInvocationError("WEBMCP_TIMEOUT", "WebMCP admission deadline expired before dispatch", true);
      } else if (activeCommittedWebMcpInvokes.size >= MAX_COMMITTED_WEBMCP_INVOKES) {
        envelope = webMcpInvocationError("WEBMCP_TOOL_ERROR", "Too many committed WebMCP invocations", true);
      } else {
        // This assignment and the executeScript issue inside runWebMcpIsolatedAdapter
        // are synchronous: cancellation observed afterwards is post-commit.
        committed = true;
        activeCommittedWebMcpInvokes.add(webMcpPrepareToken);
        extensionCommitTracked = true;
        envelope = await runWebMcpIsolatedAdapter(tabId, documentId, "commit", {
          abortChannel, deadlineEpochMs, inputJson, registryLimit: WEBMCP_PREPARED_REGISTRY_LIMIT,
          timeoutMs, token: webMcpPrepareToken, ttlMs: WEBMCP_PREPARED_TTL_MS, toolName
        }, null);
      }
    }
  } finally {
    if (extensionCommitTracked) activeCommittedWebMcpInvokes.delete(webMcpPrepareToken);
    if (preparationIssued && !committed) {
      await runWebMcpIsolatedAdapter(tabId, documentId, "cleanup", {
        abortChannel, deadlineEpochMs, registryLimit: WEBMCP_PREPARED_REGISTRY_LIMIT,
        timeoutMs, token: webMcpPrepareToken, ttlMs: WEBMCP_PREPARED_TTL_MS, toolName
      }, null).catch(() => {});
    }
  }
  if (!isRecord(envelope)) throw new Error("WebMCP invocation response is invalid");
  if (envelope.ok === false) {
    const error = validateWebMcpError(envelope.error);
    if (!["WEBMCP_UNSUPPORTED", "WEBMCP_DISCOVERY_UNSUPPORTED", "WEBMCP_INVOCATION_UNSUPPORTED",
      "WEBMCP_TOOL_NOT_FOUND", "WEBMCP_TOOL_ERROR", "WEBMCP_TIMEOUT",
      "WEBMCP_DISCOVERY_TIMEOUT",
      "WEBMCP_OUTPUT_INVALID", "WEBMCP_OUTPUT_TOO_LARGE"].includes(error.code)) {
      throw new Error("WebMCP invocation returned an invalid error code");
    }
    return {
      error,
      ok: false,
      source: ["document", "navigator"].includes(envelope.source) ? envelope.source : null,
      supported: envelope.supported === true,
      toolName
    };
  }
  if (envelope.ok !== true || envelope.supported !== true
    || !["document", "navigator"].includes(envelope.source)
    || envelope.invocation !== "executeTool"
    || envelope.toolName !== toolName) {
    throw new Error("WebMCP invocation response is invalid");
  }
  return {
    invocation: envelope.invocation,
    ok: true,
    result: cloneBoundedWebMcpJson(envelope.result, "WebMCP output", MAX_WEBMCP_OUTPUT_BYTES),
    source: envelope.source,
    supported: true,
    toolName
  };
}

async function requireWebMcpDocumentBinding(pageGuard, params) {
  if (typeof pageGuard !== "function") throw new Error("WebMCP requires an exact approved document binding");
  const binding = await pageGuard(params);
  if (!isRecord(binding) || typeof binding.documentId !== "string" || binding.documentId.length === 0) {
    throw new Error("WebMCP exact approved document binding is unavailable");
  }
  return binding.documentId;
}

async function runWebMcpIsolatedAdapter(tabId, documentId, operation, payload, signal) {
  throwIfAborted(signal);
  const target = { documentIds: [documentId], tabId };
  const execution = chrome.scripting.executeScript({
    args: [operation, payload],
    func: webMcpIsolatedAdapter,
    target,
    world: "ISOLATED"
  });
  let abortExecution = null;
  let aborted = false;
  const abortInvocation = () => {
    if (aborted) return;
    aborted = true;
    abortExecution = chrome.scripting.executeScript({
      args: [payload.abortChannel],
      func: webMcpAbortAdapter,
      target,
      world: "ISOLATED"
    }).catch(() => []);
  };
  signal?.addEventListener("abort", abortInvocation, { once: true });
  let results;
  try {
    results = await execution;
  } catch (error) {
    if (aborted) {
      await abortExecution;
      throwIfAborted(signal);
    }
    const message = error?.message ?? String(error);
    if (/document|frame|navigation|tab.*closed|not found/iu.test(message)) {
      throw new Error("WebMCP exact approved document changed before isolated-world dispatch");
    }
    return operation === "list"
      ? webMcpUnsupportedList("The page or browser does not expose an executable isolated-world WebMCP context")
      : webMcpInvocationError("WEBMCP_UNSUPPORTED", "The page or browser does not expose an executable isolated-world WebMCP context", false);
  } finally {
    signal?.removeEventListener("abort", abortInvocation);
  }
  if (aborted) await abortExecution;
  if (!Array.isArray(results) || results.length !== 1 || typeof results[0]?.result !== "string") {
    throwIfAborted(signal);
    throw new Error("WebMCP isolated-world adapter returned an invalid envelope");
  }
  const serialized = results[0].result;
  if (new TextEncoder().encode(serialized).byteLength > MAX_WEBMCP_ENVELOPE_BYTES) {
    if (operation === "invoke") {
      return webMcpInvocationError("WEBMCP_OUTPUT_TOO_LARGE", "WebMCP output exceeded the bounded response size", true);
    }
    throw new Error("WebMCP metadata response is too large");
  }
  let envelope;
  try {
    envelope = JSON.parse(serialized);
  } catch {
    throw new Error("WebMCP isolated-world adapter returned invalid JSON");
  }
  if (aborted && envelope?.committed !== true) throwIfAborted(signal);
  return envelope;
}

function webMcpAbortAdapter(abortChannel) {
  try {
    if (typeof abortChannel !== "string") return false;
    globalThis.dispatchEvent(new Event(abortChannel));
    return true;
  } catch {
    return false;
  }
}

// This function is serialized by chrome.scripting and executes once in Chrome's
// trusted extension ISOLATED world. Keep every dependency local and return only
// a JSON string so WebMCP descriptors never leave the injected call.
async function webMcpIsolatedAdapter(operation, payload) {
  const unsupported = operation === "list"
    ? "{\"error\":{\"code\":\"WEBMCP_UNSUPPORTED\",\"message\":\"The isolated document does not expose WebMCP\"},\"source\":null,\"supported\":false,\"tools\":[]}"
    : "{\"error\":{\"code\":\"WEBMCP_UNSUPPORTED\",\"message\":\"The isolated document does not expose WebMCP\"},\"ok\":false,\"source\":null,\"supported\":false}";
  try {
    const clean = globalThis;
    const SafeObject = clean.Object;
    const SafeArray = clean.Array;
    const SafeNumber = clean.Number;
    const SafeString = clean.String;
    const SafePromise = clean.Promise;
    const SafeSet = clean.Set;
    const SafeMap = clean.Map;
    const SafeAbortController = clean.AbortController;
    const objectCreate = SafeObject.create;
    const getOwnPropertyDescriptor = SafeObject.getOwnPropertyDescriptor;
    const getPrototypeOf = SafeObject.getPrototypeOf;
    const arrayIsArray = SafeArray.isArray;
    const numberIsFinite = SafeNumber.isFinite;
    const reflectApply = clean.Reflect.apply;
    const reflectOwnKeys = clean.Reflect.ownKeys;
    const regexpTest = clean.RegExp.prototype.test;
    const setAdd = SafeSet.prototype.add;
    const setDelete = SafeSet.prototype.delete;
    const setForEach = SafeSet.prototype.forEach;
    const setHas = SafeSet.prototype.has;
    const mapDelete = SafeMap.prototype.delete;
    const mapEntries = SafeMap.prototype.entries;
    const mapGet = SafeMap.prototype.get;
    const mapSet = SafeMap.prototype.set;
    const stringCharCodeAt = SafeString.prototype.charCodeAt;
    const stringIncludes = SafeString.prototype.includes;
    const stringSlice = SafeString.prototype.slice;
    const addEventListener = clean.EventTarget.prototype.addEventListener;
    const removeEventListener = clean.EventTarget.prototype.removeEventListener;
    const safeSetTimeout = clean.setTimeout;
    const safeClearTimeout = clean.clearTimeout;
    const safeJsonStringify = clean.JSON.stringify;
    const safeDateNow = clean.Date.now;
    const symbolFor = clean.Symbol.for;
    const objectPrototype = SafeObject.prototype;
    const timers = new SafeSet();
    const maxEnvelopeBytes = 768 * 1024;
    const dangerousKeys = new SafeSet(["__proto__", "constructor", "prototype"]);
    const controller = new SafeAbortController();
    let committed = false;
    let preDispatchAborted = false;
    let abortResolve;
    const abortPromise = new SafePromise((resolve) => { abortResolve = resolve; });
    const onAbort = () => {
      if (committed) return;
      preDispatchAborted = true;
      abortResolve({ kind: "abort" });
    };
    if (!payload || typeof payload !== "object" || typeof payload.abortChannel !== "string"
      || typeof payload.timeoutMs !== "number" || typeof payload.deadlineEpochMs !== "number") return unsupported;
    const remainingMs = () => Math.max(0, Math.min(payload.timeoutMs,
      payload.deadlineEpochMs - reflectApply(safeDateNow, clean.Date, [])));
    reflectApply(addEventListener, globalThis, [payload.abortChannel, onAbort]);

    const utf8Bytes = (text, jsonString = false) => {
      let bytes = 0;
      for (let index = 0; index < text.length; index += 1) {
        const code = reflectApply(stringCharCodeAt, text, [index]);
        if (jsonString && (code === 34 || code === 92 || code === 8 || code === 9
          || code === 10 || code === 12 || code === 13)) bytes += 2;
        else if (jsonString && code < 32) bytes += 6;
        else if (code < 0x80) bytes += 1;
        else if (code < 0x800) bytes += 2;
        else if (code >= 0xd800 && code <= 0xdbff && index + 1 < text.length) {
          const next = reflectApply(stringCharCodeAt, text, [index + 1]);
          if (next >= 0xdc00 && next <= 0xdfff) { bytes += 4; index += 1; } else bytes += 3;
        } else bytes += 3;
      }
      return bytes;
    };
    const isPlainRecord = (value) => {
      const prototype = getPrototypeOf(value);
      if (prototype === null || prototype === objectPrototype) return true;
      if (getPrototypeOf(prototype) !== null) return false;
      const descriptor = getOwnPropertyDescriptor(prototype, "constructor");
      return Boolean(descriptor && "value" in descriptor && typeof descriptor.value === "function"
        && descriptor.value.name === "Object");
    };
    const cloneJson = (value, label, maxBytes, sharedBudget = null) => {
      const ancestors = new SafeSet();
      let nodes = 0;
      let bytes = 0;
      const spend = (count) => {
        bytes += count;
        if (bytes > maxBytes) throw new clean.Error(`${label} is too large`);
        if (sharedBudget) {
          sharedBudget.bytes += count;
          if (sharedBudget.bytes > sharedBudget.maxBytes) throw new clean.Error("WebMCP metadata exceeds the total byte budget");
        }
      };
      const visit = (current, depth) => {
        nodes += 1;
        if (nodes > 5_000 || depth > 20) throw new clean.Error(`${label} is not bounded JSON`);
        if (current === null) { spend(4); return null; }
        if (typeof current === "string") { spend(utf8Bytes(current, true) + 2); return current; }
        if (typeof current === "boolean") { spend(5); return current; }
        if (typeof current === "number") {
          if (!numberIsFinite(current)) throw new clean.Error(`${label} contains a non-finite number`);
          spend(24); return current;
        }
        if (typeof current !== "object") throw new clean.Error(`${label} contains a non-JSON value`);
        if (reflectApply(setHas, ancestors, [current])) throw new clean.Error(`${label} contains a cycle`);
        reflectApply(setAdd, ancestors, [current]);
        let copy;
        if (arrayIsArray(current)) {
          copy = [];
          spend(2 + current.length);
          const keys = reflectOwnKeys(current);
          for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
            const key = keys[keyIndex];
            if (key === "length") continue;
            if (typeof key !== "string" || !reflectApply(regexpTest, /^(?:0|[1-9][0-9]*)$/u, [key])
              || SafeNumber(key) >= current.length) throw new clean.Error(`${label} contains an ambiguous array key`);
            const descriptor = getOwnPropertyDescriptor(current, key);
            if (!descriptor?.enumerable || !("value" in descriptor)) throw new clean.Error(`${label} contains an accessor or hidden array value`);
          }
          for (let index = 0; index < current.length; index += 1) {
            const descriptor = getOwnPropertyDescriptor(current, SafeString(index));
            if (!descriptor || !("value" in descriptor)) throw new clean.Error(`${label} contains an accessor or sparse array`);
            copy[index] = visit(descriptor.value, depth + 1);
          }
        } else {
          if (!isPlainRecord(current)) throw new clean.Error(`${label} must contain only plain records`);
          copy = objectCreate(null);
          const keys = reflectOwnKeys(current);
          spend(2 + keys.length);
          for (let index = 0; index < keys.length; index += 1) {
            const key = keys[index];
            if (typeof key !== "string") throw new clean.Error(`${label} contains a symbol key`);
            if (key.length > 1_000 || reflectApply(setHas, dangerousKeys, [key])) throw new clean.Error(`${label} contains an ambiguous key`);
            const descriptor = getOwnPropertyDescriptor(current, key);
            if (!descriptor?.enumerable || !("value" in descriptor)) throw new clean.Error(`${label} contains an accessor or hidden value`);
            spend(utf8Bytes(key, true) + 3);
            copy[key] = visit(descriptor.value, depth + 1);
          }
        }
        reflectApply(setDelete, ancestors, [current]);
        return copy;
      };
      return visit(value, 0);
    };
    const safeMessage = (message) => reflectApply(stringSlice, SafeString(message || "WebMCP error"), [0, 500]);
    const errorEnvelope = (code, message, supported, source = null, wasCommitted = false) => ({
      ...(wasCommitted ? { committed: true } : {}),
      error: { code, message: safeMessage(message) }, ok: false, source, supported
    });
    const serialize = (value) => {
      try {
        const encoded = reflectApply(safeJsonStringify, clean.JSON, [value]);
        if (utf8Bytes(encoded) > maxEnvelopeBytes) throw new clean.Error("envelope too large");
        return encoded;
      } catch {
        return "{\"ok\":false,\"supported\":false,\"source\":null,\"error\":{\"code\":\"WEBMCP_OUTPUT_INVALID\",\"message\":\"WebMCP adapter could not serialize its result\"}}";
      }
    };
    const delay = (milliseconds, kind) => new SafePromise((resolve) => {
      const timer = safeSetTimeout(() => {
        reflectApply(setDelete, timers, [timer]);
        resolve({ kind });
      }, milliseconds);
      reflectApply(setAdd, timers, [timer]);
    });
    const settle = (promise) => reflectApply(SafePromise.prototype.then, promise, [
      (value) => ({ kind: "fulfilled", value }),
      (error) => ({ error, kind: "rejected" })
    ]);

    try {
      const registrySymbol = reflectApply(symbolFor, clean.Symbol, ["opencode.webmcp.prepared.v1"]);
      let registry = globalThis[registrySymbol];
      if (!(registry instanceof SafeMap)) {
        registry = new SafeMap();
        SafeObject.defineProperty(globalThis, registrySymbol, { configurable: false, enumerable: false, value: registry });
      }
      const validRegistryConfig = Number.isInteger(payload.registryLimit) && payload.registryLimit > 0
        && payload.registryLimit <= 16 && Number.isInteger(payload.ttlMs) && payload.ttlMs >= 1_000 && payload.ttlMs <= 60_000;
      const validToken = typeof payload.token === "string" && /^[0-9a-f-]{36}$/u.test(payload.token);
      if (["prepare", "commit", "cleanup"].includes(operation) && (!validRegistryConfig || !validToken)) {
        return serialize(errorEnvelope("WEBMCP_TOOL_ERROR", "WebMCP prepared invocation token is invalid", true));
      }
      const now = reflectApply(safeDateNow, clean.Date, []);
      for (const [token, entry] of reflectApply(mapEntries, registry, [])) {
        if (!entry || entry.expiresAt <= now) {
          try { safeClearTimeout(entry?.timer); } catch {}
          reflectApply(mapDelete, registry, [token]);
        }
      }
      if (operation === "cleanup") {
        const entry = reflectApply(mapGet, registry, [payload.token]);
        if (entry) try { safeClearTimeout(entry.timer); } catch {}
        reflectApply(mapDelete, registry, [payload.token]);
        return serialize({ cleaned: true, ok: true });
      }
      if (operation === "commit") {
        const entry = reflectApply(mapGet, registry, [payload.token]);
        if (!entry || entry.expiresAt <= now || entry.toolName !== payload.toolName) {
          return serialize(errorEnvelope("WEBMCP_TOOL_ERROR", "WebMCP prepared invocation expired or was not found", true));
        }
        reflectApply(mapDelete, registry, [payload.token]);
        try { safeClearTimeout(entry.timer); } catch {}
        const abortSignalGetter = getOwnPropertyDescriptor(SafeAbortController.prototype, "signal")?.get;
        if (typeof abortSignalGetter !== "function") return unsupported;
        const signal = reflectApply(abortSignalGetter, controller, []);
        committed = true;
        const executionOutcome = await settle(reflectApply(SafePromise.prototype.then, SafePromise.resolve(), [
          () => reflectApply(entry.executeTool, entry.context, [entry.descriptor, payload.inputJson, { signal }])
        ]));
        if (executionOutcome.kind === "rejected") {
          if (executionOutcome.error?.code === "WEBMCP_INVOCATION_UNSUPPORTED") {
            return serialize(errorEnvelope("WEBMCP_INVOCATION_UNSUPPORTED", "The WebMCP context has no supported invocation method", true, entry.source, true));
          }
          return serialize(errorEnvelope("WEBMCP_TOOL_ERROR", executionOutcome.error?.message, true, entry.source, true));
        }
        let result;
        try {
          result = cloneJson(executionOutcome.value, "WebMCP output", 512 * 1024);
        } catch (error) {
          const message = SafeString(error?.message || error);
          return serialize(errorEnvelope(reflectApply(stringIncludes, message, ["too large"]) ? "WEBMCP_OUTPUT_TOO_LARGE" : "WEBMCP_OUTPUT_INVALID", message, true, entry.source, true));
        }
        return serialize({ committed: true, invocation: "executeTool", ok: true, result, source: entry.source,
          supported: true, toolName: entry.toolName });
      }
      const documentContext = typeof document === "object" && document ? document.modelContext : null;
      const navigatorContext = typeof navigator === "object" && navigator ? navigator.modelContext : null;
      const context = documentContext && typeof documentContext === "object"
        ? documentContext : navigatorContext && typeof navigatorContext === "object" ? navigatorContext : null;
      const source = context === documentContext ? "document" : context === navigatorContext ? "navigator" : null;
      if (!context) return serialize(operation === "list"
        ? { error: { code: "WEBMCP_UNSUPPORTED", message: "This page does not expose WebMCP" }, source: null, supported: false, tools: [] }
        : errorEnvelope("WEBMCP_UNSUPPORTED", "This page does not expose WebMCP", false));
      const officialGetTools = context.getTools;
      if (typeof officialGetTools !== "function") return serialize(operation === "list"
        ? { error: { code: "WEBMCP_DISCOVERY_UNSUPPORTED", message: "The WebMCP context has no supported discovery method" }, source: null, supported: false, tools: [] }
        : errorEnvelope("WEBMCP_DISCOVERY_UNSUPPORTED", "The WebMCP context has no supported discovery method", true, source));
      const discoveryBudgetMs = remainingMs();
      if (discoveryBudgetMs <= 0) return serialize(operation === "list"
        ? { error: { code: "WEBMCP_DISCOVERY_TIMEOUT", message: "WebMCP discovery timed out" }, source: null, supported: false, tools: [] }
        : errorEnvelope("WEBMCP_DISCOVERY_TIMEOUT", "WebMCP discovery timed out", true, source));
      const discovery = settle(reflectApply(SafePromise.prototype.then, SafePromise.resolve(), [
        () => reflectApply(officialGetTools, context, [])
      ]));
      const discoveryOutcome = await reflectApply(SafePromise.race, SafePromise, [[
        discovery, delay(discoveryBudgetMs, "discovery-timeout"), abortPromise
      ]]);
      if (discoveryOutcome.kind === "discovery-timeout") {
        return serialize(operation === "list"
          ? { error: { code: "WEBMCP_DISCOVERY_TIMEOUT", message: "WebMCP discovery timed out" }, source: null, supported: false, tools: [] }
          : errorEnvelope("WEBMCP_DISCOVERY_TIMEOUT", "WebMCP discovery timed out", true, source));
      }
      if (discoveryOutcome.kind === "abort") return serialize(errorEnvelope("WEBMCP_TOOL_ERROR", "WebMCP operation was aborted", true, source));
      if (discoveryOutcome.kind === "rejected") {
        if (discoveryOutcome.error?.code === "WEBMCP_DISCOVERY_UNSUPPORTED") return serialize(operation === "list"
          ? { error: { code: "WEBMCP_DISCOVERY_UNSUPPORTED", message: "The WebMCP context has no supported discovery method" }, source: null, supported: false, tools: [] }
          : errorEnvelope("WEBMCP_DISCOVERY_UNSUPPORTED", "The WebMCP context has no supported discovery method", true, source));
        throw discoveryOutcome.error;
      }
      const rawTools = discoveryOutcome.value;
      if (!arrayIsArray(rawTools) || rawTools.length > 100) throw new clean.Error("WebMCP discovery returned an invalid tool list");
      const seen = new SafeSet();
      const entries = [];
      const publicTools = [];
      const metadataBudget = { bytes: 0, maxBytes: maxEnvelopeBytes };
      for (let index = 0; index < rawTools.length; index += 1) {
        const rawDescriptor = getOwnPropertyDescriptor(rawTools, SafeString(index));
        if (!rawDescriptor || !("value" in rawDescriptor)) throw new clean.Error("WebMCP tool list contains an accessor or sparse entry");
        const descriptor = rawDescriptor.value;
        if (!descriptor || typeof descriptor !== "object" || !isPlainRecord(descriptor)) throw new clean.Error("WebMCP tool metadata must be a plain record");
        const nameDescriptor = getOwnPropertyDescriptor(descriptor, "name");
        if (!nameDescriptor || !("value" in nameDescriptor) || typeof nameDescriptor.value !== "string"
          || !reflectApply(regexpTest, /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/u, [nameDescriptor.value])) throw new clean.Error("WebMCP tool name is invalid");
        const name = nameDescriptor.value;
        if (reflectApply(setHas, seen, [name])) throw new clean.Error("WebMCP tool names contain a duplicate");
        reflectApply(setAdd, seen, [name]);
        const descriptionDescriptor = getOwnPropertyDescriptor(descriptor, "description");
        const description = descriptionDescriptor == null ? "" : "value" in descriptionDescriptor ? descriptionDescriptor.value : null;
        if (typeof description !== "string" || description.length > 2_000) throw new clean.Error("WebMCP tool description is invalid or too large");
        metadataBudget.bytes += utf8Bytes(name) + utf8Bytes(description);
        if (metadataBudget.bytes > metadataBudget.maxBytes) throw new clean.Error("WebMCP metadata exceeds the total byte budget");
        const schemaDescriptor = getOwnPropertyDescriptor(descriptor, "inputSchema");
        const schema = schemaDescriptor == null ? objectCreate(null) : "value" in schemaDescriptor ? schemaDescriptor.value : null;
        const publicTool = { description, inputSchema: cloneJson(schema, "WebMCP input schema", 64 * 1024, metadataBudget), name };
        entries[index] = { descriptor, publicTool };
        publicTools[index] = publicTool;
      }
      if (operation === "list") return serialize({ source, supported: true, tools: publicTools });
      if (operation !== "prepare" || typeof payload.toolName !== "string") {
        return serialize(errorEnvelope("WEBMCP_TOOL_ERROR", "WebMCP invocation request is invalid", true, source));
      }
      let selected = null;
      for (let index = 0; index < entries.length; index += 1) {
        if (entries[index].publicTool.name === payload.toolName) selected = selected === null ? entries[index] : false;
      }
      if (!selected) return serialize(errorEnvelope("WEBMCP_TOOL_NOT_FOUND", "The exact WebMCP tool was not found", true, source));
      const descriptor = selected.descriptor;
      const officialExecuteTool = context.executeTool;
      if (typeof officialExecuteTool !== "function") {
        return serialize(errorEnvelope("WEBMCP_INVOCATION_UNSUPPORTED", "The WebMCP context has no supported invocation method", true, source));
      }
      if (preDispatchAborted) return serialize(errorEnvelope("WEBMCP_TOOL_ERROR", "WebMCP operation was aborted", true, source));
      if (remainingMs() <= 0) return serialize(errorEnvelope("WEBMCP_TIMEOUT", "WebMCP admission deadline expired before dispatch", true, source));
      if (registry.size >= payload.registryLimit) {
        return serialize(errorEnvelope("WEBMCP_TOOL_ERROR", "Too many prepared WebMCP invocations", true, source));
      }
      const expiresAt = now + payload.ttlMs;
      const timer = safeSetTimeout(() => { reflectApply(mapDelete, registry, [payload.token]); }, payload.ttlMs);
      try { timer?.unref?.(); } catch {}
      reflectApply(mapSet, registry, [payload.token, {
        context, descriptor, executeTool: officialExecuteTool, expiresAt, source, timer, toolName: payload.toolName
      }]);
      return serialize({ prepared: true, source, supported: true, tool: selected.publicTool, toolName: payload.toolName });
    } catch (error) {
      const message = safeMessage(error?.message || error);
      if (operation === "list") return serialize({ error: { code: "WEBMCP_METADATA_INVALID", message }, source: null, supported: false, tools: [] });
      return serialize(errorEnvelope("WEBMCP_TOOL_ERROR", message, true, null, committed));
    } finally {
      try { reflectApply(setForEach, timers, [(timer) => safeClearTimeout(timer)]); } catch {}
      try { reflectApply(removeEventListener, globalThis, [payload.abortChannel, onAbort]); } catch {}
    }
  } catch {
    return unsupported;
  }
}

function assertWebMcpFields(value, allowed, label) {
  if (!isRecord(value)) throw new Error(`${label} params must be an object`);
  const extra = Object.keys(value).filter((field) => !allowed.includes(field));
  if (extra.length > 0) throw new Error(`${label} contains unsupported fields: ${extra.join(", ")}`);
}

function requireWebMcpToolName(value) {
  if (typeof value !== "string" || value.length > MAX_WEBMCP_NAME_CHARS || !WEBMCP_TOOL_NAME_RE.test(value)) {
    throw new Error("WebMCP toolName must be an exact bounded tool name");
  }
  return value;
}

function cloneBoundedWebMcpJson(value, label, maxBytes) {
  const ancestors = new Set();
  let nodes = 0;
  let characters = 0;
  const spend = (count) => {
    characters += count;
    if (characters > maxBytes) throw new Error(`${label} is too large for the bounded WebMCP bridge`);
  };
  const isPlainRecord = (current) => {
    const prototype = Object.getPrototypeOf(current);
    if (prototype === null || prototype === Object.prototype) return true;
    if (Object.getPrototypeOf(prototype) !== null) return false;
    const constructorDescriptor = Object.getOwnPropertyDescriptor(prototype, "constructor");
    return Boolean(constructorDescriptor && "value" in constructorDescriptor
      && typeof constructorDescriptor.value === "function" && constructorDescriptor.value.name === "Object");
  };
  function visit(current, depth) {
    nodes += 1;
    if (nodes > MAX_WEBMCP_JSON_NODES || depth > MAX_WEBMCP_JSON_DEPTH) throw new Error(`${label} is not bounded JSON`);
    if (current === null) { spend(4); return null; }
    if (typeof current === "string") { spend(current.length + 2); return current; }
    if (typeof current === "boolean") { spend(5); return current; }
    if (typeof current === "number") {
      if (!Number.isFinite(current)) throw new Error(`${label} contains a non-finite number`);
      spend(24); return current;
    }
    if (typeof current !== "object") throw new Error(`${label} contains a value that is not JSON serializable`);
    if (ancestors.has(current)) throw new Error(`${label} contains a cycle and is not JSON serializable`);
    ancestors.add(current);
    let copy;
    if (Array.isArray(current)) {
      copy = [];
      spend(2 + current.length);
      for (const key of Reflect.ownKeys(current)) {
        if (key === "length") continue;
        if (typeof key !== "string" || !/^(?:0|[1-9][0-9]*)$/u.test(key)
          || Number(key) >= current.length) throw new Error(`${label} contains an ambiguous array key`);
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (!descriptor?.enumerable || !("value" in descriptor)) throw new Error(`${label} contains an accessor or hidden array value`);
      }
      for (let index = 0; index < current.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(current, String(index));
        if (!descriptor || !("value" in descriptor)) throw new Error(`${label} contains an accessor or sparse array`);
        copy[index] = visit(descriptor.value, depth + 1);
      }
    }
    else {
      if (!isPlainRecord(current)) throw new Error(`${label} must contain only plain records`);
      copy = Object.create(null);
      const keys = Reflect.ownKeys(current);
      spend(2 + keys.length);
      for (const key of keys) {
        if (typeof key !== "string") throw new Error(`${label} contains a symbol key`);
        if (key.length > MAX_WEBMCP_JSON_KEY_CHARS || ["__proto__", "constructor", "prototype"].includes(key)) {
          throw new Error(`${label} contains an ambiguous key`);
        }
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (!descriptor?.enumerable || !("value" in descriptor)) throw new Error(`${label} contains an accessor or hidden value`);
        spend(key.length + 3);
        copy[key] = visit(descriptor.value, depth + 1);
      }
    }
    ancestors.delete(current);
    return copy;
  }
  const copy = visit(value, 0);
  const serialized = JSON.stringify(copy);
  if (typeof serialized !== "string") throw new Error(`${label} is not JSON serializable`);
  if (new TextEncoder().encode(serialized).byteLength > maxBytes) throw new Error(`${label} is too large for the bounded WebMCP bridge`);
  return JSON.parse(serialized);
}

function validateWebMcpTools(value) {
  if (!Array.isArray(value) || value.length > MAX_WEBMCP_TOOLS) throw new Error("WebMCP tool list is invalid or too large");
  const seen = new Set();
  return value.map((tool) => {
    if (!isRecord(tool) || Object.keys(tool).some((field) => !["description", "inputSchema", "name"].includes(field))) {
      throw new Error("WebMCP tool metadata is invalid");
    }
    const name = requireWebMcpToolName(tool.name);
    if (seen.has(name)) throw new Error("WebMCP tool metadata contains a duplicate name");
    seen.add(name);
    if (typeof tool.description !== "string" || tool.description.length > MAX_WEBMCP_DESCRIPTION_CHARS) {
      throw new Error("WebMCP tool description is invalid or too large");
    }
    return {
      description: tool.description,
      inputSchema: cloneBoundedWebMcpJson(tool.inputSchema, "WebMCP input schema", MAX_WEBMCP_SCHEMA_BYTES),
      name
    };
  });
}

function sanitizeWebMcpError(error) {
  const raw = typeof error === "string" ? error : error?.message ?? String(error ?? "WebMCP error");
  return truncateString(raw, 500)
    .replace(/https?:\/\/[^\s]+/giu, "[redacted-url]")
    .replace(/(?:token|secret|password|authorization|cookie)\s*[=:]\s*[^\s,;]+/giu, "$1=[redacted]")
    .replace(/[\u0000-\u001f\u007f]/gu, " ")
    .trim();
}

function validateWebMcpError(value) {
  if (!isRecord(value) || typeof value.code !== "string" || value.code.length > 100) {
    throw new Error("WebMCP error response is invalid");
  }
  return { code: value.code, message: sanitizeWebMcpError(value.message) };
}

function webMcpUnsupportedList(message) {
  return { error: { code: "WEBMCP_UNSUPPORTED", message }, source: null, supported: false, tools: [] };
}

function webMcpInvocationError(code, message, supported) {
  return { error: { code, message }, ok: false, source: null, supported };
}

async function activateTab(tabId, signal) {
  throwIfAborted(signal);
  const tab = await abortableChromeOperation(chrome.tabs.get(tabId), signal);
  throwIfAborted(signal);
  if (tab.windowId !== undefined) {
    await chrome.windows.update(tab.windowId, { focused: true });
    throwIfAborted(signal);
  }
  const activated = await chrome.tabs.update(tabId, { active: true });
  throwIfAborted(signal);
  return tabInfo(activated);
}

async function navigateTab(params, signal) {
  const tabId = requireTabId(params);
  if (typeof params.url !== "string" || params.url.length === 0) throw new Error("url must be a non-empty string");
  throwIfAborted(signal);
  await assertNavigationAllowed(params.url);
  throwIfAborted(signal);
  validateOptionalLeaseParams(params);
  // Claim before navigating so a tab owned by another session is left untouched.
  await maybeClaimTabFromParams(tabId, params, "user");
  throwIfAborted(signal);
  const navigated = await chrome.tabs.update(tabId, { url: params.url });
  throwIfAborted(signal);
  return tabInfo(navigated);
}

async function tabStillExists(tabId) {
  try {
    await chrome.tabs.get(tabId);
    return true;
  } catch {
    return false;
  }
}

async function captureScreenshot(params, signal, pageGuard) {
  throwIfAborted(signal);
  const tabId = params.tabId == null ? null : requireTabId(params);
  let windowId = params.windowId;
  let targetTab = null;
  if (tabId !== null) {
    targetTab = params.__alreadyActive === true
      ? await abortableChromeOperation(chrome.tabs.get(tabId), signal)
      : await activateTab(tabId, signal);
    throwIfAborted(signal);
    windowId = targetTab.windowId;
  }
  if (!Number.isInteger(windowId)) {
    const current = await abortableChromeOperation(chrome.windows.getCurrent(), signal);
    throwIfAborted(signal);
    windowId = current.id;
  }
  const format = params.format === "jpeg" ? "jpeg" : "png";
  const quality = format === "jpeg" ? clampInteger(params.quality, 1, 100, 80, "quality") : undefined;
  const captureOptions = quality === undefined ? { format } : { format, quality };
  if (targetTab === null) {
    const active = await abortableChromeOperation(chrome.tabs.query({ active: true, windowId }), signal);
    throwIfAborted(signal);
    if (active.length !== 1) throw new Error("Screenshot active tab cannot be resolved deterministically");
    targetTab = active[0];
  }
  await pageGuard?.();
  throwIfAborted(signal);
  const beforeBinding = await abortableChromeOperation(currentPageBinding(targetTab.id, targetTab.url), signal);
  throwIfAborted(signal);
  const activationGeneration = windowActivationGenerations.get(windowId) ?? 0;
  const dataUrl = await abortableChromeOperation(chrome.tabs.captureVisibleTab(windowId, captureOptions), signal);
  throwIfAborted(signal);
  const activeAfter = await abortableChromeOperation(chrome.tabs.query({ active: true, windowId }), signal);
  throwIfAborted(signal);
  const afterBinding = await abortableChromeOperation(currentPageBinding(targetTab.id), signal);
  throwIfAborted(signal);
  if (activeAfter.length !== 1
    || activeAfter[0].id !== targetTab.id
    || (windowActivationGenerations.get(windowId) ?? 0) !== activationGeneration
    || afterBinding.documentId !== beforeBinding.documentId
    || afterBinding.navigationGeneration !== beforeBinding.navigationGeneration) {
    throw new Error("Screenshot discarded because the active tab or document changed during capture");
  }
  await pageGuard?.();
  const separator = typeof dataUrl === "string" ? dataUrl.indexOf(",") : -1;
  if (separator === -1) throw new Error("Chrome did not return a screenshot data URL");
  assertScreenshotPayloadSize(dataUrl.slice(separator + 1));
  return { dataUrl, format };
}

async function captureScreenshotRegion(params, pageGuard) {
  const x = requireFiniteNumber(params.x, "x");
  const y = requireFiniteNumber(params.y, "y");
  const width = requireFiniteNumber(params.width, "width");
  const height = requireFiniteNumber(params.height, "height");
  if (width <= 0 || height <= 0) throw new Error("width and height must be positive numbers");
  if (width > MAX_CAPTURE_DIMENSION || height > MAX_CAPTURE_DIMENSION || width * height > MAX_CAPTURE_AREA) {
    throw new Error(`screenshot region is too large; max dimension ${MAX_CAPTURE_DIMENSION}px and max area ${MAX_CAPTURE_AREA}px`);
  }

  const format = params.format === "png" ? "png" : "jpeg";
  const quality = format === "jpeg" ? clampInteger(params.quality, 1, 100, 80, "quality") : undefined;

  let tabId = params.tabId == null ? null : requireTabId(params);
  let windowId = params.windowId;
  if (tabId !== null) {
    const tab = await activateTab(tabId);
    windowId = tab.windowId;
  }
  if (!Number.isInteger(windowId)) {
    const current = await chrome.windows.getCurrent();
    windowId = current.id;
  }
  if (tabId == null) {
    const tabs = await chrome.tabs.query({ active: true, windowId });
    if (tabs.length === 0) throw new Error("screenshotRegion requires an active tab in the target window");
    tabId = tabs[0].id;
  }
  await pageGuard?.();
  const beforeTab = await chrome.tabs.get(tabId);
  const beforeBinding = await currentPageBinding(tabId, beforeTab.url);
  const activationGeneration = windowActivationGenerations.get(windowId) ?? 0;

  const captureParams = {
    format,
    clip: { x, y, width, height, scale: 1 },
    captureBeyondViewport: true
  };
  if (quality !== undefined) captureParams.quality = quality;

  const data = await withDebugger(tabId, async (target) => {
    await pageGuard?.();
    const result = await chrome.debugger.sendCommand(target, "Page.captureScreenshot", captureParams);
    return result.data;
  });
  const activeAfter = await chrome.tabs.query({ active: true, windowId });
  const afterBinding = await currentPageBinding(tabId);
  if (activeAfter.length !== 1
    || activeAfter[0].id !== tabId
    || (windowActivationGenerations.get(windowId) ?? 0) !== activationGeneration
    || afterBinding.documentId !== beforeBinding.documentId
    || afterBinding.navigationGeneration !== beforeBinding.navigationGeneration) {
    throw new Error("Screenshot region discarded because the active tab or document changed during capture");
  }
  await pageGuard?.();
  assertScreenshotPayloadSize(data);

  const dataUrl = `data:image/${format};base64,${data}`;
  return { dataUrl, format, region: { x, y, width, height } };
}

async function printPdf(params, pageGuard) {
  const tabId = requireTabId(params);
  const landscape = params.landscape === true;
  const displayHeaderFooter = params.displayHeaderFooter !== false;
  const printBackground = params.printBackground !== false;
  let scale = 1;
  if (params.scale !== undefined) {
    scale = requireFiniteNumber(params.scale, "scale");
    if (!(scale >= 0.1 && scale <= 2)) throw new Error("scale must be between 0.1 and 2");
  }
  await pageGuard?.();
  const beforeTab = await chrome.tabs.get(tabId);
  const beforeBinding = await currentPageBinding(tabId, beforeTab.url);
  const data = await withDebugger(tabId, async (target) => {
    await pageGuard?.();
    const result = await chrome.debugger.sendCommand(target, "Page.printToPDF", {
      landscape,
      displayHeaderFooter,
      printBackground,
      scale,
      preferCSSPageSize: true
    });
    if (typeof result?.data !== "string" || result.data.length === 0) {
      throw new Error("Chrome did not return PDF data");
    }
    return result.data;
  });
  const afterBinding = await currentPageBinding(tabId);
  if (afterBinding.documentId !== beforeBinding.documentId
    || afterBinding.navigationGeneration !== beforeBinding.navigationGeneration) {
    throw new Error("Print to PDF discarded because the document changed during capture");
  }
  await pageGuard?.();
  assertPdfPayloadSize(data);
  return { dataUrl: `data:application/pdf;base64,${data}`, format: "pdf" };
}

function assertPdfPayloadSize(base64Data) {
  if (typeof base64Data !== "string" || base64Data.length > MAX_PDF_BASE64_CHARS) {
    throw new Error("PDF response is too large for the local bridge");
  }
}

function assertScreenshotPayloadSize(base64Data) {
  if (typeof base64Data !== "string" || base64Data.length > MAX_SCREENSHOT_BASE64_CHARS) {
    throw new Error("screenshot response is too large for the local bridge");
  }
}

async function dispatchClick(params, signal, pageGuard) {
  const tabId = requireTabId(params);
  const x = requireFiniteNumber(params.x, "x");
  const y = requireFiniteNumber(params.y, "y");
  const button = requireButton(params.button);
  const modifiers = resolveModifiers(params.modifiers);
  throwIfAborted(signal);
  await pageGuard?.();
  await withOverlayInputPassThrough(tabId, { x, y }, async () => {
    await withDebugger(tabId, async (target) => {
      throwIfAborted(signal);
      await pageGuard?.();
      await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", { type: "mouseMoved", x, y, modifiers });
      throwIfAborted(signal);
      await dispatchMousePressAndRelease(target, { button, clickCount: 1, modifiers, x, y }, pageGuard);
    });
  }, signal, pageGuard);
  throwIfAborted(signal);
  return { clicked: true };
}

async function dispatchDoubleClick(params, pageGuard) {
  const tabId = requireTabId(params);
  const x = requireFiniteNumber(params.x, "x");
  const y = requireFiniteNumber(params.y, "y");
  const button = requireButton(params.button);
  const modifiers = resolveModifiers(params.modifiers);
  await pageGuard?.();
  await withOverlayInputPassThrough(tabId, { x, y }, async () => {
    await withDebugger(tabId, async (target) => {
      await pageGuard?.();
      await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", { type: "mouseMoved", x, y, modifiers });
      for (const clickCount of [1, 2]) {
        await dispatchMousePressAndRelease(target, { button, clickCount, modifiers, x, y }, pageGuard);
      }
    });
  }, undefined, pageGuard);
  return { doubleClicked: true };
}

async function dispatchHover(params, pageGuard) {
  const tabId = requireTabId(params);
  const x = requireFiniteNumber(params.x, "x");
  const y = requireFiniteNumber(params.y, "y");
  await pageGuard?.();
  await notifyOverlay(tabId, "cursor-move", { x, y });
  await withDebugger(tabId, async (target) => {
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  });
  return { hovered: true };
}

async function dispatchScroll(params, pageGuard) {
  const tabId = requireTabId(params);
  const x = requireFiniteNumber(params.x, "x");
  const y = requireFiniteNumber(params.y, "y");
  const deltaX = typeof params.deltaX === "number" && Number.isFinite(params.deltaX) ? params.deltaX : 0;
  const deltaY = typeof params.deltaY === "number" && Number.isFinite(params.deltaY) ? params.deltaY : 0;
  if (deltaX === 0 && deltaY === 0) throw new Error("at least one of deltaX or deltaY must be a non-zero finite number");
  await pageGuard?.();
  await notifyOverlay(tabId, "cursor-move", { x, y });
  await withDebugger(tabId, async (target) => {
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x,
      y,
      deltaX,
      deltaY
    });
  });
  return { scrolled: true };
}

async function insertText(params, pageGuard) {
  const tabId = requireTabId(params);
  if (typeof params.text !== "string") throw new Error("text must be a string");
  if (params.text.length > MAX_TEXT_CHARS) throw new Error(`text is too large; max ${MAX_TEXT_CHARS} characters`);
  await withDebugger(tabId, async (target) => {
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Input.insertText", { text: params.text });
  });
  return { typed: true };
}

async function dispatchKey(params, pageGuard) {
  const tabId = requireTabId(params);
  if (typeof params.key !== "string" || params.key.length === 0) throw new Error("key must be a non-empty string");
  if (params.key.length > MAX_KEY_CHARS) throw new Error(`key is too large; max ${MAX_KEY_CHARS} characters`);
  const modifiers = resolveModifiers(params.modifiers);
  await withDebugger(tabId, async (target) => {
    await dispatchKeyDownAndUp(target, { key: params.key, modifiers }, pageGuard);
  });
  return { pressed: true };
}

async function dispatchMousePressAndRelease(target, event, pageGuard) {
  let pressed = false;
  let operationError = null;
  try {
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", { ...event, type: "mousePressed" });
    pressed = true;
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", { ...event, type: "mouseReleased" });
    pressed = false;
  } catch (error) {
    operationError = error;
    if (pressed && error && typeof error === "object") error.authorizedPageEffect = true;
    throw error;
  } finally {
    if (pressed && await pageGuardStillAuthorized(pageGuard)) {
      try {
        await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", { ...event, type: "mouseReleased" });
      } catch (releaseError) {
        if (operationError === null) throw releaseError;
      }
    }
  }
}

// CDP treats a keyDown without text as rawKeyDown, which never triggers default
// actions (Enter submitting a form, character insertion). Resolve the text and
// virtual key codes Chrome needs so keys behave like real keyboard input.
const NAMED_KEY_DETAILS = {
  Alt: { keyCode: 18 },
  ArrowDown: { keyCode: 40 },
  ArrowLeft: { keyCode: 37 },
  ArrowRight: { keyCode: 39 },
  ArrowUp: { keyCode: 38 },
  Backspace: { keyCode: 8 },
  Control: { keyCode: 17 },
  Delete: { keyCode: 46 },
  End: { keyCode: 35 },
  Enter: { keyCode: 13, text: "\r" },
  Escape: { keyCode: 27 },
  Home: { keyCode: 36 },
  Insert: { keyCode: 45 },
  Meta: { keyCode: 91 },
  PageDown: { keyCode: 34 },
  PageUp: { keyCode: 33 },
  Shift: { keyCode: 16 },
  Space: { key: " ", keyCode: 32, text: " " },
  Tab: { keyCode: 9 }
};

function keyEventDetails(rawKey, modifiers) {
  const shifted = (modifiers & 8) !== 0;
  const shortcut = (modifiers & 7) !== 0;
  const codeMatch = /^Key([A-Z])$/u.exec(rawKey);
  const digitMatch = /^Digit([0-9])$/u.exec(rawKey);
  const codeKey = codeMatch ? (shifted ? codeMatch[1] : codeMatch[1].toLowerCase()) : null;
  const key = codeKey ?? (digitMatch ? digitMatch[1] : rawKey);
  const named = NAMED_KEY_DETAILS[key];
  if (named) {
    return { key: named.key ?? key, keyCode: named.keyCode, text: shortcut ? undefined : named.text };
  }
  const functionKey = /^F(1[0-2]|[1-9])$/u.exec(key);
  if (functionKey) return { key, keyCode: 111 + Number(functionKey[1]) };
  if (key.length === 1) {
    const printableKey = shifted && /^[a-z]$/u.test(key) ? key.toUpperCase() : key;
    const upper = printableKey.toUpperCase();
    const keyCode = /^[A-Z0-9]$/u.test(upper) ? upper.charCodeAt(0) : key === " " ? 32 : undefined;
    return { key: printableKey, keyCode, text: shortcut ? undefined : printableKey };
  }
  return { key };
}

async function dispatchKeyDownAndUp(target, { key, modifiers }, pageGuard) {
  const details = keyEventDetails(key, modifiers);
  const event = { key: details.key, modifiers };
  if (details.keyCode !== undefined) {
    event.windowsVirtualKeyCode = details.keyCode;
    event.nativeVirtualKeyCode = details.keyCode;
  }
  const keyDownEvent = details.text === undefined
    ? { ...event, type: "rawKeyDown" }
    : { ...event, text: details.text, type: "keyDown" };
  let keyDown = false;
  let operationError = null;
  try {
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", keyDownEvent);
    keyDown = true;
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", { ...event, type: "keyUp" });
    keyDown = false;
  } catch (error) {
    operationError = error;
    if (keyDown && error && typeof error === "object") error.authorizedPageEffect = true;
    throw error;
  } finally {
    if (keyDown && await pageGuardStillAuthorized(pageGuard)) {
      try {
        await chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", { ...event, type: "keyUp" });
      } catch (releaseError) {
        if (operationError === null) throw releaseError;
      }
    }
  }
}

async function pageGuardStillAuthorized(pageGuard) {
  if (!pageGuard) return true;
  try { await pageGuard(); return true; } catch { return false; }
}

// Builds the main-world pre-evaluation origin guard. It runs in the page's
// realm, where a hostile document can patch Array.prototype and
// String.prototype, so the scope comparison uses only unforgeable location
// fields, primitive string concatenation, and the === operator in a plain
// loop — never a prototype method the page could have replaced.
function scopeGuardedExpression(expectedScopes, expression) {
  return `(() => { const p = location.port || (location.protocol === "https:" ? "443" : "80"); const s = location.protocol + "//" + location.hostname + ":" + p + (location.pathname || "/"); const allowed = ${JSON.stringify(expectedScopes)}; let authorized = false; for (let i = 0; i < allowed.length; i += 1) { if (allowed[i] === s) { authorized = true; break; } } if (!authorized) throw new Error("Page scope changed before evaluation"); return (0, eval)(${JSON.stringify(expression)}); })()`;
}

async function evaluateInTab(params, pageGuard) {
  const tabId = requireTabId(params);
  if (typeof params.expression !== "string" || params.expression.length === 0) {
    throw new Error("expression must be a non-empty string");
  }
  if (params.expression.length > MAX_EXPRESSION_CHARS) {
    throw new Error(`expression is too large; max ${MAX_EXPRESSION_CHARS} characters`);
  }
  return withDebugger(tabId, async (target) => {
    await pageGuard?.();
    const guardedExpression = Array.isArray(params.__expectedScopes)
      ? scopeGuardedExpression(params.__expectedScopes, params.expression)
      : params.expression;
    const response = await chrome.debugger.sendCommand(target, "Runtime.evaluate", {
      awaitPromise: true,
      expression: guardedExpression,
      returnByValue: true
    });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || "Page evaluation failed");
    return response.result?.value ?? response.result?.description ?? null;
  });
}

async function pageText(params) {
  const tabId = requireTabId(params);
  const maxChars = clampInteger(params.maxChars, 0, 50000, 12000, "maxChars");
  const expression = `({
    title: document.title,
    url: location.href,
    text: document.body ? document.body.innerText.slice(0, ${maxChars}) : ""
  })`;
  return evaluateInTab({ tabId, expression });
}

async function domContent(params) {
  const tabId = requireTabId(params);
  const maxChars = clampInteger(params.maxChars, 0, 500000, 50000, "maxChars");
  const contentType = params.contentType === "text" ? "text" : "html";
  const expression = contentType === "text"
    ? `({ title: document.title, url: location.href, contentType: "text", content: document.body ? document.body.innerText.slice(0, ${maxChars}) : "" })`
    : `({ title: document.title, url: location.href, contentType: "html", content: document.documentElement.outerHTML.slice(0, ${maxChars}) })`;
  return evaluateInTab({ tabId, expression });
}

async function setViewport(params, pageGuard) {
  const tabId = requireTabId(params);
  const width = clampInteger(params.width, 100, 7680, null, "width");
  const height = clampInteger(params.height, 100, 4320, null, "height");
  if (width === null || height === null) throw new Error("width and height must be integers (100–7680 / 100–4320)");
  const deviceScaleFactor = typeof params.deviceScaleFactor === "number" && Number.isFinite(params.deviceScaleFactor)
    ? Math.max(0, Math.min(10, params.deviceScaleFactor))
    : 1;
  const mobile = params.mobile === true;
  const result = await withDebugger(tabId, async (target) => {
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor,
      mobile
    });
    return { width, height, deviceScaleFactor, mobile };
  });
  return { tabId, emulated: true, ...result };
}

async function resetViewport(params, pageGuard) {
  const tabId = requireTabId(params);
  await withDebugger(tabId, async (target) => {
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Emulation.clearDeviceMetricsOverride", {});
  });
  return { tabId, reset: true };
}

async function setWindowState(params) {
  const windowId = requireWindowId(params);
  const state = params.state;
  if (!["normal", "minimized", "maximized", "fullscreen"].includes(state)) {
    throw new Error("state must be one of: normal, minimized, maximized, fullscreen");
  }
  await chrome.windows.update(windowId, { state });
  return windowInfo(await chrome.windows.get(windowId, { populate: true }));
}

async function getWindowState(params) {
  const windowId = requireWindowId(params);
  return windowInfo(await chrome.windows.get(windowId, { populate: true }));
}

async function createWindow(params) {
  validateOptionalLeaseParams(params);
  const createArgs = {};
  if (typeof params.url === "string" && params.url.length > 0) {
    await assertNavigationAllowed(params.url);
    createArgs.url = params.url;
  }
  if (params.type === "popup" || params.type === "panel") createArgs.type = params.type;
  if (params.incognito === true) createArgs.incognito = true;
  if (params.state && ["normal", "minimized", "maximized", "fullscreen"].includes(params.state)) {
    createArgs.state = params.state;
  }
  const width = clampInteger(params.width, 100, 7680, null, "width");
  const height = clampInteger(params.height, 100, 4320, null, "height");
  if (width !== null) createArgs.width = width;
  if (height !== null) createArgs.height = height;
  if (Number.isInteger(params.left)) createArgs.left = params.left;
  if (Number.isInteger(params.top)) createArgs.top = params.top;
  const win = await chrome.windows.create(createArgs);
  for (const tab of win.tabs ?? []) {
    if (Number.isInteger(tab.id)) await maybeClaimTabFromParams(tab.id, params, "agent");
  }
  return windowInfo(win);
}

async function claimTab(params) {
  const tabId = requireTabId(params);
  const sessionId = requireNonEmptyString(params.sessionId, "sessionId");
  const turnId = requireNonEmptyString(params.turnId, "turnId");
  const origin = params.origin === "agent" ? "agent" : "user";
  return withTabLeaseMutation(async () => {
    const tab = await chrome.tabs.get(tabId);
    assertClaimableTab(tab);
    const windowId = requireTabWindowId(tab);
    await ensureTabLeasesLoaded();
    const existing = tabLeases.get(tabId);
    if (existing && existing.sessionId !== sessionId) {
      throw new Error(`Tab ${tabId} is already part of browser session ${existing.sessionId}`);
    }
    const preferredGroupId = sessionGroupId(sessionId, windowId);
    const originalGroup = await captureOriginalTabGroup(tab);
    let groupId;
    try {
      groupId = await ensureManagedSessionGroup(sessionId, [tabId], windowId, preferredGroupId);
    } catch (error) {
      await restoreOrThrow([{ originalGroup, tabId, windowId }], error);
    }
    const nextLeases = new Map(tabLeases);
    nextLeases.set(tabId, {
      claimedAt: Date.now(),
      groupId,
      leaseId: typeof existing?.leaseId === "string" ? existing.leaseId : crypto.randomUUID(),
      origin,
      sessionId,
      state: "active",
      tabId,
      turnId,
      windowId
    });
    try {
      await persistTabLeases(nextLeases);
    } catch (error) {
      // Retain the claim in memory on write failure so another session cannot
      // take the tab while persistent state is uncertain.
      replaceTabLeases(nextLeases);
      throw error;
    }
    replaceTabLeases(nextLeases);
    return { claimed: true, tabId, sessionId, turnId, origin };
  });
}

function sessionGroupId(sessionId, windowId) {
  for (const lease of tabLeases.values()) {
    if (
      lease.sessionId === sessionId
      && lease.windowId === windowId
      && Number.isInteger(lease.groupId)
      && lease.groupId >= 0
    ) return lease.groupId;
  }
  return null;
}

async function ensureManagedSessionGroup(sessionId, tabIds, windowId, preferredGroupId = null) {
  if (!Array.isArray(tabIds) || tabIds.length === 0) throw new Error("managed session group requires at least one tab");
  if (!Number.isInteger(windowId)) throw new Error("managed session group requires a valid windowId");
  const uniqueTabIds = [...new Set(tabIds)];
  let reusableGroupId = null;
  if (Number.isInteger(preferredGroupId) && preferredGroupId >= 0) {
    try {
      const group = await chrome.tabGroups.get(preferredGroupId);
      if (
        group?.id === preferredGroupId
        && group.windowId === windowId
        && group.title === managedGroupTitle(sessionId)
        && group.color === MANAGED_GROUP_COLOR
      ) reusableGroupId = preferredGroupId;
    } catch {
      reusableGroupId = null;
    }
  }
  let groupId;
  if (reusableGroupId !== null) {
    try {
      groupId = await chrome.tabs.group({ groupId: reusableGroupId, tabIds: uniqueTabIds });
    } catch {
      groupId = await chrome.tabs.group({
        createProperties: { windowId },
        tabIds: uniqueTabIds
      });
    }
  } else {
    groupId = await chrome.tabs.group({
      createProperties: { windowId },
      tabIds: uniqueTabIds
    });
  }
  await chrome.tabGroups.update(groupId, {
    color: MANAGED_GROUP_COLOR,
    title: managedGroupTitle(sessionId)
  });
  return groupId;
}

function managedGroupTitle(sessionId) {
  return `${MANAGED_GROUP_TITLE_PREFIX}${sessionId}`.slice(0, 255);
}

function requireTabWindowId(tab) {
  if (!Number.isInteger(tab?.windowId)) throw new Error(`Tab ${tab?.id ?? "unknown"} has no valid window`);
  return tab.windowId;
}

async function captureOriginalTabGroup(tab) {
  if (!Number.isInteger(tab?.groupId) || tab.groupId < 0) return null;
  const group = await chrome.tabGroups.get(tab.groupId);
  if (!group || group.id !== tab.groupId || group.windowId !== tab.windowId) {
    throw new Error(`Tab ${tab.id} has invalid original group metadata`);
  }
  return {
    collapsed: group.collapsed === true,
    color: group.color,
    id: group.id,
    title: typeof group.title === "string" ? group.title : "",
    windowId: group.windowId
  };
}

async function restoreOrThrow(records, originalError) {
  try {
    await restoreTabGroups(records);
  } catch (rollbackError) {
    throw new Error(
      `${originalError?.message || originalError}; rollback failed: ${rollbackError?.message || rollbackError}`,
      { cause: originalError }
    );
  }
  throw originalError;
}

async function restoreTabGroups(records) {
  const grouped = new Map();
  const ungrouped = [];
  for (const record of records) {
    if (record.originalGroup !== null) {
      const key = `${record.originalGroup.windowId}:${record.originalGroup.id}`;
      if (!grouped.has(key)) grouped.set(key, { group: record.originalGroup, tabIds: [] });
      grouped.get(key).tabIds.push(record.tabId);
    } else {
      ungrouped.push(record.tabId);
    }
  }
  for (const { group, tabIds } of grouped.values()) {
    let restoredGroupId = group.id;
    try {
      await chrome.tabs.group({ groupId: group.id, tabIds });
    } catch {
      restoredGroupId = await chrome.tabs.group({
        createProperties: { windowId: group.windowId },
        tabIds
      });
    }
    await chrome.tabGroups.update(restoredGroupId, {
      collapsed: group.collapsed,
      color: group.color,
      title: group.title
    });
  }
  if (ungrouped.length > 0) await chrome.tabs.ungroup(ungrouped);
}

function isClaimableUrl(value) {
  if (value === "about:blank") return true;
  if (typeof value !== "string" || value.length === 0) return false;
  try {
    return ["http:", "https:", "file:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isAdoptableNavigationTarget(tab, eventUrl) {
  const candidates = [eventUrl, tab?.url].filter((value) => typeof value === "string" && value.length > 0);
  if (candidates.length === 0) return false;
  return candidates.every(isClaimableUrl);
}

async function adoptCreatedNavigationTarget(details) {
  if (!Number.isInteger(details?.sourceTabId) || !Number.isInteger(details?.tabId)) return { adopted: false, reason: "invalid" };
  return withTabLeaseMutation(async () => {
    await ensureTabLeasesLoaded();
    const sourceLease = tabLeases.get(details.sourceTabId);
    if (!sourceLease) return { adopted: false, reason: "unleased-source" };
    if (sourceLease.state !== "active") return { adopted: false, reason: "inactive-source" };
    const existing = tabLeases.get(details.tabId);
    if (existing && existing.sessionId !== sourceLease.sessionId) {
      return { adopted: false, reason: "cross-session" };
    }
    if (existing) return { adopted: false, reason: "already-leased" };
    let tab;
    try {
      tab = await chrome.tabs.get(details.tabId);
    } catch {
      return { adopted: false, reason: "missing" };
    }
    if (!isAdoptableNavigationTarget(tab, details.url)) return { adopted: false, reason: "internal" };
    assertClaimableTab(tab);
    const windowId = requireTabWindowId(tab);
    const preferredGroupId = sessionGroupId(sourceLease.sessionId, windowId);
    const originalGroup = await captureOriginalTabGroup(tab);
    let groupId;
    try {
      groupId = await ensureManagedSessionGroup(sourceLease.sessionId, [details.tabId], windowId, preferredGroupId);
    } catch (error) {
      await restoreOrThrow([{ originalGroup, tabId: details.tabId, windowId }], error);
    }
    const adoptedLease = {
      claimedAt: Date.now(),
      groupId,
      origin: "agent",
      sessionId: sourceLease.sessionId,
      state: "active",
      tabId: details.tabId,
      turnId: sourceLease.turnId,
      windowId
    };
    const nextLeases = new Map(tabLeases);
    nextLeases.set(details.tabId, adoptedLease);
    try {
      await persistTabLeases(nextLeases);
    } catch (error) {
      // Keep the successfully grouped tab and the in-memory lease together.
      // Storage failures are fail-closed: this worker must not let another
      // session claim the child while persistence is unavailable.
      replaceTabLeases(nextLeases);
      throw error;
    }
    replaceTabLeases(nextLeases);
    return { adopted: true, groupId, sessionId: sourceLease.sessionId, tabId: details.tabId };
  });
}

async function resumeSession(params) {
  const sessionId = requireNonEmptyString(params.sessionId, "sessionId");
  const turnId = requireNonEmptyString(params.turnId, "turnId");
  return withTabLeaseMutation(async () => {
    await ensureTabLeasesLoaded();
    const nextLeases = new Map(tabLeases);
    const liveRecords = [];
    const recoveredTabIds = [];
    const skipped = [];
    const rejectedLiveTabIds = [];
    for (const lease of tabLeases.values()) {
      if (lease.sessionId !== sessionId) continue;
      let tab;
      try {
        tab = await chrome.tabs.get(lease.tabId);
      } catch {
        nextLeases.delete(lease.tabId);
        skipped.push({ reason: "missing", tabId: lease.tabId });
        continue;
      }
      try {
        assertClaimableTab(tab);
        requireTabWindowId(tab);
      } catch {
        nextLeases.delete(lease.tabId);
        rejectedLiveTabIds.push(lease.tabId);
        skipped.push({ reason: "internal", tabId: lease.tabId });
        continue;
      }
      if (lease.state === "handoff") recoveredTabIds.push(lease.tabId);
      liveRecords.push({
        lease,
        originalGroup: await captureOriginalTabGroup(tab),
        tab,
        tabId: lease.tabId,
        windowId: tab.windowId
      });
    }

    const recordsByWindow = new Map();
    for (const record of liveRecords) {
      if (!recordsByWindow.has(record.windowId)) recordsByWindow.set(record.windowId, []);
      recordsByWindow.get(record.windowId).push(record);
    }
    const groups = [];
    try {
      for (const [windowId, records] of [...recordsByWindow.entries()].sort(([left], [right]) => left - right)) {
        const preferredGroupId = records.find((record) => (
          Number.isInteger(record.lease.groupId)
          && record.lease.groupId >= 0
        ))?.lease.groupId ?? null;
        const groupId = await ensureManagedSessionGroup(
          sessionId,
          records.map((record) => record.tabId),
          windowId,
          preferredGroupId
        );
        groups.push({ groupId, windowId });
        for (const record of records) {
          const resumed = record.lease.state === "handoff"
            ? { ...record.lease, claimedAt: Date.now(), state: "active", turnId }
            : record.lease;
          nextLeases.set(record.tabId, { ...resumed, groupId, windowId });
        }
      }
      for (const tabId of recoveredTabIds) await chrome.tabs.update(tabId, { active: true });
    } catch (error) {
      await restoreOrThrow(liveRecords, error);
    }

    await persistTabLeases(nextLeases);
    replaceTabLeases(nextLeases);
    await ungroupTabsIfAvailable(rejectedLiveTabIds);
    return {
      groupId: groups.length === 1 ? groups[0].groupId : null,
      groups,
      recoveredTabIds,
      sessionId,
      skipped,
      turnId
    };
  });
}

function assertClaimableTab(tab) {
  // A freshly created tab has not committed its navigation yet: tabs.get
  // reports url as "" while the requested URL is still in pendingUrl. Only
  // fall back to pendingUrl in that window; once a URL has committed it is
  // authoritative, so a chrome:// tab stays unclaimable while it navigates.
  const committedUrl = typeof tab?.url === "string" && tab.url.length > 0 ? tab.url : null;
  if (!isClaimableUrl(committedUrl ?? tab?.pendingUrl)) {
    throw new Error(`Chrome internal tab ${tab?.id ?? "unknown"} cannot be claimed because its URL is unsupported or invalid`);
  }
}

async function maybeClaimTabFromParams(tabId, params, origin) {
  if (!Number.isInteger(tabId) || typeof params.sessionId !== "string" || typeof params.turnId !== "string") return;
  await claimTab({ tabId, sessionId: params.sessionId, turnId: params.turnId, origin });
}

function validateOptionalLeaseParams(params) {
  const hasSessionId = params.sessionId != null;
  const hasTurnId = params.turnId != null;
  if (hasSessionId !== hasTurnId) {
    throw new Error("sessionId and turnId must be provided together");
  }
  if (hasSessionId) {
    requireNonEmptyString(params.sessionId, "sessionId");
    requireNonEmptyString(params.turnId, "turnId");
  }
}

async function finalizeTabs(params) {
  const sessionId = requireNonEmptyString(params.sessionId, "sessionId");
  const keep = normalizeFinalizeKeep(params.keep);
  return withTabLeaseMutation(async () => {
    await ensureTabLeasesLoaded();
    const sessionLeases = [...tabLeases.values()].filter((lease) => lease.sessionId === sessionId && lease.state === "active");
    const sessionTabIds = new Set(sessionLeases.map((lease) => lease.tabId));
    for (const entry of keep) {
      if (!sessionTabIds.has(entry.tabId)) throw new Error(`finalizeTabs cannot keep unknown tab ${entry.tabId}`);
    }
    const keepIds = new Set(keep.map((entry) => entry.tabId));
    const closeIds = [];
    const releasedTabIds = [];
    const closeFailures = [];
    const nextLeases = new Map(tabLeases);

    for (const lease of sessionLeases) {
      const kept = keep.find((entry) => entry.tabId === lease.tabId);
      if (kept) {
        nextLeases.set(lease.tabId, { ...lease, state: "handoff", handoffStatus: kept.status });
        continue;
      }
      if (lease.origin === "agent") {
        try {
          await chrome.tabs.remove(lease.tabId);
          closeIds.push(lease.tabId);
        } catch (error) {
          // Only keep the lease when the tab genuinely still exists. If it was
          // already closed in a race, releasing the lease here prevents a stale
          // entry from blocking future claims of the reused tab id.
          if (await tabStillExists(lease.tabId)) {
            closeFailures.push({ error, tabId: lease.tabId });
            continue;
          }
          closeIds.push(lease.tabId);
        }
      }
      nextLeases.delete(lease.tabId);
      releasedTabIds.push(lease.tabId);
    }

    await persistTabLeases(nextLeases);
    replaceTabLeases(nextLeases);
    await ungroupTabsIfAvailable(releasedTabIds);
    await releaseDebuggers({ tabIds: releasedTabIds });
    if (closeFailures.length > 0) {
      const detail = closeFailures.map(({ error, tabId }) => `${tabId}: ${error?.message || error}`).join(", ");
      throw new Error(`Could not close agent tabs: ${detail}`);
    }
    return { finalized: true, closedTabIds: closeIds, keptTabIds: [...keepIds], sessionId };
  });
}

async function endTurn(params) {
  const sessionId = requireNonEmptyString(params.sessionId, "sessionId");
  const turnId = requireNonEmptyString(params.turnId, "turnId");
  return withTabLeaseMutation(async () => {
    await ensureTabLeasesLoaded();
    const releasedTabIds = [];
    const nextLeases = new Map(tabLeases);
    for (const [tabId, lease] of tabLeases.entries()) {
      if (lease.sessionId !== sessionId || lease.turnId !== turnId || lease.state !== "active") continue;
      nextLeases.delete(tabId);
      releasedTabIds.push(tabId);
    }
    if (releasedTabIds.length === 0) return { ended: true, releasedTabIds: [], sessionId, turnId };
    await persistTabLeases(nextLeases);
    replaceTabLeases(nextLeases);
    await ungroupTabsIfAvailable(releasedTabIds);
    await releaseDebuggers({ tabIds: releasedTabIds });
    await Promise.all(releasedTabIds.map((tabId) => notifyOverlay(tabId, "cursor-state", { state: "hidden" })));
    return { ended: true, releasedTabIds, sessionId, turnId };
  });
}

async function ungroupTabsIfAvailable(tabIds) {
  if (tabIds.length === 0 || typeof chrome.tabs.ungroup !== "function") return;
  for (const tabId of tabIds) await chrome.tabs.ungroup([tabId]).catch(() => {});
}

function normalizeFinalizeKeep(keep) {
  if (!Array.isArray(keep)) throw new Error("keep must be an array");
  if (keep.length > MAX_TAB_IDS) throw new Error(`keep must contain at most ${MAX_TAB_IDS} entries`);
  const seen = new Set();
  return keep.map((entry, index) => {
    const tabId = requireTabId({ tabId: entry?.tabId });
    const status = entry?.status;
    if (status !== "handoff" && status !== "deliverable") {
      throw new Error(`keep[${index}].status must be handoff or deliverable`);
    }
    if (seen.has(tabId)) throw new Error(`keep contains duplicate tabId ${tabId}`);
    seen.add(tabId);
    return { tabId, status };
  });
}

function ensureTabLeasesLoaded() {
  // Memoize the in-flight load promise (not just a boolean) so concurrent callers
  // await the same load instead of racing on a half-populated tabLeases map.
  if (tabLeasesLoaded) return Promise.resolve();
  if (tabLeasesLoadPromise) return tabLeasesLoadPromise;
  tabLeasesLoadPromise = loadTabLeases().finally(() => { tabLeasesLoadPromise = null; });
  return tabLeasesLoadPromise;
}

function withTabLeaseMutation(callback) {
  const operation = tabLeaseMutationQueue.then(callback);
  tabLeaseMutationQueue = operation.catch(() => {});
  return operation;
}

async function loadTabLeases() {
  const stored = (await chrome.storage.session.get(TAB_LEASES_STORAGE_KEY))[TAB_LEASES_STORAGE_KEY];
  // Clear before repopulating so a partial failure on a later retry does not
  // leave stale entries from a previous load mixed with the new snapshot.
  tabLeases.clear();
  if (stored != null) {
    if (typeof stored !== "object" || Array.isArray(stored)) {
      throw new Error("stored tab lease data is invalid");
    }
    for (const [key, value] of Object.entries(stored)) {
      const tabId = Number(key);
      if (!isValidStoredTabLease(tabId, value)) throw new Error("stored tab lease data is invalid");
      tabLeases.set(tabId, value);
    }
  }
  tabLeasesLoaded = true;
}

function isValidStoredTabLease(tabId, value) {
  return Number.isInteger(tabId)
    && value !== null
    && typeof value === "object"
    && value.tabId === tabId
    && typeof value.sessionId === "string"
    && value.sessionId.length > 0
    && value.sessionId.length <= MAX_KEY_CHARS
    && typeof value.turnId === "string"
    && value.turnId.length > 0
    && value.turnId.length <= MAX_KEY_CHARS
    && (value.leaseId === undefined || (typeof value.leaseId === "string" && value.leaseId.length > 0 && value.leaseId.length <= MAX_KEY_CHARS))
    && (value.origin === "agent" || value.origin === "user")
    && (value.state === "active" || value.state === "handoff")
    && Number.isFinite(value.claimedAt)
    && (value.groupId === undefined || (Number.isInteger(value.groupId) && value.groupId >= 0))
    && (value.windowId === undefined || Number.isInteger(value.windowId))
    && (value.state !== "handoff" || value.handoffStatus === "handoff" || value.handoffStatus === "deliverable");
}

async function persistTabLeases(leaseMap = tabLeases) {
  const leases = Object.fromEntries([...leaseMap.entries()].map(([tabId, lease]) => [String(tabId), lease]));
  await chrome.storage.session.set({ [TAB_LEASES_STORAGE_KEY]: leases });
}

function replaceTabLeases(nextLeases) {
  tabLeases.clear();
  for (const [tabId, lease] of nextLeases) tabLeases.set(tabId, lease);
}

async function removeClosedTabLease(tabId) {
  return withTabLeaseMutation(async () => {
    await ensureTabLeasesLoaded();
    const nextLeases = new Map(tabLeases);
    nextLeases.delete(tabId);
    await persistTabLeases(nextLeases);
    replaceTabLeases(nextLeases);
  });
}

async function replaceClosedTabLease(addedTabId, removedTabId) {
  return withTabLeaseMutation(async () => {
    await ensureTabLeasesLoaded();
    const nextLeases = new Map(tabLeases);
    const lease = nextLeases.get(removedTabId);
    nextLeases.delete(removedTabId);
    if (lease) nextLeases.set(addedTabId, { ...lease, tabId: addedTabId });
    await persistTabLeases(nextLeases);
    replaceTabLeases(nextLeases);
  });
}

function reportLeasePersistenceError(error) {
  console.error("OpenCode bridge could not persist tab lease cleanup", error);
}

async function moveSequence(params, pageGuard) {
  const tabId = requireTabId(params);
  const points = Array.isArray(params.points) ? params.points : [];
  if (points.length === 0) throw new Error("points must be a non-empty array of {x,y}");
  if (points.length > MAX_MOVE_POINTS) throw new Error(`points must contain at most ${MAX_MOVE_POINTS} entries`);
  const steps = clampInteger(params.steps, 1, 500, 20, "steps");
  const stepDelayMs = clampInteger(params.stepDelayMs, 0, 1000, 8, "stepDelayMs");
  const drag = params.drag === true;
  const button = requireButton(params.button);
  const modifiers = resolveModifiers(params.modifiers);

  const validated = points.map((p, i) => {
    const x = requireFiniteNumber(p?.x, `points[${i}].x`);
    const y = requireFiniteNumber(p?.y, `points[${i}].y`);
    return { x, y };
  });

  const interpolatedEventCount = (validated.length - 1) * steps + 1;
  if (interpolatedEventCount > MAX_MOVE_EVENTS) {
    throw new Error(`move sequence has too many interpolated events; max ${MAX_MOVE_EVENTS}`);
  }
  const estimatedDurationMs = interpolatedEventCount * stepDelayMs;
  if (estimatedDurationMs > MAX_MOVE_DURATION_MS) {
    throw new Error(`move sequence is too long; max duration ${MAX_MOVE_DURATION_MS}ms`);
  }

  const interpolated = interpolatePath(validated, steps);
  const first = interpolated[0];
  const last = interpolated[interpolated.length - 1];

  await pageGuard?.();
  const overlayReady = await injectOverlay(tabId);
  if (overlayReady) await sendOverlayMessage(tabId, "cursor-move", { x: first.x, y: first.y });

  await withDebugger(tabId, async (target) => {
    let mousePressed = false;
    let operationError = null;
    try {
      await pageGuard?.();
      await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
        type: "mouseMoved", x: first.x, y: first.y, modifiers
      });
      if (drag) {
        await pageGuard?.();
        await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
          type: "mousePressed", button, clickCount: 1, modifiers, x: first.x, y: first.y
        });
        mousePressed = true;
      }
      for (const point of interpolated) {
        await pageGuard?.();
        await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
          type: "mouseMoved", x: point.x, y: point.y, modifiers
        });
        if (overlayReady) await sendOverlayMessage(tabId, "cursor-move", { x: point.x, y: point.y });
        if (stepDelayMs > 0) await sleep(stepDelayMs);
      }
    } catch (error) {
      operationError = error;
      throw error;
    } finally {
      if (mousePressed && await pageGuardStillAuthorized(pageGuard)) {
        try {
          await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
            type: "mouseReleased", button, clickCount: 1, modifiers, x: last.x, y: last.y
          });
        } catch (releaseError) {
          if (operationError === null) throw releaseError;
        }
      }
    }
  });

  if (drag && overlayReady) await sendOverlayMessage(tabId, "cursor-click", { x: last.x, y: last.y });

  return { moved: true, points: validated.length, steps: interpolated.length, drag };
}

async function listDownloads(params) {
  const query = {};
  if (typeof params.state === "string" && ["in_progress", "interrupted", "complete"].includes(params.state)) {
    query.state = params.state;
  }
  const limit = clampInteger(params.limit, 1, 1000, 100, "limit");
  const orderBy = Array.isArray(params.orderBy) ? params.orderBy : ["-startTime"];
  query.orderBy = orderBy;
  query.limit = limit;
  if (typeof params.query === "string" && params.query.length > 0) query.query = [limitString(params.query, "query", MAX_QUERY_CHARS)];
  const items = await chrome.downloads.search(query);
  return items.map((d) => ({
    id: d.id,
    filename: d.filename,
    fileSize: d.fileSize,
    mime: d.mime,
    state: d.state,
    url: d.url,
    paused: d.paused === true,
    startTime: d.startTime,
    endTime: d.endTime,
    bytesReceived: d.bytesReceived,
    totalBytes: d.totalBytes,
    danger: d.danger,
    incognito: d.incognito === true
  }));
}

async function cancelDownload(params) {
  const downloadId = requireDownloadId(params);
  await chrome.downloads.cancel(downloadId);
  return { cancelled: true, id: downloadId };
}

async function pauseDownload(params) {
  const downloadId = requireDownloadId(params);
  await chrome.downloads.pause(downloadId);
  return { paused: true, id: downloadId };
}

async function resumeDownload(params) {
  const downloadId = requireDownloadId(params);
  await chrome.downloads.resume(downloadId);
  return { resumed: true, id: downloadId };
}

async function showDownload(params) {
  if (params.showDefaultFolder === true || params.downloadId == null) {
    await chrome.downloads.showDefaultFolder();
    return { showed: "defaultFolder" };
  }
  const downloadId = requireDownloadId(params);
  await chrome.downloads.show(downloadId);
  return { showed: true, id: downloadId };
}

async function createTabGroup(params) {
  const tabIds = requireTabIdArray(params.tabIds);
  const createProperties = {};
  if (Number.isInteger(params.windowId)) createProperties.windowId = params.windowId;
  const groupId = await chrome.tabs.group({ tabIds, createProperties });
  const updateArgs = {};
  if (typeof params.title === "string") updateArgs.title = params.title;
  if (typeof params.color === "string" && ["grey", "blue", "red", "yellow", "green", "pink", "orange", "cyan", "purple"].includes(params.color)) {
    updateArgs.color = params.color;
  }
  if (typeof params.collapsed === "boolean") updateArgs.collapsed = params.collapsed;
  if (Object.keys(updateArgs).length > 0) {
    await chrome.tabGroups.update(groupId, updateArgs);
  }
  const group = await chrome.tabGroups.get(groupId);
  return tabGroupInfo(group);
}

async function updateTabGroup(params) {
  const groupId = requireGroupId(params);
  const updateArgs = {};
  if (typeof params.title === "string") updateArgs.title = params.title;
  if (typeof params.color === "string" && ["grey", "blue", "red", "yellow", "green", "pink", "orange", "cyan", "purple"].includes(params.color)) {
    updateArgs.color = params.color;
  }
  if (typeof params.collapsed === "boolean") updateArgs.collapsed = params.collapsed;
  await chrome.tabGroups.update(groupId, updateArgs);
  return tabGroupInfo(await chrome.tabGroups.get(groupId));
}

async function listTabGroups(params) {
  const query = {};
  if (Number.isInteger(params.windowId)) query.windowId = params.windowId;
  const groups = await chrome.tabGroups.query(query);
  return groups.map(tabGroupInfo);
}

async function groupTabs(params) {
  const tabIds = requireTabIdArray(params.tabIds);
  const groupArgs = { tabIds };
  if (Number.isInteger(params.groupId)) groupArgs.groupId = params.groupId;
  const groupId = await chrome.tabs.group(groupArgs);
  return { groupId, tabIds };
}

async function ungroupTabs(params) {
  const tabIds = requireTabIdArray(params.tabIds);
  await chrome.tabs.ungroup(tabIds);
  return { ungrouped: true, tabIds };
}

function windowInfo(win) {
  return {
    id: win.id,
    focused: win.focused === true,
    incognito: win.incognito === true,
    state: win.state,
    type: win.type,
    top: win.top,
    left: win.left,
    width: win.width,
    height: win.height,
    tabsCount: win.tabs?.length ?? 0
  };
}

function tabGroupInfo(group) {
  return {
    id: group.id,
    windowId: group.windowId,
    title: group.title,
    color: group.color,
    collapsed: group.collapsed === true
  };
}

function requireWindowId(params) {
  if (!Number.isInteger(params.windowId)) throw new Error("windowId must be an integer");
  return params.windowId;
}

function requireDownloadId(params) {
  if (!Number.isInteger(params.downloadId)) throw new Error("downloadId must be an integer");
  return params.downloadId;
}

function requireGroupId(params) {
  if (!Number.isInteger(params.groupId)) throw new Error("groupId must be an integer");
  return params.groupId;
}

function requireTabIdArray(tabIds) {
  if (!Array.isArray(tabIds) || tabIds.length === 0 || !tabIds.every((id) => Number.isInteger(id))) {
    throw new Error("tabIds must be a non-empty array of integers");
  }
  if (tabIds.length > MAX_TAB_IDS) throw new Error(`tabIds must contain at most ${MAX_TAB_IDS} entries`);
  return tabIds;
}

function interpolatePath(points, steps) {
  if (points.length === 0) return [];
  if (points.length === 1) return [points[0]];
  const result = [];
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      result.push({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t
      });
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cdpTargets() {
  return (await chrome.debugger.getTargets()).map((target) => ({
    attached: target.attached === true,
    id: target.id,
    tabId: target.tabId,
    title: target.title,
    type: target.type,
    url: target.url
  }));
}

async function cdpCommand(params, pageGuard) {
  if (!isValidCdpMethod(params.method)) {
    throw new Error("method must be a CDP method string in 'Domain.method' format");
  }
  if (params.method === "Target.getTargets") {
    // Return real CDP TargetInfo objects (targetId, not the extension's id/tabId
    // shape) so callers expecting protocol output are not surprised.
    return {
      targetInfos: (await chrome.debugger.getTargets()).map((target) => ({
        attached: target.attached === true,
        canAccessOpener: false,
        targetId: target.id,
        title: target.title ?? "",
        type: target.type,
        url: target.url ?? ""
      }))
    };
  }
  const target = debuggerTarget(params);
  let commandParams = params.commandParams ?? {};
  if (typeof commandParams !== "object" || commandParams === null || Array.isArray(commandParams)) {
    throw new Error("commandParams must be an object when provided");
  }
  if (params.method === "Runtime.evaluate" && Array.isArray(params.__expectedScopes)) {
    if (typeof commandParams.expression !== "string") throw new Error("Runtime.evaluate requires an expression string");
    commandParams = {
      ...commandParams,
      expression: scopeGuardedExpression(params.__expectedScopes, commandParams.expression)
    };
  }
  return withDebuggerTarget(target, async (attachedTarget, { reused }) => {
    await pageGuard?.();
    const result = await chrome.debugger.sendCommand(attachedTarget, params.method, commandParams);
    if (reused && Number.isInteger(attachedTarget.tabId)) {
      syncRawCdpDomainState(attachedTarget.tabId, params.method);
    }
    return result;
  });
}

function syncRawCdpDomainState(tabId, method) {
  const match = /^([A-Za-z][A-Za-z0-9]*)\.(enable|disable)$/u.exec(method);
  if (!match) return;
  const [, domain, operation] = match;
  const enabled = cdpEnabledDomains.get(tabId) ?? new Set();
  if (operation === "enable") {
    enabled.add(domain);
    cdpEnabledDomains.set(tabId, enabled);
    return;
  }
  enabled.delete(domain);
  if (enabled.size === 0) cdpEnabledDomains.delete(tabId);
}

async function searchHistory(params) {
  const maxResults = clampInteger(params.limit, 1, 1000, 100, "limit");
  const query = typeof params.query === "string" ? limitString(params.query, "query", MAX_QUERY_CHARS) : "";
  const search = { text: query, maxResults };
  const startTime = optionalTime(params.from, "from");
  const endTime = optionalTime(params.to, "to");
  if (startTime !== null) search.startTime = startTime;
  if (endTime !== null) search.endTime = endTime;
  return (await chrome.history.search(search)).map((entry) => ({
    id: entry.id,
    lastVisitTime: entry.lastVisitTime,
    title: entry.title,
    typedCount: entry.typedCount,
    url: entry.url,
    visitCount: entry.visitCount
  }));
}

async function searchBookmarks(params) {
  const limit = clampInteger(params.limit, 1, 1000, 100, "limit");
  const query = typeof params.query === "string" && params.query.length > 0
    ? limitString(params.query, "query", MAX_QUERY_CHARS)
    : {};
  return (await chrome.bookmarks.search(query)).slice(0, limit).map((entry) => ({
    dateAdded: entry.dateAdded,
    id: entry.id,
    parentId: entry.parentId,
    title: entry.title,
    url: entry.url
  }));
}

async function withDebugger(tabId, callback) {
  const scopedTarget = scopedDebuggerTargets.get(tabId);
  if (scopedTarget) return callback(scopedTarget, { reused: true, scoped: true });
  return withDebuggerTarget({ tabId }, callback);
}

async function withScopedNavigationBarrier(tabId, pageGuard, operation, signal, { persistentMutation = false } = {}) {
  let barrier;
  return withDebuggerTarget({ tabId }, async (target) => {
    throwIfAborted(signal);
    if (navigationBarriers.has(tabId) || cdpEnabledDomains.get(tabId)?.has("Fetch")) {
      throw new Error("A scoped navigation barrier cannot prove exclusive Fetch ownership");
    }
    barrier = { pausedRequestIds: [], releaseIndex: 0, state: "opening", target };
    const persistentSnapshot = persistentMutation ? snapshotPersistentDebuggerState(tabId) : null;
    navigationBarriers.set(tabId, barrier);
    try {
      await chrome.debugger.sendCommand(target, "Fetch.enable", {
        patterns: [{ requestStage: "Request", resourceType: "Document", urlPattern: "*" }]
      });
      barrier.state = "active";
      throwIfAborted(signal);
      await pageGuard();
      scopedDebuggerTargets.set(tabId, target);
      try {
        return await operation();
      } finally {
        scopedDebuggerTargets.delete(tabId);
      }
    } catch (error) {
      if (persistentSnapshot) await restorePersistentDebuggerState(tabId, target, persistentSnapshot);
      throw error;
    } finally {
      barrier.state = "closing";
      await drainNavigationBarrier(barrier);
      await chrome.debugger.sendCommand(target, "Fetch.disable", {}).catch(() => {});
      barrier.state = "disabled";
      // Fetch events already queued by Chrome can be delivered while disable is
      // in flight. Keep ownership registered and drain those as well.
      await drainNavigationBarrier(barrier);
      if (persistentSnapshot && barrier.pausedRequestIds.length > 0) {
        await restorePersistentDebuggerState(tabId, target, persistentSnapshot);
      }
    }
  }, async () => {
    if (navigationBarriers.get(tabId) === barrier) navigationBarriers.delete(tabId);
  }, signal);
}

async function drainNavigationBarrier(barrier) {
  while (barrier.releaseIndex < barrier.pausedRequestIds.length) {
    const requestId = barrier.pausedRequestIds[barrier.releaseIndex++];
    try {
      await chrome.debugger.sendCommand(barrier.target, "Fetch.continueRequest", { requestId });
    } catch {
      await chrome.debugger.sendCommand(barrier.target, "Fetch.failRequest", {
        errorReason: "Aborted", requestId
      }).catch(() => {});
    }
  }
}

function snapshotPersistentDebuggerState(tabId) {
  return {
    consoleAttached: consoleLogAttached.has(tabId),
    domains: new Set(cdpEnabledDomains.get(tabId) ?? []),
    eventAttached: cdpEventAttached.has(tabId),
    networkCapture: networkCaptureAttached.has(tabId),
    networkState: networkRequestStates.get(tabId),
    networkTracker: networkTrackerAttached.has(tabId),
    subscriptions: cdpSubscriptions.has(tabId) ? new Set(cdpSubscriptions.get(tabId)) : null
  };
}

async function restorePersistentDebuggerState(tabId, target, snapshot) {
  const currentDomains = new Set(cdpEnabledDomains.get(tabId) ?? []);
  for (const domain of currentDomains) {
    if (domain === "Fetch" || snapshot.domains.has(domain)) continue;
    await chrome.debugger.sendCommand(target, `${domain}.disable`, {}).catch(() => {});
  }
  setMembership(consoleLogAttached, tabId, snapshot.consoleAttached);
  setMembership(cdpEventAttached, tabId, snapshot.eventAttached);
  setMembership(networkCaptureAttached, tabId, snapshot.networkCapture);
  setMembership(networkTrackerAttached, tabId, snapshot.networkTracker);
  if (snapshot.subscriptions === null) cdpSubscriptions.delete(tabId);
  else cdpSubscriptions.set(tabId, new Set(snapshot.subscriptions));
  if (snapshot.networkState === undefined) networkRequestStates.delete(tabId);
  else networkRequestStates.set(tabId, snapshot.networkState);
  if (snapshot.domains.size === 0) cdpEnabledDomains.delete(tabId);
  else cdpEnabledDomains.set(tabId, new Set(snapshot.domains));
  if (!snapshot.consoleAttached) {
    consoleLogBuffers.delete(tabId);
    consoleLogBufferChars.delete(tabId);
  }
}

function setMembership(set, value, present) {
  if (present) set.add(value);
  else set.delete(value);
}

async function withDebuggerTarget(debugTarget, callback, afterCleanup, signal) {
  const key = debuggerKey(debugTarget);
  return withDebuggerLock(key, async () => {
    // Persistent attachment state can change while this operation waits for the lock.
    const reused = Number.isInteger(debugTarget.tabId) && isPersistentDebuggerAttached(debugTarget.tabId);
    let attached = false;
    try {
      if (!reused) {
        await chrome.debugger.attach(debugTarget, DEBUGGER_VERSION);
        attached = true;
      }
      return await callback(debugTarget, { reused });
    } finally {
      const shouldDetach = Number.isInteger(debugTarget.tabId)
        ? (attached || reused) && !isPersistentDebuggerAttached(debugTarget.tabId)
        : attached;
      if (shouldDetach) await chrome.debugger.detach(debugTarget).catch(() => {});
      await afterCleanup?.();
    }
  }, signal);
}

function debuggerKey(debugTarget) {
  if (!Number.isInteger(debugTarget.tabId) && typeof debugTarget.targetId !== "string") {
    throw new Error("CDP target must include tabId or targetId");
  }
  return Number.isInteger(debugTarget.tabId) ? `tab:${debugTarget.tabId}` : `target:${debugTarget.targetId}`;
}

function isPersistentDebuggerAttached(tabId) {
  return consoleLogAttached.has(tabId) || cdpEventAttached.has(tabId) || networkTrackerAttached.has(tabId);
}

async function withDebuggerLock(key, callback, signal) {
  const prev = debuggerQueue.get(key) ?? Promise.resolve();
  let resolveLock;
  const lock = new Promise((resolve) => { resolveLock = resolve; });
  debuggerQueue.set(key, lock);

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    resolveLock();
    if (debuggerQueue.get(key) === lock) debuggerQueue.delete(key);
  };
  try {
    await abortableChromeOperation(prev, signal);
  } catch (error) {
    Promise.resolve(prev).finally(release);
    throw error;
  }
  try {
    return await callback();
  } finally {
    release();
  }
}

async function releaseDebuggers(params = {}) {
  const tabIds = Array.isArray(params.tabIds)
    ? (params.tabIds.length === 0 ? [] : requireTabIdArray(params.tabIds))
    : [...new Set([...consoleLogAttached, ...cdpEventAttached, ...networkTrackerAttached])];
  for (const tabId of tabIds) {
    const target = { tabId };
    await withDebuggerLock(debuggerKey(target), async () => {
      const attached = isPersistentDebuggerAttached(tabId);
      consoleLogAttached.delete(tabId);
      cdpEventAttached.delete(tabId);
      networkTrackerAttached.delete(tabId);
      networkCaptureAttached.delete(tabId);
      networkWaitConsumers.delete(tabId);
      networkRequestStates.delete(tabId);
      cdpSubscriptions.delete(tabId);
      cdpEnabledDomains.delete(tabId);
      tabMainFrameEpochs.delete(tabId);
      executionContextScopes.delete(tabId);
      observedMainFrames.delete(tabId);
      tabNavigationAttempts.delete(tabId);
      retiredMainFrameLoaders.delete(tabId);
      consoleLogBuffers.delete(tabId);
      consoleLogBufferChars.delete(tabId);
      if (attached) await chrome.debugger.detach(target).catch(() => {});
    });
  }
  return { released: true, tabIds };
}

async function notifyOverlay(tabId, type, data, documentId) {
  if (!await injectOverlay(tabId, documentId)) return;
  return sendOverlayMessage(tabId, type, data, documentId);
}

async function withOverlayInputPassThrough(tabId, point, operation, signal, pageGuard) {
  let inputStarted = false;
  try {
    throwIfAborted(signal);
    const overlayInjected = await injectOverlay(tabId);
    throwIfAborted(signal);
    if (overlayInjected) {
      await sendOverlayMessage(tabId, "agent-input-start", {});
      inputStarted = true;
      throwIfAborted(signal);
      await sendOverlayMessage(tabId, "cursor-click", point);
      throwIfAborted(signal);
    }
    return await operation();
  } finally {
    if (inputStarted && await pageGuardStillAuthorized(pageGuard)) {
      await sendOverlayMessage(tabId, "agent-input-end", {});
    }
  }
}

async function injectOverlay(tabId, documentId) {
  try {
    const target = typeof documentId === "string" ? { tabId, documentIds: [documentId] } : { tabId };
    await chrome.scripting.executeScript({ target, files: ["content-scripts/opencode.js"] });
    return true;
  } catch {
    // Tab may be chrome://, file://, or otherwise non-injectable — silently skip
    return false;
  }
}

async function sendOverlayMessage(tabId, type, data, documentId) {
  const options = typeof documentId === "string" ? { documentId } : undefined;
  return chrome.tabs.sendMessage(tabId, { source: OVERLAY_SOURCE, type, ...data }, options).catch(() => null);
}

function debuggerTarget(params) {
  if (Number.isInteger(params.tabId)) return { tabId: params.tabId };
  if (typeof params.targetId === "string" && params.targetId.length > 0) return { targetId: params.targetId };
  throw new Error("cdpCommand requires an integer tabId or non-empty targetId");
}

function requireFiniteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${name} must be a finite number`);
  return value;
}

function requireButton(value) {
  const button = value ?? "left";
  if (!VALID_MOUSE_BUTTONS.has(button)) throw new Error("button must be left, middle, or right");
  return button;
}

function requireNonEmptyString(value, name) {
  if (typeof value !== "string" || value.length === 0) throw new Error(`${name} must be a non-empty string`);
  if (value.length > MAX_KEY_CHARS) throw new Error(`${name} is too large; max ${MAX_KEY_CHARS} characters`);
  return value;
}

function clampInteger(value, min, max, fallback, name = "value") {
  if (value == null) return fallback;
  if (!Number.isInteger(value)) throw new Error(`${name} must be an integer`);
  return Math.max(min, Math.min(max, value));
}

function optionalTime(value, name) {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  throw new Error(`${name} must be a timestamp number or parseable date string`);
}

function sendEvent(event) {
  if (!nativePort) return;
  try {
    const message = { type: "event", event, seq: cdpEventSeq };
    if (JSON.stringify(message).length > MAX_EXTENSION_EVENT_CHARS) return;
    nativePort.postMessage(message);
    cdpEventSeq += 1;
  } catch {}
}

function registerBrowserEventListeners() {
  chrome.webNavigation.onBeforeNavigate?.addListener((details) => {
    if (details?.frameId !== 0 || !Number.isInteger(details?.tabId)) return;
    navigationSequences.set(details.tabId, (navigationSequences.get(details.tabId) ?? 0) + 1);
    invalidateProvenanceForNavigationAttempt(details.tabId, details);
    awaitProvenNetworkMainFrame(details.tabId, safeCanonicalPermissionScope(details.url));
  });
  chrome.webNavigation.onCommitted?.addListener((details) => {
    if (details?.frameId !== 0 || !Number.isInteger(details?.tabId)) return;
    const generation = (navigationSequences.get(details.tabId) ?? 0) + 1;
    navigationSequences.set(details.tabId, generation);
    const pageScope = safeCanonicalPermissionScope(details.url);
    if (pageScope) tabPageProvenance.set(details.tabId, {
      documentId: typeof details.documentId === "string" ? details.documentId : `generation:${generation}`,
      navigationGeneration: generation,
      pageScope
    });
    const previousAttempt = tabNavigationAttempts.get(details.tabId);
    const attempt = previousAttempt?.phase === "pending"
      ? previousAttempt
      : { token: navigationAttemptSequence++ };
    tabNavigationAttempts.set(details.tabId, {
      ...attempt,
      documentId: typeof details.documentId === "string" ? details.documentId : `generation:${generation}`,
      navigationGeneration: generation,
      pageScope,
      phase: "committed"
    });
    executionContextScopes.delete(details.tabId);
    tabMainFrameEpochs.delete(details.tabId);
    awaitProvenNetworkMainFrame(details.tabId, pageScope);
    reconcileMainFrameEpoch(details.tabId, { discardMismatch: true });
    consoleLogBuffers.delete(details.tabId);
    consoleLogBufferChars.delete(details.tabId);
  });
  chrome.webNavigation.onErrorOccurred?.addListener((details) =>
    recoverProvenanceAfterNavigationError(details).catch(() => {})
  );
  chrome.webNavigation.onCreatedNavigationTarget.addListener((details) =>
    adoptCreatedNavigationTarget(details).catch(reportLeasePersistenceError)
  );
  chrome.tabs.onCreated.addListener((tab) => sendEvent({ category: "tabs", type: "tabCreated", tab: tabInfo(tab) }));
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo?.status === "loading" || typeof changeInfo?.url === "string") {
      const navigationGeneration = (navigationSequences.get(tabId) ?? 0) + 1;
      navigationSequences.set(tabId, navigationGeneration);
      updateTabPageProvenanceFromTab(tabId, tab, navigationGeneration);
      executionContextScopes.delete(tabId);
      tabMainFrameEpochs.delete(tabId);
      reconcileMainFrameEpoch(tabId);
      consoleLogBuffers.delete(tabId);
      consoleLogBufferChars.delete(tabId);
      networkRequestStates.delete(tabId);
      if (networkTrackerAttached.has(tabId)) {
        const state = ensureNetworkRequestState(tabId);
        state.awaitingTopLevelDocument = true;
        state.pageScope = tabPageProvenance.get(tabId)?.pageScope ?? null;
      }
    }
    sendEvent({ category: "tabs", type: "tabUpdated", tabId, changeInfo, tab: tabInfo(tab) });
  });
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    navigationSequences.delete(tabId);
    tabPageProvenance.delete(tabId);
    executionContextScopes.delete(tabId);
    tabMainFrameEpochs.delete(tabId);
    observedMainFrames.delete(tabId);
    tabNavigationAttempts.delete(tabId);
    retiredMainFrameLoaders.delete(tabId);
    const persistence = removeClosedTabLease(tabId);
    persistence.catch(reportLeasePersistenceError);
    void releaseDebuggers({ tabIds: [tabId] }).catch(() => {});
    sendEvent({ category: "tabs", type: "tabRemoved", tabId, windowId: removeInfo.windowId, isWindowClosing: removeInfo.isWindowClosing });
  });
  chrome.tabs.onActivated.addListener((activeInfo) => {
    windowActivationGenerations.set(
      activeInfo.windowId,
      (windowActivationGenerations.get(activeInfo.windowId) ?? 0) + 1
    );
    sendEvent({ category: "tabs", type: "tabActivated", tabId: activeInfo.tabId, windowId: activeInfo.windowId });
  });
  chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
    navigationSequences.delete(removedTabId);
    const persistence = replaceClosedTabLease(addedTabId, removedTabId);
    persistence.catch(reportLeasePersistenceError);
    sendEvent({ category: "tabs", type: "tabReplaced", addedTabId, removedTabId });
  });
  chrome.windows.onFocusChanged.addListener((windowId) =>
    sendEvent({ category: "windows", type: "windowFocusChanged", windowId })
  );
  chrome.windows.onRemoved?.addListener((windowId) => {
    windowActivationGenerations.delete(windowId);
  });
  chrome.downloads.onCreated.addListener((item) =>
    sendEvent({ category: "downloads", type: "downloadCreated", downloadId: item.id, filename: item.filename, url: item.url })
  );
  chrome.downloads.onChanged.addListener((delta) =>
    sendEvent({ category: "downloads", type: "downloadChanged", downloadId: delta.id, state: delta.state, paused: delta.paused, bytesReceived: delta.bytesReceived })
  );
  chrome.debugger.onEvent.addListener((source, method, params) => {
    const tabId = source?.tabId;
    if (!Number.isInteger(tabId)) return;
    if (method === "Fetch.requestPaused" && params?.resourceType === "Document") {
      const barrier = navigationBarriers.get(tabId);
      if (barrier && typeof params.requestId === "string") barrier.pausedRequestIds.push(params.requestId);
      return;
    }
    recordMainFrameEpoch(tabId, method, params);
    recordExecutionContextScope(tabId, method, params);
    if (networkTrackerAttached.has(tabId)) trackNetworkEvent(tabId, method, params);
    const subscribed = cdpSubscriptions.get(tabId);
    const collectsConsole = consoleLogAttached.has(tabId) && CONSOLE_LOG_METHODS.includes(method);
    if (!collectsConsole && (!subscribed || !subscribed.has(method))) return;
    const provenance = cdpEventPageProvenance(tabId, method, params);
    if (collectsConsole) {
      appendConsoleLog(tabId, method, params, provenance);
    }
    sendEvent({
      category: "cdp", type: "cdpEvent", tabId, method,
      ...(provenance ? { ...provenance, params } : { provenance: "unverified" })
    });
  });
  chrome.debugger.onDetach.addListener((source, reason) => {
    const tabId = source?.tabId;
    if (Number.isInteger(tabId)) {
      cdpSubscriptions.delete(tabId);
      consoleLogBuffers.delete(tabId);
      consoleLogBufferChars.delete(tabId);
      consoleLogAttached.delete(tabId);
      cdpEventAttached.delete(tabId);
      networkTrackerAttached.delete(tabId);
      networkCaptureAttached.delete(tabId);
      networkWaitConsumers.delete(tabId);
      networkRequestStates.delete(tabId);
      cdpEnabledDomains.delete(tabId);
      executionContextScopes.delete(tabId);
      tabMainFrameEpochs.delete(tabId);
      observedMainFrames.delete(tabId);
      tabNavigationAttempts.delete(tabId);
      retiredMainFrameLoaders.delete(tabId);
      sendEvent({ category: "cdp", type: "cdpDetached", tabId, reason });
    }
  });
}

async function refreshTabPageProvenance(tabId) {
  const tab = await chrome.tabs.get(tabId);
  const current = await currentPageBinding(tabId, tab.url);
  tabPageProvenance.set(tabId, {
    documentId: current.documentId,
    navigationGeneration: current.navigationGeneration,
    pageScope: current.pageScope
  });
  const epoch = tabMainFrameEpochs.get(tabId);
  if (epoch && epoch.documentId !== current.documentId) tabMainFrameEpochs.delete(tabId);
}

function updateTabPageProvenanceFromTab(tabId, tab, navigationGeneration) {
  const pageScope = safeCanonicalPermissionScope(tab?.url);
  if (!pageScope) {
    tabPageProvenance.delete(tabId);
    return;
  }
  tabPageProvenance.set(tabId, {
    documentId: `generation:${navigationGeneration}`,
    navigationGeneration,
    pageScope
  });
}

function safeCanonicalPermissionScope(value) {
  try { return canonicalPermissionScope(value); } catch { return null; }
}

function recordExecutionContextScope(tabId, method, params) {
  if (method === "Runtime.executionContextsCleared") {
    executionContextScopes.delete(tabId);
    return;
  }
  if (method === "Runtime.executionContextDestroyed" && Number.isInteger(params?.executionContextId)) {
    executionContextScopes.get(tabId)?.delete(params.executionContextId);
    return;
  }
  if (method !== "Runtime.executionContextCreated") return;
  const context = params?.context;
  const pageScope = safeCanonicalPermissionScope(context?.origin);
  const current = tabPageProvenance.get(tabId);
  const epoch = tabMainFrameEpochs.get(tabId);
  if (!Number.isInteger(context?.id)
    || !pageScope
    || !current
    || !epoch
    || context?.auxData?.isDefault !== true
    || context?.auxData?.frameId !== epoch.frameId
    || epoch.documentId !== current.documentId
    || epoch.navigationGeneration !== current.navigationGeneration
    || permissionOrigin(pageScope) !== permissionOrigin(current.pageScope)) return;
  let contexts = executionContextScopes.get(tabId);
  if (!contexts) {
    contexts = new Map();
    executionContextScopes.set(tabId, contexts);
  }
  contexts.set(context.id, { ...epoch, contextOrigin: permissionOrigin(pageScope), tabId });
}

function cdpEventPageProvenance(tabId, method, params) {
  const contextId = Number.isInteger(params?.executionContextId)
    ? params.executionContextId
    : Number.isInteger(params?.exceptionDetails?.executionContextId)
      ? params.exceptionDetails.executionContextId
      : method === "Runtime.executionContextCreated" && Number.isInteger(params?.context?.id)
        ? params.context.id
        : null;
  let provenance = contextId === null ? null : executionContextScopes.get(tabId)?.get(contextId) ?? null;
  const epoch = tabMainFrameEpochs.get(tabId);
  if (!provenance && epoch
    && typeof params?.frameId === "string"
    && typeof params?.loaderId === "string"
    && params.frameId === epoch.frameId
    && params.loaderId === epoch.loaderId) provenance = epoch;
  const current = tabPageProvenance.get(tabId);
  if (!provenance
    || !current
    || provenance.documentId !== current.documentId
    || provenance.navigationGeneration !== current.navigationGeneration
    || provenance.pageScope !== current.pageScope) return null;
  return {
    documentId: provenance.documentId,
    frameId: provenance.frameId,
    loaderId: provenance.loaderId,
    navigationGeneration: provenance.navigationGeneration,
    pageScope: provenance.pageScope
  };
}

function recordMainFrameEpoch(tabId, method, params) {
  if (method !== "Page.frameNavigated") return;
  const frame = params?.frame;
  if (!frame || frame.parentId != null || typeof frame.id !== "string" || typeof frame.loaderId !== "string") return;
  const pageScope = safeCanonicalPermissionScope(frame.url);
  if (!pageScope) return;
  observeMainFrame(tabId, {
    frameId: frame.id,
    loaderId: frame.loaderId,
    pageScope
  });
}

function observeMainFrame(tabId, frame) {
  if (retiredMainFrameLoaders.get(tabId)?.has(frame.loaderId)) return;
  let attempt = tabNavigationAttempts.get(tabId);
  const current = tabPageProvenance.get(tabId);
  if (!attempt && current && frame.pageScope !== current.pageScope) {
    attempt = { destinationScope: frame.pageScope, phase: "pending", token: navigationAttemptSequence++ };
    tabNavigationAttempts.set(tabId, attempt);
  }
  observedMainFrames.set(tabId, {
    ...frame,
    attemptToken: attempt?.token ?? null
  });
  reconcileMainFrameEpoch(tabId);
}

function reconcileMainFrameEpoch(tabId, { discardMismatch = false } = {}) {
  const current = tabPageProvenance.get(tabId);
  const observed = observedMainFrames.get(tabId);
  const attempt = tabNavigationAttempts.get(tabId);
  const expectedToken = attempt?.phase === "committed" ? attempt.token : null;
  if (!current
    || !observed
    || attempt?.phase === "pending"
    || observed.attemptToken !== expectedToken
    || observed.pageScope !== current.pageScope) {
    tabMainFrameEpochs.delete(tabId);
    if (discardMismatch && current && observed && observed.pageScope !== current.pageScope) {
      observedMainFrames.delete(tabId);
    }
    return;
  }
  tabMainFrameEpochs.set(tabId, {
    ...observed,
    documentId: current.documentId,
    navigationGeneration: current.navigationGeneration
  });
  if (networkTrackerAttached.has(tabId)) {
    rotateNetworkStateToEpoch(tabId, tabMainFrameEpochs.get(tabId));
  }
}

function invalidateProvenanceForNavigationAttempt(tabId, details) {
  const activeAttempt = tabNavigationAttempts.get(tabId);
  const previousPage = tabPageProvenance.get(tabId) ?? activeAttempt?.previousPage;
  const previousEpoch = tabMainFrameEpochs.get(tabId) ?? activeAttempt?.previousEpoch;
  const retired = retiredMainFrameLoaders.get(tabId) ?? new Set();
  const currentLoaderId = previousEpoch?.loaderId ?? observedMainFrames.get(tabId)?.loaderId;
  if (typeof currentLoaderId === "string") {
    retired.add(currentLoaderId);
    while (retired.size > 20) retired.delete(retired.values().next().value);
    retiredMainFrameLoaders.set(tabId, retired);
  }
  executionContextScopes.delete(tabId);
  tabMainFrameEpochs.delete(tabId);
  observedMainFrames.delete(tabId);
  consoleLogBuffers.delete(tabId);
  consoleLogBufferChars.delete(tabId);
  tabNavigationAttempts.set(tabId, {
    beforeDocumentId: typeof details?.documentId === "string" ? details.documentId : previousPage?.documentId,
    destinationScope: safeCanonicalPermissionScope(details?.url),
    phase: "pending",
    previousEpoch: previousEpoch ? { ...previousEpoch } : null,
    previousPage: previousPage ? { ...previousPage } : null,
    startedAt: Number.isFinite(details?.timeStamp) ? details.timeStamp : null,
    token: navigationAttemptSequence++
  });
}

async function recoverProvenanceAfterNavigationError(details) {
  if (details?.frameId !== 0 || !Number.isInteger(details?.tabId)) return;
  const tabId = details.tabId;
  const attempt = tabNavigationAttempts.get(tabId);
  if (!attempt || attempt.phase !== "pending") return;
  const errorScope = safeCanonicalPermissionScope(details.url);
  if (attempt.destinationScope && errorScope !== attempt.destinationScope) return;
  if (attempt.startedAt !== null && Number.isFinite(details.timeStamp) && details.timeStamp < attempt.startedAt) return;
  const token = attempt.token;
  let current;
  try { current = await currentPageBinding(tabId); } catch { current = null; }
  const currentAttempt = tabNavigationAttempts.get(tabId);
  if (currentAttempt?.token !== token || currentAttempt.phase !== "pending") return;
  const previousPage = attempt.previousPage;
  const previousEpoch = attempt.previousEpoch;
  const proven = Boolean(current
    && previousPage
    && previousEpoch
    && current.documentId === previousPage.documentId
    && current.pageScope === previousPage.pageScope);
  if (!proven) {
    tabNavigationAttempts.delete(tabId);
    executionContextScopes.delete(tabId);
    tabMainFrameEpochs.delete(tabId);
    observedMainFrames.delete(tabId);
    await releaseDebuggers({ tabIds: [tabId] }).catch(() => {});
    return;
  }
  tabNavigationAttempts.delete(tabId);
  const retired = retiredMainFrameLoaders.get(tabId);
  retired?.delete(previousEpoch.loaderId);
  if (retired?.size === 0) retiredMainFrameLoaders.delete(tabId);
  tabPageProvenance.set(tabId, {
    documentId: current.documentId,
    navigationGeneration: current.navigationGeneration,
    pageScope: current.pageScope
  });
  observedMainFrames.set(tabId, {
    attemptToken: null,
    frameId: previousEpoch.frameId,
    loaderId: previousEpoch.loaderId,
    pageScope: previousEpoch.pageScope
  });
  executionContextScopes.delete(tabId);
  reconcileMainFrameEpoch(tabId);
}

function permissionOrigin(value) {
  try {
    const parsed = new URL(value);
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    return `${parsed.protocol}//${parsed.hostname}:${port}`;
  } catch {
    return null;
  }
}

const CDP_METHOD_RE = /^[A-Za-z][A-Za-z0-9]*\.[A-Za-z][A-Za-z0-9]*$/u;
const VALID_MOUSE_BUTTONS = new Set(["left", "middle", "right"]);

async function subscribeCdpEvents(params, pageGuard) {
  const tabId = requireTabId(params);
  await refreshTabPageProvenance(tabId);
  const methods = Array.isArray(params.methods) ? params.methods : [];
  if (methods.length === 0 || methods.length > MAX_CDP_METHODS || !methods.every(isValidCdpMethod)) {
    throw new Error("methods must be a non-empty array of CDP method strings in 'Domain.method' format");
  }
  if (methods.some((method) => method.startsWith("Fetch."))) {
    throw new Error("Fetch-domain CDP subscriptions are not allowed because navigation requests require exclusive barrier ownership");
  }
  let subscribed = cdpSubscriptions.get(tabId);
  const previous = new Set(subscribed ?? []);
  subscribed = new Set(previous);
  for (const method of methods) subscribed.add(method);
  if (subscribed.size > MAX_CDP_METHODS) {
    throw new Error(`a tab can subscribe to at most ${MAX_CDP_METHODS} CDP methods per tab`);
  }
  cdpSubscriptions.set(tabId, subscribed);
  try {
    await pageGuard?.();
    await ensureCdpEventDebugger(tabId, methods);
  } catch (error) {
    if (previous.size === 0) cdpSubscriptions.delete(tabId);
    else cdpSubscriptions.set(tabId, previous);
    throw error;
  }
  return { tabId, subscribed: [...subscribed] };
}

async function unsubscribeCdpEvents(params, pageGuard) {
  const tabId = requireTabId(params);
  const methods = Array.isArray(params.methods) ? params.methods : [];
  if (methods.length > MAX_CDP_METHODS) {
    throw new Error(`methods must contain at most ${MAX_CDP_METHODS} CDP methods`);
  }
  if (methods.length > 0 && !methods.every(isValidCdpMethod)) {
    throw new Error("methods must be CDP method strings in 'Domain.method' format");
  }
  if (methods.length === 0) {
    await pageGuard?.();
    cdpSubscriptions.delete(tabId);
    await detachCdpEventDebuggerIfIdle(tabId);
    return { tabId, subscribed: [] };
  }
  const subscribed = cdpSubscriptions.get(tabId);
  if (subscribed) {
    for (const method of methods) subscribed.delete(method);
    if (subscribed.size === 0) cdpSubscriptions.delete(tabId);
  }
  await pageGuard?.();
  await detachCdpEventDebuggerIfIdle(tabId);
  return { tabId, subscribed: subscribed ? [...subscribed] : [] };
}

async function getConsoleLogs(params, pageGuard) {
  const tabId = requireTabId(params);
  const clear = params.clear === true;
  const autoAttach = params.autoAttach !== false;
  if (autoAttach) {
    await pageGuard?.();
    await ensureConsoleLogDebugger(tabId);
  }
  const buffer = consoleLogBuffers.get(tabId);
  const logs = buffer ? buffer.slice() : [];
  if (clear && buffer) {
    buffer.length = 0;
    consoleLogBufferChars.set(tabId, 0);
  }
  return {
    tabId,
    count: logs.length,
    attached: consoleLogAttached.has(tabId),
    logs
  };
}

async function getNetworkRequests(params, signal, pageGuard) {
  throwIfAborted(signal);
  assertNetworkRequestFields(params);
  const tabId = requireTabId(params);
  const clear = optionalStrictBoolean(params.clear, false, "clear");
  const autoAttach = optionalStrictBoolean(params.autoAttach, true, "autoAttach");
  const failuresOnly = optionalStrictBoolean(params.failuresOnly, false, "failuresOnly");
  const methods = optionalNetworkStringArray(params.methods, "methods", 20, true);
  const resourceTypes = optionalNetworkStringArray(params.resourceTypes, "resourceTypes", 50, false);
  const urlContains = params.urlContains == null
    ? null
    : requireBoundedNetworkString(params.urlContains, "urlContains", MAX_NETWORK_FILTER_CHARS);
  const statusMin = optionalNetworkStatus(params.statusMin, "statusMin");
  const statusMax = optionalNetworkStatus(params.statusMax, "statusMax");
  if (statusMin !== null && statusMax !== null && statusMin > statusMax) {
    throw new Error("statusMin must be less than or equal to statusMax");
  }
  const since = strictNetworkInteger(params.since, 0, Number.MAX_SAFE_INTEGER, 0, "since");
  const limit = strictNetworkInteger(params.limit, 1, MAX_NETWORK_RESULT_LIMIT, 100, "limit");
  if (autoAttach) {
    await pageGuard?.();
    await ensureNetworkCaptureDebugger(tabId, signal);
  }
  throwIfAborted(signal);

  const state = networkRequestStates.get(tabId);
  const clearedThroughCursor = state?.clearedThroughCursor ?? 0;
  const all = state
    ? [...state.requests.values()]
      .map(publicNetworkEntry)
      .filter((entry) => entry.cursor > clearedThroughCursor)
      .sort((left, right) => left.cursor - right.cursor)
    : [];
  const matching = all.filter((entry) => entry.cursor > Math.max(since, clearedThroughCursor)
    && (methods.length === 0 || methods.includes(entry.method))
    && (resourceTypes.length === 0 || resourceTypes.includes(entry.resourceType))
    && (urlContains === null || entry.url.includes(urlContains))
    && (statusMin === null || (entry.status !== null && entry.status >= statusMin))
    && (statusMax === null || (entry.status !== null && entry.status <= statusMax))
    && (!failuresOnly || entry.failure !== null));
  const requests = matching.slice(0, limit);
  const cursors = all.map((entry) => entry.cursor);
  const latest = state ? state.nextCursor - 1 : 0;
  const hasMore = matching.length > requests.length;
  const cursor = {
    clearedThroughCursor,
    dropped: state?.dropped ?? 0,
    hasMore,
    latest,
    next: hasMore ? requests.at(-1).cursor : latest,
    oldest: cursors.length > 0 ? Math.min(...cursors) : null,
    overflowed: state?.overflowed === true
  };
  if (clear && state) {
    state.clearedThroughCursor = latest;
    for (const [requestId, entry] of state.requests) {
      if (entry.inFlight !== true) removeNetworkEntry(state, requestId, false);
    }
    cursor.clearedThroughCursor = latest;
    cursor.hasMore = false;
    cursor.next = latest;
    cursor.oldest = null;
  }
  throwIfAborted(signal);
  return {
    attached: networkCaptureAttached.has(tabId),
    count: requests.length,
    cursor,
    requests,
    tabId
  };
}

async function getPageAssets(params, signal, pageGuard) {
  const tabId = requireTabId(params);
  const includeContent = params.includeContent === true;
  const unsupported = Object.keys(params).filter((key) => ![
    "tabId", "includeContent", "maxTotalBytes", "__expectedScopes", "__expectedDocumentId"
  ].includes(key));
  if (unsupported.length > 0) throw new Error(`pageAssets contains unsupported fields: ${unsupported.join(", ")}`);
  const maxTotalBytes = params.maxTotalBytes ?? 5 * 1024 * 1024;
  if (!Number.isInteger(maxTotalBytes) || maxTotalBytes < 1 || maxTotalBytes > MAX_PAGE_ASSET_TOTAL_BYTES) {
    throw new Error(`pageAssets maxTotalBytes must be between 1 and ${MAX_PAGE_ASSET_TOTAL_BYTES}`);
  }
  throwIfAborted(signal);
  const currentBinding = pageGuard
    ? await pageGuard()
    : await currentPageBinding(tabId, (await chrome.tabs.get(tabId)).url);
  const topLevelOrigin = pageAssetOrigin(currentBinding?.pageScope);
  if (!topLevelOrigin) throw new Error("pageAssets requires an HTTP or HTTPS top-level page");
  const domResults = await chrome.scripting.executeScript({
    target: { tabId },
    world: "ISOLATED",
    func: collectDomPageAssets
  });
  throwIfAborted(signal);
  await pageGuard?.();
  const domPayload = domResults?.[0]?.result;
  const domAssets = Array.isArray(domPayload)
    ? domPayload
    : Array.isArray(domPayload?.assets) ? domPayload.assets : [];
  let sawOverflow = domPayload?.sawOverflow === true;

  const cdpAssets = await withPersistentDebuggerMutation(tabId, async (target, scoped) => {
    let attachedHere = false;
    try {
      if (!scoped && !isPersistentDebuggerAttached(tabId)) {
        await chrome.debugger.attach(target, DEBUGGER_VERSION);
        attachedHere = true;
      }
      throwIfAborted(signal);
      const tree = await chrome.debugger.sendCommand(target, "Page.getResourceTree", {});
      throwIfAborted(signal);
      return flattenCdpResourceTree(tree?.frameTree);
    } finally {
      if (attachedHere) await chrome.debugger.detach(target).catch(() => {});
    }
  });
  await pageGuard?.();

  sawOverflow ||= cdpAssets.sawOverflow === true;
  const assetsByUrl = new Map();
  const addCandidates = (candidates) => {
    for (const candidate of candidates) {
      const asset = normalizePageAssetInventoryEntry(candidate);
      if (!asset) continue;
      const existing = assetsByUrl.get(asset.rawUrl);
      if (existing) {
        if (typeof asset.frameId === "string") existing.frameId = asset.frameId;
        if (!existing.mimeType && asset.mimeType) existing.mimeType = asset.mimeType;
        continue;
      }
      if (assetsByUrl.size >= MAX_PAGE_ASSETS) {
        sawOverflow = true;
        break;
      }
      assetsByUrl.set(asset.rawUrl, asset);
    }
  };
  addCandidates(domAssets);
  if (!sawOverflow || assetsByUrl.size < MAX_PAGE_ASSETS) addCandidates(cdpAssets.assets);
  const assets = [...assetsByUrl.values()];
  let totalBytes = 0;
  if (includeContent) {
    await withPersistentDebuggerMutation(tabId, async (target, scoped) => {
      let attachedHere = false;
      try {
        if (!scoped && !isPersistentDebuggerAttached(tabId)) {
          await chrome.debugger.attach(target, DEBUGGER_VERSION);
          attachedHere = true;
        }
        for (const asset of assets) {
          throwIfAborted(signal);
          await pageGuard?.();
          if (typeof asset.frameId !== "string") {
            asset.error = "Content is unavailable through CDP";
            continue;
          }
          if (pageAssetOrigin(asset.rawUrl) !== topLevelOrigin) {
            asset.error = "Cross-origin content is not fetched";
            continue;
          }
          try {
            const response = await chrome.debugger.sendCommand(target, "Page.getResourceContent", {
              frameId: asset.frameId,
              url: asset.rawUrl
            });
            if (typeof response?.content !== "string") throw new Error("CDP returned invalid resource content");
            const bytes = response.base64Encoded === true
              ? pageAssetDecodedBase64Bytes(response.content)
              : new TextEncoder().encode(response.content).byteLength;
            if (totalBytes + bytes > maxTotalBytes) {
              asset.truncated = true;
              asset.error = "Content omitted by total byte limit";
              continue;
            }
            totalBytes += bytes;
            asset.content = response.content;
            asset.base64Encoded = response.base64Encoded === true;
          } catch (error) {
            asset.error = truncateString(error?.message ?? String(error), 500);
          }
        }
      } finally {
        if (attachedHere) await chrome.debugger.detach(target).catch(() => {});
      }
    });
  }
  for (const asset of assets) {
    delete asset.frameId;
    delete asset.rawUrl;
  }
  return {
    assets,
    count: assets.length,
    includeContent,
    maxTotalBytes,
    totalBytes,
    truncated: sawOverflow || assets.some((asset) => asset.truncated === true)
  };
}

function collectDomPageAssets() {
  const MAX_ASSETS = 2_000;
  const MAX_SCAN_NODES = 20_000;
  const found = [];
  const seen = new Set();
  let sawOverflow = false;
  const add = (url, kind, mimeType = "") => {
    if (typeof url !== "string" || url.length === 0) return;
    try {
      const normalized = new URL(url, document.baseURI).href;
      if (seen.has(normalized)) return;
      if (found.length >= MAX_ASSETS) {
        sawOverflow = true;
        return;
      }
      seen.add(normalized);
      found.push({ url: normalized, kind, mimeType });
    } catch {}
  };
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
  let node = walker.currentNode;
  let scanned = 0;
  while (node && scanned < MAX_SCAN_NODES && !sawOverflow) {
    scanned += 1;
    const tag = node.tagName.toLowerCase();
    if (["script", "link", "img", "source", "video", "audio", "iframe", "object"].includes(tag)) {
      const url = node.src || node.href || node.data;
      const kind = tag === "link" ? (node.rel || "link") : tag;
      add(url, kind, node.type || "");
    }
    node = walker.nextNode();
  }
  if (node) sawOverflow = true;
  if (!sawOverflow) {
    const performanceEntries = performance.getEntriesByType("resource");
    for (let index = 0; index < performanceEntries.length && !sawOverflow; index += 1) {
      const entry = performanceEntries[index];
      add(entry.name, entry.initiatorType || "resource");
    }
  }
  return { assets: found, sawOverflow };
}

function flattenCdpResourceTree(frameTree) {
  const assets = [];
  const seen = new Set();
  const pending = frameTree && typeof frameTree === "object" ? [frameTree] : [];
  let scannedFrames = 0;
  let sawOverflow = false;
  while (pending.length > 0 && !sawOverflow) {
    if (scannedFrames >= MAX_PAGE_ASSET_FRAMES) {
      sawOverflow = true;
      break;
    }
    const current = pending.pop();
    scannedFrames += 1;
    const frameId = typeof current.frame?.id === "string" ? current.frame.id : null;
    const resources = Array.isArray(current.resources) ? current.resources : [];
    for (let index = 0; index < resources.length; index += 1) {
      const resource = resources[index];
      if (typeof resource?.url !== "string" || seen.has(resource.url)) continue;
      if (assets.length >= MAX_PAGE_ASSETS) {
        sawOverflow = true;
        break;
      }
      seen.add(resource.url);
      assets.push({ url: resource.url, kind: resource.type, mimeType: resource.mimeType, frameId });
    }
    const children = Array.isArray(current.childFrames) ? current.childFrames : [];
    for (let index = children.length - 1; index >= 0; index -= 1) {
      if (pending.length + scannedFrames >= MAX_PAGE_ASSET_FRAMES) {
        sawOverflow = true;
        break;
      }
      pending.push(children[index]);
    }
  }
  return { assets, sawOverflow };
}

function normalizePageAssetInventoryEntry(value) {
  if (!value || typeof value !== "object" || typeof value.url !== "string" || value.url.length > 8192) return null;
  let parsed;
  try { parsed = new URL(value.url); } catch { return null; }
  if (!["http:", "https:", "data:", "blob:"].includes(parsed.protocol)) return null;
  return {
    rawUrl: parsed.href,
    url: redactNetworkUrl(parsed.href),
    kind: typeof value.kind === "string" ? truncateString(value.kind, 50) : "other",
    mimeType: typeof value.mimeType === "string" ? truncateString(value.mimeType, 255) : "",
    frameId: typeof value.frameId === "string" ? value.frameId : undefined,
    truncated: false
  };
}

function pageAssetOrigin(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.origin : null;
  } catch {
    return null;
  }
}

function pageAssetDecodedBase64Bytes(value) {
  if (value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/u.test(value)) {
    throw new Error("CDP returned invalid base64 resource content");
  }
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  return (value.length / 4) * 3 - padding;
}

async function createNotification(params) {
  if (!isRecord(params)) throw new Error("notify params must be an object");
  const unsupported = Object.keys(params).filter((key) => !["title", "message"].includes(key));
  if (unsupported.length > 0) throw new Error(`notify contains unsupported fields: ${unsupported.join(", ")}`);
  if (typeof params.title !== "string" || params.title.length < 1 || params.title.length > MAX_NOTIFICATION_TITLE_CHARS) {
    throw new Error(`notification title must be between 1 and ${MAX_NOTIFICATION_TITLE_CHARS} characters`);
  }
  if (typeof params.message !== "string" || params.message.length < 1 || params.message.length > MAX_NOTIFICATION_MESSAGE_CHARS) {
    throw new Error(`notification message must be between 1 and ${MAX_NOTIFICATION_MESSAGE_CHARS} characters`);
  }
  const id = `opencode-${Date.now().toString(36)}-${crypto.randomUUID()}`;
  await chrome.notifications.create(id, {
    type: "basic",
    iconUrl: "images/icon128.png",
    title: params.title,
    message: params.message
  });
  return { id, notified: true };
}

function assertNetworkRequestFields(params) {
  const allowed = [
    "tabId", "methods", "resourceTypes", "statusMin", "statusMax", "urlContains",
    "failuresOnly", "since", "limit", "clear", "autoAttach"
  ];
  const unsupported = Object.keys(params).filter((field) => !allowed.includes(field));
  if (unsupported.length > 0) throw new Error(`networkRequests contains unsupported fields: ${unsupported.join(", ")}`);
}

function optionalStrictBoolean(value, fallback, name) {
  if (value == null) return fallback;
  if (typeof value !== "boolean") throw new Error(`${name} must be a boolean`);
  return value;
}

function optionalNetworkStringArray(value, name, maxChars, uppercase) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > MAX_NETWORK_FILTER_VALUES) {
    throw new Error(`${name} must be an array of at most ${MAX_NETWORK_FILTER_VALUES} strings`);
  }
  return value.map((entry) => {
    const normalized = requireBoundedNetworkString(entry, name, maxChars);
    return uppercase ? normalized.toUpperCase() : normalized;
  });
}

function requireBoundedNetworkString(value, name, maxChars) {
  if (typeof value !== "string" || value.length === 0 || value.length > maxChars) {
    throw new Error(`${name} must be a non-empty string of at most ${maxChars} characters`);
  }
  return value;
}

function optionalNetworkStatus(value, name) {
  if (value == null) return null;
  return strictNetworkInteger(value, 0, 999, null, name);
}

function strictNetworkInteger(value, min, max, fallback, name) {
  if (value == null) return fallback;
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer from ${min} to ${max}`);
  }
  return value;
}

async function setCursorState(params) {
  const tabId = requireTabId(params);
  const state = params.state;
  if (!["active", "handoff", "deliverable", "hidden", "abort"].includes(state)) {
    throw new Error("state must be active, handoff, deliverable, hidden, or abort");
  }
  const response = await notifyOverlay(tabId, "cursor-state", { state, expectedScopes: params.__expectedScopes }, params.__expectedDocumentId);
  if (params.__expectedScopes && response?.authorized !== true) throw new Error(`Page scope changed or is not authorized: ${response?.scope ?? "unknown"}`);
  return { tabId, state };
}

async function setFaviconBadge(params) {
  const tabId = requireTabId(params);
  const badge = params.badge ?? null;
  if (badge !== null && !["active", "handoff", "deliverable"].includes(badge)) {
    throw new Error("badge must be active, handoff, deliverable, or null");
  }
  const response = await notifyOverlay(tabId, "favicon-badge", { badge, expectedScopes: params.__expectedScopes }, params.__expectedDocumentId);
  if (params.__expectedScopes && response?.authorized !== true) throw new Error(`Page scope changed or is not authorized: ${response?.scope ?? "unknown"}`);
  return { tabId, badge };
}

const MAX_A11Y_REF_CHARS = 50;
const MAX_BLOCKED_URL_PATTERNS = 500;
const MAX_BLOCKED_URL_PATTERN_CHARS = 500;

async function injectA11yScript(tabId) {
  await chrome.scripting.executeScript({ target: { tabId }, files: ["content-scripts/a11y.js"] });
}

async function runInA11yWorld(tabId, func, args, documentId) {
  const target = typeof documentId === "string" ? { tabId, documentIds: [documentId] } : { tabId };
  const results = await chrome.scripting.executeScript({ target, func, args });
  const result = results?.[0]?.result;
  if (result == null) throw new Error("Accessibility script did not return a result");
  return result;
}

function randomUploadTransferId() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `u_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

async function cleanupExpiredFileUploads() {
  const now = Date.now();
  for (const [transferId, transfer] of uploadTransfers) {
    if (now <= transfer.expiresAt) continue;
    uploadTransfers.delete(transferId);
    try {
      await injectA11yScript(transfer.tabId);
      await runInA11yWorld(
        transfer.tabId,
        (action, payload) => window.__opencodeA11yUpload?.(action, payload) ?? null,
        ["abort", { transferId }]
      );
    } catch {}
  }
}

function validateUploadFiles(params) {
  if (!Array.isArray(params.files) || params.files.length < 1) throw new Error("upload requires at least one file");
  if (params.files.length > MAX_UPLOAD_FILES) throw new Error(`upload supports at most ${MAX_UPLOAD_FILES} files`);
  const files = params.files.map((file) => {
    if (!isRecord(file)
      || typeof file.name !== "string" || file.name.length < 1 || file.name.length > MAX_UPLOAD_NAME_CHARS
      || file.name.includes("/") || file.name.includes("\\")
      || !Number.isSafeInteger(file.size) || file.size < 0
      || typeof file.type !== "string" || file.type.length > MAX_UPLOAD_MIME_CHARS
      || !Number.isInteger(file.chunkCount) || file.chunkCount < 0 || file.chunkCount > MAX_UPLOAD_CHUNKS
      || (file.size === 0) !== (file.chunkCount === 0)) {
      throw new Error("upload file metadata is invalid");
    }
    return { chunkCount: file.chunkCount, name: file.name, nextChunk: 0, receivedBytes: 0, size: file.size, type: file.type };
  });
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (!Number.isSafeInteger(params.totalBytes) || params.totalBytes !== totalBytes || totalBytes > MAX_UPLOAD_TOTAL_BYTES) {
    throw new Error(`upload total bytes must match file metadata and not exceed ${MAX_UPLOAD_TOTAL_BYTES}`);
  }
  if (files.reduce((total, file) => total + file.chunkCount, 0) > MAX_UPLOAD_CHUNKS) {
    throw new Error(`upload supports at most ${MAX_UPLOAD_CHUNKS} chunks`);
  }
  return { files, totalBytes };
}

async function beginFileUpload(params, signal) {
  throwIfAborted(signal);
  await cleanupExpiredFileUploads();
  const tabId = requireTabId(params);
  const { files, totalBytes } = validateUploadFiles(params);
  if (uploadTransfers.size >= MAX_CONCURRENT_UPLOADS) throw new Error("upload concurrent staging limit reached");
  const stagedBytes = [...uploadTransfers.values()].reduce((total, transfer) => total + transfer.totalBytes, 0);
  if (stagedBytes + totalBytes > MAX_UPLOAD_TOTAL_BYTES) throw new Error("upload staging byte limit reached");
  const transferId = randomUploadTransferId();
  let nextFileIndex = 0;
  while (nextFileIndex < files.length && files[nextFileIndex].chunkCount === 0) nextFileIndex += 1;
  const transfer = { expiresAt: Date.now() + UPLOAD_TRANSFER_TTL_MS, files, nextFileIndex, tabId, totalBytes };
  uploadTransfers.set(transferId, transfer);
  try {
    await injectA11yScript(tabId);
    throwIfAborted(signal);
    const result = await runInA11yWorld(
      tabId,
      (action, payload) => window.__opencodeA11yUpload?.(action, payload) ?? null,
      ["begin", { transferId, expiresAt: transfer.expiresAt, files: files.map(({ chunkCount, name, size, type }) => ({ chunkCount, name, size, type })) }]
    );
    if (result.accepted !== true) throw new Error("isolated upload staging rejected the transfer");
    return { expiresAt: transfer.expiresAt, transferId };
  } catch (error) {
    uploadTransfers.delete(transferId);
    throw error;
  }
}

function requireUploadTransfer(params) {
  if (typeof params.transferId !== "string") throw new Error("upload transferId is invalid");
  const transfer = uploadTransfers.get(params.transferId);
  if (!transfer || Date.now() > transfer.expiresAt) {
    uploadTransfers.delete(params.transferId);
    throw new Error("upload transfer is unknown or expired");
  }
  return transfer;
}

function decodedBase64Bytes(value) {
  if (typeof value !== "string" || value.length === 0
    || value.length > Math.ceil(MAX_UPLOAD_CHUNK_BYTES / 3) * 4 + 4
    || !/^[A-Za-z0-9+/]*={0,2}$/u.test(value)) throw new Error("upload chunk data is invalid");
  try {
    return atob(value).length;
  } catch {
    throw new Error("upload chunk data is invalid base64");
  }
}

async function appendFileUploadChunk(params, signal) {
  throwIfAborted(signal);
  await cleanupExpiredFileUploads();
  const transfer = requireUploadTransfer(params);
  const file = transfer.files[params.fileIndex];
  if (!file || !Number.isInteger(params.fileIndex)) throw new Error("upload file index is invalid");
  if (params.fileIndex !== transfer.nextFileIndex) throw new Error("upload chunk is out of order");
  if (!Number.isInteger(params.chunkIndex) || params.chunkIndex !== file.nextChunk) {
    throw new Error("upload chunk is duplicate or out of order");
  }
  if (params.chunkIndex >= file.chunkCount) throw new Error("upload chunk is out of order");
  const byteLength = decodedBase64Bytes(params.data);
  if (byteLength > MAX_UPLOAD_CHUNK_BYTES || file.receivedBytes + byteLength > file.size) {
    throw new Error("upload chunk exceeds declared bounds");
  }
  const expiresAt = Date.now() + UPLOAD_TRANSFER_TTL_MS;
  const result = await runInA11yWorld(
    transfer.tabId,
    (action, payload) => window.__opencodeA11yUpload?.(action, payload) ?? null,
    ["chunk", { transferId: params.transferId, fileIndex: params.fileIndex, chunkIndex: params.chunkIndex, data: params.data, expiresAt }]
  );
  throwIfAborted(signal);
  if (result.accepted !== true) throw new Error("isolated upload staging rejected the chunk");
  file.nextChunk += 1;
  file.receivedBytes += byteLength;
  if (file.nextChunk === file.chunkCount) {
    transfer.nextFileIndex += 1;
    while (transfer.nextFileIndex < transfer.files.length
      && transfer.files[transfer.nextFileIndex].chunkCount === 0) transfer.nextFileIndex += 1;
  }
  transfer.expiresAt = expiresAt;
  return { accepted: true, chunkIndex: params.chunkIndex, fileIndex: params.fileIndex, transferId: params.transferId };
}

async function commitFileUpload(params, signal) {
  throwIfAborted(signal);
  await cleanupExpiredFileUploads();
  const transfer = requireUploadTransfer(params);
  const tabId = requireTabId(params);
  const ref = requireElementRef(params);
  if (tabId !== transfer.tabId) throw new Error("upload transfer belongs to a different tab");
  for (const file of transfer.files) {
    if (file.nextChunk !== file.chunkCount || file.receivedBytes !== file.size) {
      throw new Error(`upload is missing chunk data for ${file.name}`);
    }
  }
  try {
    const expectedNames = transfer.files.map((file) => file.name);
    const prepared = await runInA11yWorld(
      tabId,
      (action, payload) => window.__opencodeA11yUpload?.(action, payload) ?? null,
      ["prepare", { transferId: params.transferId, ref }]
    );
    throwIfAborted(signal);
    if (prepared.prepared !== true || prepared.count !== expectedNames.length
      || !Array.isArray(prepared.names) || prepared.names.some((name, index) => name !== expectedNames[index])) {
      throw new Error("isolated upload preparation did not verify the exact files");
    }
    const committed = await runInA11yWorld(
      tabId,
      (action, payload, scopes) => {
        const port = location.port || (location.protocol === "https:" ? "443" : "80");
        const scope = `${location.protocol}//${location.hostname}:${port}${location.pathname || "/"}`;
        if (Array.isArray(scopes) && !scopes.includes(scope)) return { authorized: false, scope };
        return {
          authorized: true,
          scope,
          value: window.__opencodeA11yUpload?.(action, payload) ?? null
        };
      },
      ["commit", { transferId: params.transferId, ref }, params.__expectedScopes],
      params.__expectedDocumentId
    );
    if (committed.authorized !== true) {
      throw new Error(`Page scope changed or is not authorized: ${committed.scope ?? "unknown"}`);
    }
    const result = committed.value;
    if (result.committed !== true || result.count !== expectedNames.length
      || !Array.isArray(result.names) || result.names.some((name, index) => name !== expectedNames[index])) {
      throw new Error("isolated upload commit did not verify the exact files");
    }
    uploadTransfers.delete(params.transferId);
    return { ...result, ref, tabId };
  } catch (error) {
    await abortFileUpload({ transferId: params.transferId });
    throw error;
  }
}

async function abortFileUpload(params) {
  if (typeof params.transferId !== "string") throw new Error("upload transferId is invalid");
  const transfer = uploadTransfers.get(params.transferId);
  uploadTransfers.delete(params.transferId);
  if (!transfer) return { aborted: true, existed: false, transferId: params.transferId };
  try {
    await runInA11yWorld(
      transfer.tabId,
      (action, payload) => window.__opencodeA11yUpload?.(action, payload) ?? null,
      ["abort", { transferId: params.transferId }]
    );
  } catch {}
  return { aborted: true, existed: true, transferId: params.transferId };
}

async function accessibilityTree(params) {
  const tabId = requireTabId(params);
  const maxNodes = clampInteger(params.maxNodes, 1, 2000, 800, "maxNodes");
  const maxChars = clampInteger(params.maxChars, 100, 200000, 50000, "maxChars");
  const interactiveOnly = params.interactiveOnly === true;
  await injectA11yScript(tabId);
  const result = await runInA11yWorld(
    tabId,
    (options) => window.__opencodeA11yGenerate ? window.__opencodeA11yGenerate(options) : null,
    [{ maxNodes, maxChars, interactiveOnly }]
  );
  return { tabId, ...result };
}

async function tabContext(params, signal) {
  const tabId = requireTabId(params);
  const maxChars = clampInteger(params.maxChars, 100, 200000, 50000, "maxChars");
  const maxSelectionChars = clampInteger(params.maxSelectionChars, 1, 10000, 2000, "maxSelectionChars");
  throwIfAborted(signal);
  await injectA11yScript(tabId);
  throwIfAborted(signal);
  const result = await runInA11yWorld(
    tabId,
    (options) => window.__opencodeTabContext ? window.__opencodeTabContext(options) : null,
    [{ maxChars, maxSelectionChars }]
  );
  throwIfAborted(signal);
  validateTabContextResult(result, "tab context");
  return { tabId, ...result };
}

async function readPage(params, signal, pageGuard) {
  const tabId = requireTabId(params);
  const includeScreenshot = params.includeScreenshot === true;
  const options = {
    interactiveOnly: params.interactiveOnly === true,
    maxChars: clampInteger(params.maxChars, 100, 200000, 50000, "maxChars"),
    maxNodes: clampInteger(params.maxNodes, 1, 2000, 800, "maxNodes"),
    maxSelectionChars: clampInteger(params.maxSelectionChars, 1, 10000, 2000, "maxSelectionChars")
  };
  throwIfAborted(signal);
  await pageGuard?.();
  const activatedTab = includeScreenshot ? await activateTab(tabId, signal) : null;
  throwIfAborted(signal);
  await injectA11yScript(tabId);
  throwIfAborted(signal);
  const combined = await runInA11yWorld(
    tabId,
    (readOptions) => {
      if (!window.__opencodeTabContext || !window.__opencodeA11yGenerate) return null;
      return {
        context: window.__opencodeTabContext(readOptions),
        accessibility: window.__opencodeA11yGenerate(readOptions)
      };
    },
    [options]
  );
  throwIfAborted(signal);
  validateReadPageResult(combined);
  await pageGuard?.();
  let screenshot = null;
  if (includeScreenshot) {
    throwIfAborted(signal);
    const currentTab = await chrome.tabs.get(tabId);
    throwIfAborted(signal);
    if (!Number.isInteger(activatedTab.windowId)
      || currentTab.active !== true
      || currentTab.windowId !== activatedTab.windowId) {
      throw new Error("read page target tab changed before screenshot capture");
    }
    throwIfAborted(signal);
    screenshot = await captureScreenshot({
      format: params.screenshotFormat,
      quality: params.screenshotQuality,
      tabId,
      __alreadyActive: true,
      windowId: activatedTab.windowId
    }, signal, pageGuard);
    throwIfAborted(signal);
  }
  return {
    tabId,
    context: combined.context,
    accessibility: combined.accessibility,
    screenshot
  };
}

async function findElements(params, signal) {
  const tabId = requireTabId(params);
  if (typeof params.query !== "string" || params.query.trim().length === 0) {
    throw new Error("query must be a non-empty string");
  }
  const query = limitString(params.query, "query", MAX_FIND_QUERY_CHARS);
  let role;
  if (params.role != null) {
    if (typeof params.role !== "string" || params.role.trim().length === 0) {
      throw new Error("role must be a non-empty string when provided");
    }
    role = limitString(params.role, "role", MAX_FIND_ROLE_CHARS);
  }
  const options = {
    interactiveOnly: params.interactiveOnly === true,
    limit: clampInteger(params.limit, 1, MAX_FIND_RESULTS, 20, "limit"),
    query,
    role,
    visibleOnly: params.visibleOnly !== false
  };
  throwIfAborted(signal);
  await injectA11yScript(tabId);
  throwIfAborted(signal);
  const result = await runInA11yWorld(
    tabId,
    (findOptions) => window.__opencodeA11yFind ? window.__opencodeA11yFind(findOptions) : null,
    [options]
  );
  throwIfAborted(signal);
  validateFindElementsResult(result);
  return { tabId, ...result };
}

function validateFindElementsResult(result) {
  if (!isRecord(result)
    || typeof result.query !== "string"
    || result.query.length > MAX_FIND_QUERY_CHARS
    || !Array.isArray(result.matches)
    || result.matches.length > MAX_FIND_RESULTS
    || !Number.isInteger(result.totalMatches)
    || result.totalMatches < result.matches.length
    || typeof result.truncated !== "boolean") {
    throw new Error("find elements result is invalid");
  }
  for (const match of result.matches) {
    if (!isRecord(match)
      || Object.prototype.hasOwnProperty.call(match, "value")
      || typeof match.ref !== "string"
      || match.ref.length === 0
      || match.ref.length > MAX_A11Y_REF_CHARS
      || typeof match.role !== "string"
      || match.role.length > MAX_FIND_ROLE_CHARS
      || typeof match.name !== "string"
      || match.name.length > 500
      || typeof match.text !== "string"
      || match.text.length > 500
      || typeof match.score !== "number"
      || !Number.isFinite(match.score)
      || match.score <= 0
      || typeof match.visible !== "boolean"
      || typeof match.interactive !== "boolean") {
      throw new Error("find elements result is invalid");
    }
  }
}

async function browserBatch(params, { signal, pageGuard } = {}) {
  const batch = await validateBrowserBatch(params);
  const startedAt = Date.now();
  const deadline = startedAt + batch.totalTimeoutMs;
  const results = [];
  let stoppedAt = null;

  for (let index = 0; index < batch.actions.length; index += 1) {
    throwIfAborted(signal);
    const action = batch.actions[index];
    try {
      const result = await runBatchAction(action, index, deadline, batch.totalTimeoutMs, signal, pageGuard);
      results.push({ index, ok: true, result, type: action.type });
    } catch (error) {
      throwIfAborted(signal);
      results.push({
        error: truncateString(error?.message || String(error), MAX_NATIVE_ERROR_CHARS),
        index,
        ok: false,
        type: action.type
      });
      if (error?.batchActionTimeout === true || error?.batchTotalTimeout === true || batch.stopOnError) {
        stoppedAt = index;
        break;
      }
    }
  }

  return {
    completed: results.length,
    elapsedMs: Date.now() - startedAt,
    ok: results.length === batch.actions.length && results.every((result) => result.ok),
    results,
    stoppedAt,
    totalActions: batch.actions.length
  };
}

async function validateBrowserBatch(params) {
  if (!isRecord(params)) throw new Error("browser batch params must be an object");
  assertBatchFields(params, ["actions", "stopOnError", "totalTimeoutMs"], "browser batch");
  let serialized;
  try {
    serialized = JSON.stringify(params);
  } catch {
    throw new Error("browser batch payload must be JSON serializable");
  }
  if (new TextEncoder().encode(serialized).byteLength > MAX_BATCH_PAYLOAD_BYTES) {
    throw new Error(`browser batch payload is too large; max ${MAX_BATCH_PAYLOAD_BYTES} bytes`);
  }
  if (!Array.isArray(params.actions) || params.actions.length === 0) {
    throw new Error("browser batch requires at least one action");
  }
  if (params.actions.length > MAX_BATCH_ACTIONS) {
    throw new Error(`browser batch supports at most ${MAX_BATCH_ACTIONS} actions`);
  }
  if (params.stopOnError != null && typeof params.stopOnError !== "boolean") {
    throw new Error("browser batch stopOnError must be a boolean");
  }
  const totalTimeoutMs = strictBatchInteger(
    params.totalTimeoutMs,
    MIN_BATCH_TIMEOUT_MS,
    MAX_BATCH_TOTAL_TIMEOUT_MS,
    DEFAULT_BATCH_TOTAL_TIMEOUT_MS,
    "browser batch totalTimeoutMs"
  );
  const actions = [];
  for (let index = 0; index < params.actions.length; index += 1) {
    actions.push(await validateBatchAction(params.actions[index], index));
  }
  return { actions, stopOnError: params.stopOnError !== false, totalTimeoutMs };
}

async function validateBatchAction(action, index) {
  if (!isRecord(action)) throw new Error(`batch action ${index} must be an object`);
  assertBatchFields(action, ["params", "timeoutMs", "type"], `batch action ${index}`);
  if (typeof action.type !== "string" || !Object.prototype.hasOwnProperty.call(BATCH_ACTION_METHODS, action.type)) {
    throw new Error(`batch action ${index} type ${String(action.type)} is not allowed`);
  }
  if (!isRecord(action.params)) throw new Error(`batch action ${index} params must be an object`);
  const timeoutMs = strictBatchInteger(
    action.timeoutMs,
    MIN_BATCH_TIMEOUT_MS,
    MAX_BATCH_ACTION_TIMEOUT_MS,
    DEFAULT_BATCH_ACTION_TIMEOUT_MS,
    `batch action ${index} timeoutMs`
  );
  const normalizedParams = await validateBatchActionParams(action.type, action.params, index);
  return { params: normalizedParams, timeoutMs, type: action.type };
}

async function validateBatchActionParams(type, params, index) {
  const label = `batch action ${index}`;
  if (["getTab", "activateTab", "reload", "back", "forward"].includes(type)) {
    assertBatchFields(params, ["tabId"], label);
    requireTabId(params);
    return { ...params };
  }
  if (type === "navigate") {
    assertBatchFields(params, ["tabId", "url"], label);
    requireTabId(params);
    if (typeof params.url !== "string" || params.url.length === 0 || params.url.length > MAX_WAIT_VALUE_CHARS) {
      throw new Error(`${label} url must be a non-empty string of at most ${MAX_WAIT_VALUE_CHARS} characters`);
    }
    await assertNavigationAllowed(params.url);
    return { ...params };
  }
  if (type === "tabContext") {
    assertBatchFields(params, ["maxChars", "maxSelectionChars", "tabId"], label);
    requireTabId(params);
    strictBatchInteger(params.maxChars, 100, 200_000, 50_000, `${label} maxChars`);
    strictBatchInteger(params.maxSelectionChars, 1, 10_000, 2_000, `${label} maxSelectionChars`);
    return { ...params };
  }
  if (type === "findElements") {
    assertBatchFields(params, ["interactiveOnly", "limit", "query", "role", "tabId", "visibleOnly"], label);
    requireTabId(params);
    if (typeof params.query !== "string" || params.query.trim().length === 0 || params.query.length > MAX_FIND_QUERY_CHARS) {
      throw new Error(`${label} query must be a non-empty string of at most ${MAX_FIND_QUERY_CHARS} characters`);
    }
    if (params.role != null
      && (typeof params.role !== "string" || params.role.trim().length === 0 || params.role.length > MAX_FIND_ROLE_CHARS)) {
      throw new Error(`${label} role must be a non-empty string of at most ${MAX_FIND_ROLE_CHARS} characters`);
    }
    optionalBatchBoolean(params.interactiveOnly, `${label} interactiveOnly`);
    optionalBatchBoolean(params.visibleOnly, `${label} visibleOnly`);
    strictBatchInteger(params.limit, 1, MAX_FIND_RESULTS, 20, `${label} limit`);
    return { ...params };
  }
  if (type === "waitFor") {
    assertBatchFields(params, ["condition", "pollIntervalMs", "tabId", "timeoutMs"], label);
    const condition = validateWaitCondition(params.condition);
    if (condition.type !== "download") requireTabId(params);
    strictBatchInteger(params.timeoutMs, MIN_WAIT_TIMEOUT_MS, MAX_WAIT_TIMEOUT_MS, 10_000, `${label} wait timeoutMs`);
    strictBatchInteger(params.pollIntervalMs, MIN_WAIT_POLL_MS, MAX_WAIT_POLL_MS, 100, `${label} pollIntervalMs`);
    return { ...params, condition };
  }
  if (type === "clickElement") {
    assertBatchFields(params, ["button", "modifiers", "ref", "tabId"], label);
    requireTabId(params);
    requireElementRef(params);
    requireButton(params.button);
    if (params.modifiers != null && (!Array.isArray(params.modifiers) || params.modifiers.length > 5)) {
      throw new Error(`${label} modifiers must be an array of at most 5 modifier names`);
    }
    resolveModifiers(params.modifiers);
    return { ...params };
  }
  assertBatchFields(params, ["clear", "ref", "tabId", "text"], label);
  requireTabId(params);
  requireElementRef(params);
  if (typeof params.text !== "string") throw new Error(`${label} text must be a string`);
  if (params.text.length > MAX_TEXT_CHARS) {
    throw new Error(`${label} text is too large; max ${MAX_TEXT_CHARS} characters`);
  }
  optionalBatchBoolean(params.clear, `${label} clear`);
  return { ...params };
}

function runBatchAction(action, index, deadline, totalTimeoutMs, signal, pageGuard) {
  throwIfAborted(signal);
  const remainingMs = deadline - Date.now();
  if (remainingMs <= 0) {
    const error = new Error(`browser batch total timeout reached after ${totalTimeoutMs}ms at action ${index}`);
    error.batchTotalTimeout = true;
    throw error;
  }
  const totalTimeoutWins = remainingMs <= action.timeoutMs;
  const timeoutMs = Math.min(action.timeoutMs, remainingMs);
  const controller = new AbortController();
  const onParentAbort = () => controller.abort(signal.reason);
  signal?.addEventListener("abort", onParentAbort, { once: true });
  let onActionAbort;
  const abortPromise = new Promise((_, reject) => {
    onActionAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener("abort", onActionAbort, { once: true });
  });
  const timer = setTimeout(() => {
    const error = totalTimeoutWins
      ? new Error(`browser batch total timeout reached after ${totalTimeoutMs}ms at action ${index}`)
      : new Error(`browser batch action ${index} timed out after ${action.timeoutMs}ms`);
    error.batchActionTimeout = !totalTimeoutWins;
    error.batchTotalTimeout = totalTimeoutWins;
    controller.abort(error);
  }, timeoutMs);
  const execution = Promise.resolve().then(() => executeCommand(
    BATCH_ACTION_METHODS[action.type],
    action.params,
    { pageGuard, signal: controller.signal }
  ));
  return Promise.race([execution, abortPromise]).finally(() => {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onParentAbort);
    controller.signal.removeEventListener("abort", onActionAbort);
  });
}

function assertBatchFields(value, allowedFields, label) {
  const unsupported = Object.keys(value).filter((field) => !allowedFields.includes(field));
  if (unsupported.length > 0) throw new Error(`${label} contains unsupported fields: ${unsupported.join(", ")}`);
}

function strictBatchInteger(value, min, max, fallback, label) {
  if (value == null) return fallback;
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} must be an integer from ${min} to ${max}`);
  }
  return value;
}

function optionalBatchBoolean(value, label) {
  if (value != null && typeof value !== "boolean") throw new Error(`${label} must be a boolean`);
}

async function waitFor(params, { signal } = {}) {
  const condition = validateWaitCondition(params.condition);
  const timeoutMs = clampInteger(params.timeoutMs, MIN_WAIT_TIMEOUT_MS, MAX_WAIT_TIMEOUT_MS, 10_000, "timeoutMs");
  const pollIntervalMs = clampInteger(params.pollIntervalMs, MIN_WAIT_POLL_MS, MAX_WAIT_POLL_MS, 100, "pollIntervalMs");
  const tabId = condition.type === "download" ? null : requireTabId(params);
  if (condition.type === "navigation") condition.baseline = navigationSequences.get(tabId) ?? 0;
  const startedAt = Date.now();
  let networkConsumer = false;

  try {
    throwIfAborted(signal);
    if (["text", "ref", "selector"].includes(condition.type)) await injectA11yScript(tabId);
    if (condition.type === "networkIdle") {
      await acquireNetworkWaitTracker(tabId);
      networkConsumer = true;
    }
    while (true) {
      throwIfAborted(signal);
      const result = await checkWaitCondition(tabId, condition);
      throwIfAborted(signal);
      if (result.matched === true) {
        return {
          ...result,
          elapsedMs: Date.now() - startedAt,
          matched: true,
          type: condition.type
        };
      }
      const remainingMs = timeoutMs - (Date.now() - startedAt);
      if (remainingMs <= 0) {
        throw new Error(`timed out waiting for ${condition.type} after ${timeoutMs}ms`);
      }
      await abortableSleep(Math.min(pollIntervalMs, remainingMs), signal);
    }
  } finally {
    if (networkConsumer) await releaseNetworkWaitTracker(tabId);
  }
}

function throwIfAborted(signal) {
  if (!signal?.aborted) return;
  if (signal.reason instanceof Error) throw signal.reason;
  if (typeof signal.reason?.message === "string") throw new Error(signal.reason.message);
  throw new Error("Chrome command was cancelled");
}

function abortableChromeOperation(operation, signal) {
  if (!signal) return operation;
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      try { throwIfAborted(signal); } catch (error) { reject(error); }
    };
    signal.addEventListener("abort", onAbort, { once: true });
    Promise.resolve(operation).then(resolve, reject).finally(() => {
      signal.removeEventListener("abort", onAbort);
    });
  });
}

function abortableSleep(ms, signal) {
  if (!signal) return sleep(ms);
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(signal.reason instanceof Error ? signal.reason : new Error("Chrome command was cancelled"));
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function validateWaitCondition(condition) {
  if (!isRecord(condition) || typeof condition.type !== "string") {
    throw new Error("condition must be a typed object");
  }
  const type = condition.type;
  if (!["url", "navigation", "text", "ref", "selector", "networkIdle", "download"].includes(type)) {
    throw new Error("condition type must be one of: url, navigation, text, ref, selector, networkIdle, download");
  }
  const allowedFields = {
    url: ["type", "value", "match"],
    navigation: ["type"],
    text: ["type", "value", "caseSensitive"],
    ref: ["type", "ref", "visibleOnly"],
    selector: ["type", "selector", "visibleOnly"],
    networkIdle: ["type", "idleMs"],
    download: ["type", "downloadId"]
  }[type];
  const unsupported = Object.keys(condition).filter((key) => !allowedFields.includes(key));
  if (unsupported.length > 0) throw new Error(`${type} condition contains unsupported fields: ${unsupported.join(", ")}`);

  if (type === "url") {
    const value = requireWaitString(condition.value, "url condition value");
    const match = condition.match ?? "contains";
    if (match !== "contains" && match !== "exact") throw new Error("url condition match must be contains or exact");
    return { type, value, match };
  }
  if (type === "navigation") return { type };
  if (type === "text") {
    return {
      type,
      value: requireWaitString(condition.value, "text condition value"),
      caseSensitive: optionalWaitBoolean(condition.caseSensitive, false, "text condition caseSensitive")
    };
  }
  if (type === "ref") {
    return {
      type,
      ref: requireElementRef({ ref: condition.ref }),
      visibleOnly: optionalWaitBoolean(condition.visibleOnly, true, "ref condition visibleOnly")
    };
  }
  if (type === "selector") {
    return {
      type,
      selector: requireWaitString(condition.selector, "selector condition selector"),
      visibleOnly: optionalWaitBoolean(condition.visibleOnly, true, "selector condition visibleOnly")
    };
  }
  if (type === "networkIdle") {
    const idleMs = condition.idleMs ?? 500;
    if (!Number.isInteger(idleMs) || idleMs < 10 || idleMs > 30_000) {
      throw new Error("idleMs must be an integer from 10 to 30000");
    }
    return { type, idleMs };
  }
  if (!Number.isInteger(condition.downloadId) || condition.downloadId < 0) {
    throw new Error("download condition downloadId must be a non-negative integer");
  }
  return { type, downloadId: condition.downloadId };
}

function optionalWaitBoolean(value, fallback, name) {
  if (value == null) return fallback;
  if (typeof value !== "boolean") throw new Error(`${name} must be a boolean`);
  return value;
}

function requireWaitString(value, name) {
  if (typeof value !== "string" || value.length === 0) throw new Error(`${name} must be a non-empty string`);
  return limitString(value, name, MAX_WAIT_VALUE_CHARS);
}

async function checkWaitCondition(tabId, condition) {
  if (condition.type === "url") {
    const tab = await chrome.tabs.get(tabId);
    const url = typeof tab.url === "string" ? tab.url : "";
    const matched = condition.match === "exact" ? url === condition.value : url.includes(condition.value);
    return { matched, url: sanitizeBrowserUrl(url) };
  }
  if (condition.type === "navigation") {
    let tab;
    try {
      tab = await chrome.tabs.get(tabId);
    } catch {
      throw new Error(`tab ${tabId} closed while waiting for navigation`);
    }
    const sequence = navigationSequences.get(tabId) ?? 0;
    return {
      matched: sequence > condition.baseline && tab.status === "complete",
      navigationSequence: sequence,
      status: typeof tab.status === "string" ? tab.status : "unknown",
      url: sanitizeBrowserUrl(tab.url)
    };
  }
  if (["text", "ref", "selector"].includes(condition.type)) {
    const result = await runInA11yWorld(
      tabId,
      (pageCondition) => window.__opencodeA11yCheck ? window.__opencodeA11yCheck(pageCondition) : null,
      [condition]
    );
    if (!isRecord(result)
      || result.type !== condition.type
      || typeof result.matched !== "boolean") {
      throw new Error(`${condition.type} wait result is invalid`);
    }
    if (result.invalid === true) throw new Error(`${condition.type} is invalid`);
    return { matched: result.matched };
  }
  if (condition.type === "networkIdle") {
    const snapshot = networkIdleSnapshot(tabId);
    return {
      ...snapshot,
      matched: snapshot.proven === true
        && snapshot.provenancePending === false
        && snapshot.overflowed !== true
        && snapshot.inFlight === 0
        && snapshot.idleForMs >= condition.idleMs
    };
  }
  const items = await chrome.downloads.search({ id: condition.downloadId });
  const item = items.find((candidate) => candidate.id === condition.downloadId);
  if (!item) return { matched: false };
  if (item.state === "interrupted") {
    const reason = truncateString(item.error || "unknown error", 200);
    throw new Error(`Download ${condition.downloadId} was interrupted: ${reason}`);
  }
  return {
    download: normalizeWaitDownload(item),
    matched: item.state === "complete"
  };
}

function normalizeWaitDownload(item) {
  return {
    bytesReceived: Number.isFinite(item.bytesReceived) ? item.bytesReceived : 0,
    filename: truncateString(item.filename, 2_000),
    id: item.id,
    state: item.state,
    totalBytes: Number.isFinite(item.totalBytes) ? item.totalBytes : -1,
    url: sanitizeBrowserUrl(item.url)
  };
}

function sanitizeBrowserUrl(value) {
  try {
    const url = new URL(String(value ?? ""));
    url.username = "";
    url.password = "";
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      const normalized = key.toLowerCase().replace(/[_-]/gu, "");
      if (/(auth|code|credential|key|pass|password|session|sig|signature|token|secret)/u.test(normalized)) {
        url.searchParams.set(key, "[redacted]");
      }
    }
    return url.href;
  } catch {
    return "";
  }
}

function validateReadPageResult(result) {
  if (!isRecord(result)
    || !isRecord(result.accessibility)
    || typeof result.accessibility.tree !== "string"
    || result.accessibility.tree.length > 200000
    || !isValidTabContextResult(result.context)) {
    throw new Error("read page result is invalid");
  }
}

function validateTabContextResult(result, label) {
  if (!isValidTabContextResult(result)) throw new Error(`${label} result is invalid`);
}

function isValidTabContextResult(result) {
  if (!isRecord(result)
    || typeof result.visibleText !== "string"
    || result.visibleText.length > 200000) return false;
  if (result.returnedChars != null
    && (!Number.isInteger(result.returnedChars) || result.returnedChars !== result.visibleText.length)) return false;
  if (result.totalChars != null
    && (!Number.isInteger(result.totalChars) || result.totalChars < result.visibleText.length)) return false;
  return true;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireElementRef(params) {
  if (typeof params.ref !== "string" || params.ref.length === 0 || params.ref.length > MAX_A11Y_REF_CHARS) {
    throw new Error("ref must be a non-empty element reference string from accessibilityTree");
  }
  return params.ref;
}

async function locateElement(tabId, ref, signal) {
  throwIfAborted(signal);
  await injectA11yScript(tabId);
  throwIfAborted(signal);
  const location = await runInA11yWorld(
    tabId,
    (elementRef) => window.__opencodeA11yLocate ? window.__opencodeA11yLocate(elementRef) : null,
    [ref]
  );
  throwIfAborted(signal);
  if (location.found !== true) {
    throw new Error(`Element ${ref} was not found; capture a fresh accessibilityTree`);
  }
  if (location.visible !== true || !(location.width > 0) || !(location.height > 0)) {
    throw new Error(`Element ${ref} is not visible; capture a fresh accessibilityTree`);
  }
  if (!Number.isFinite(location.x) || !Number.isFinite(location.y)) {
    throw new Error(`Element ${ref} has no usable position`);
  }
  return location;
}

async function clickElement(params, signal, pageGuard) {
  const tabId = requireTabId(params);
  const ref = requireElementRef(params);
  await pageGuard?.();
  const location = await locateElement(tabId, ref, signal);
  await pageGuard?.();
  throwIfAborted(signal);
  await dispatchClick({
    tabId,
    x: location.x,
    y: location.y,
    button: params.button,
    modifiers: params.modifiers
  }, signal, pageGuard);
  throwIfAborted(signal);
  return { clicked: true, ref, x: location.x, y: location.y, role: location.role, name: location.name };
}

async function fillElement(params, signal, pageGuard) {
  const tabId = requireTabId(params);
  const ref = requireElementRef(params);
  if (typeof params.text !== "string") throw new Error("text must be a string");
  if (params.text.length > MAX_TEXT_CHARS) throw new Error(`text is too large; max ${MAX_TEXT_CHARS} characters`);
  const clear = params.clear !== false;
  throwIfAborted(signal);
  await pageGuard?.();
  await injectA11yScript(tabId);
  throwIfAborted(signal);
  const focusResult = await runInA11yWorld(
    tabId,
    (elementRef, selectAll) => window.__opencodeA11yFocus ? window.__opencodeA11yFocus(elementRef, selectAll) : null,
    [ref, clear]
  );
  await pageGuard?.();
  throwIfAborted(signal);
  if (focusResult.found !== true) {
    throw new Error(`Element ${ref} was not found; capture a fresh accessibilityTree`);
  }
  if (focusResult.editable !== true) {
    throw new Error(`Element ${ref} is not an editable field (input, textarea, or contenteditable)`);
  }
  if (focusResult.focused !== true) {
    throw new Error(`Element ${ref} could not be focused; it may be disabled or covered`);
  }
  await withDebugger(tabId, async (target) => {
    throwIfAborted(signal);
    await pageGuard?.();
    await chrome.debugger.sendCommand(target, "Input.insertText", { text: params.text });
  });
  throwIfAborted(signal);
  const verifyResult = await runInA11yWorld(
    tabId,
    (elementRef, text, selectedAll) => window.__opencodeA11yVerifyFill
      ? window.__opencodeA11yVerifyFill(elementRef, text, selectedAll)
      : null,
    [ref, params.text, clear]
  );
  await pageGuard?.();
  throwIfAborted(signal);
  if (verifyResult.found !== true) {
    throw new Error(`Element ${ref} was replaced while filling; capture a fresh accessibilityTree`);
  }
  if (verifyResult.verified !== true) {
    throw new Error(`Filling element ${ref} did not update the field to the requested value`);
  }
  return { filled: true, ref, tabId, cleared: clear };
}

async function loadBlockedUrlPatterns() {
  const patterns = [];
  for (const areaName of ["managed", "local"]) {
    const area = chrome.storage?.[areaName];
    if (typeof area?.get !== "function") continue;
    let stored;
    try {
      stored = await area.get("blockedUrlPatterns");
    } catch (error) {
      throw new Error(`Could not read blockedUrlPatterns from ${areaName} storage: ${error?.message || error}`);
    }
    if (stored === null || typeof stored !== "object" || Array.isArray(stored)) {
      throw new Error(`${areaName} storage returned an invalid blockedUrlPatterns result`);
    }
    if (!Object.prototype.hasOwnProperty.call(stored, "blockedUrlPatterns")) continue;
    const list = stored.blockedUrlPatterns;
    if (!Array.isArray(list)) {
      throw new Error(`blockedUrlPatterns in ${areaName} storage must be an array`);
    }
    if (list.length > MAX_BLOCKED_URL_PATTERNS) {
      throw new Error(`blockedUrlPatterns in ${areaName} storage exceeds the limit of ${MAX_BLOCKED_URL_PATTERNS}`);
    }
    for (const entry of list) {
      if (
        typeof entry !== "string"
        || entry.trim().length === 0
        || entry.length > MAX_BLOCKED_URL_PATTERN_CHARS
        || normalizeBlockPattern(entry) === null
      ) {
        throw new Error(`blockedUrlPatterns in ${areaName} storage contains an invalid pattern`);
      }
      patterns.push(entry.trim());
    }
  }
  const uniquePatterns = [...new Set(patterns)];
  if (uniquePatterns.length > MAX_BLOCKED_URL_PATTERNS) {
    throw new Error(`blockedUrlPatterns exceeds the combined limit of ${MAX_BLOCKED_URL_PATTERNS}`);
  }
  return uniquePatterns;
}

function normalizeBlockPattern(pattern) {
  const normalized = pattern
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//u, "")
    .replace(/^www\./u, "")
    .replace(/\/+$/u, "");
  if (normalized.length === 0) return null;
  return normalized.includes("/") ? normalized : `${normalized}/*`;
}

function urlMatchesBlockPattern(parsedUrl, pattern) {
  const normalized = normalizeBlockPattern(pattern);
  if (normalized === null) return false;
  const host = parsedUrl.hostname.toLowerCase().replace(/^www\./u, "");
  let pathname;
  try {
    pathname = decodeURIComponent(parsedUrl.pathname).toLowerCase();
  } catch {
    throw new Error("Navigation URL contains invalid percent-encoding");
  }
  const subject = `${host}${pathname}`;
  if (wildcardMatch(subject, normalized)) return true;
  return !normalized.endsWith("*") && wildcardMatch(subject, `${normalized}/*`);
}

function wildcardMatch(subject, pattern) {
  if (!pattern.includes("*")) return subject === pattern;
  const startsWithWildcard = pattern.startsWith("*");
  const endsWithWildcard = pattern.endsWith("*");
  const parts = pattern.split("*").filter(Boolean);
  if (parts.length === 0) return true;

  let cursor = 0;
  let firstPart = 0;
  let lastPart = parts.length;
  if (!startsWithWildcard) {
    if (!subject.startsWith(parts[0])) return false;
    cursor = parts[0].length;
    firstPart = 1;
  }
  if (!endsWithWildcard) lastPart -= 1;
  for (let index = firstPart; index < lastPart; index += 1) {
    const foundAt = subject.indexOf(parts[index], cursor);
    if (foundAt === -1) return false;
    cursor = foundAt + parts[index].length;
  }
  if (endsWithWildcard) return true;

  const finalPart = parts.at(-1);
  const finalStart = subject.length - finalPart.length;
  return finalStart >= cursor && subject.endsWith(finalPart);
}

async function assertNavigationAllowed(url) {
  validateNavigationUrl(url);
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
  for (const pattern of await loadBlockedUrlPatterns()) {
    if (urlMatchesBlockPattern(parsed, pattern)) {
      throw new Error(`Navigation blocked by policy pattern: ${pattern}`);
    }
  }
}

async function acquireNetworkWaitTracker(tabId) {
  await refreshTabPageProvenance(tabId);
  const target = { tabId };
  await withDebuggerLock(debuggerKey(target), async () => {
    const consumers = networkWaitConsumers.get(tabId) ?? 0;
    if (consumers > 0) {
      await seedNetworkRequestProvenance(tabId, target);
      networkWaitConsumers.set(tabId, consumers + 1);
      return;
    }
    const reused = isPersistentDebuggerAttached(tabId);
    const hadPageDomain = cdpEnabledDomains.get(tabId)?.has("Page") === true;
    let attachedHere = false;
    try {
      if (!reused) {
        await chrome.debugger.attach(target, DEBUGGER_VERSION);
        attachedHere = true;
      }
      await seedNetworkRequestProvenance(tabId, target);
      networkTrackerAttached.add(tabId);
      networkWaitConsumers.set(tabId, 1);
      await enableRequiredCdpDomain(target, "Network");
    } catch (error) {
      networkWaitConsumers.delete(tabId);
      networkTrackerAttached.delete(tabId);
      networkRequestStates.delete(tabId);
      const enabled = cdpEnabledDomains.get(tabId);
      if (!attachedHere && !hadPageDomain && enabled?.has("Page")) {
        await chrome.debugger.sendCommand(target, "Page.disable", {}).catch(() => {});
        enabled.delete("Page");
        if (enabled.size === 0) cdpEnabledDomains.delete(tabId);
      }
      if (attachedHere) {
        cdpEnabledDomains.delete(tabId);
        await chrome.debugger.detach(target).catch(() => {});
      }
      throw error;
    }
  });
}

async function releaseNetworkWaitTracker(tabId) {
  const target = { tabId };
  await withDebuggerLock(debuggerKey(target), async () => {
    const consumers = networkWaitConsumers.get(tabId) ?? 0;
    if (consumers > 1) {
      networkWaitConsumers.set(tabId, consumers - 1);
      return;
    }
    networkWaitConsumers.delete(tabId);
    if (networkCaptureAttached.has(tabId)) return;
    networkTrackerAttached.delete(tabId);
    networkRequestStates.delete(tabId);
    if (!isPersistentDebuggerAttached(tabId)) {
      cdpEnabledDomains.delete(tabId);
      await chrome.debugger.detach(target).catch(() => {});
    }
  });
}

async function ensureNetworkCaptureDebugger(tabId, signal) {
  await refreshTabPageProvenance(tabId);
  return withPersistentDebuggerMutation(tabId, async (target, scoped) => {
    throwIfAborted(signal);
    const hadNetworkCapture = networkCaptureAttached.has(tabId);
    if (hadNetworkCapture && cdpEnabledDomains.get(tabId)?.has("Network") === true) {
      try {
        await seedNetworkRequestProvenance(tabId, target, signal);
        throwIfAborted(signal);
        return { attached: true, alreadyAttached: true, tabId };
      } catch (error) {
        networkRequestStates.delete(tabId);
        throw error;
      }
    }
    const reused = isPersistentDebuggerAttached(tabId);
    const hadNetworkDomain = cdpEnabledDomains.get(tabId)?.has("Network") === true;
    const hadPageDomain = cdpEnabledDomains.get(tabId)?.has("Page") === true;
    const hadNetworkState = networkRequestStates.has(tabId);
    const hadNetworkTracker = networkTrackerAttached.has(tabId);
    let attachedHere = false;
    try {
      if (!scoped && !reused) {
        throwIfAborted(signal);
        await chrome.debugger.attach(target, DEBUGGER_VERSION);
        attachedHere = true;
        throwIfAborted(signal);
      }
      await seedNetworkRequestProvenance(tabId, target, signal);
      networkTrackerAttached.add(tabId);
      networkCaptureAttached.add(tabId);
      throwIfAborted(signal);
      await enableRequiredCdpDomain(target, "Network", signal);
      throwIfAborted(signal);
      return { attached: true, alreadyAttached: false, tabId };
    } catch (error) {
      if (!hadNetworkCapture) networkCaptureAttached.delete(tabId);
      if (!hadNetworkTracker) networkTrackerAttached.delete(tabId);
      if (!hadNetworkState) networkRequestStates.delete(tabId);
      const enabled = cdpEnabledDomains.get(tabId);
      if (!attachedHere && !hadNetworkDomain && enabled?.has("Network")) {
        await chrome.debugger.sendCommand(target, "Network.disable", {}).catch(() => {});
        enabled.delete("Network");
        if (enabled.size === 0) cdpEnabledDomains.delete(tabId);
      }
      if (!attachedHere && !hadPageDomain && enabled?.has("Page")) {
        await chrome.debugger.sendCommand(target, "Page.disable", {}).catch(() => {});
        enabled.delete("Page");
        if (enabled.size === 0) cdpEnabledDomains.delete(tabId);
      }
      if (attachedHere) {
        cdpEnabledDomains.delete(tabId);
        await chrome.debugger.detach(target).catch(() => {});
      }
      throw error;
    }
  });
}

function ensureNetworkRequestState(tabId) {
  let state = networkRequestStates.get(tabId);
  if (state) return state;
  const trackingSince = Date.now();
  state = {
    bufferChars: 0,
    clearedThroughCursor: 0,
    dropped: 0,
    lastActivityAt: trackingSince,
    nextCursor: 1,
    overflowed: false,
    awaitingTopLevelDocument: false,
    documentId: null,
    frameId: null,
    loaderId: null,
    navigationGeneration: null,
    pageScope: tabPageProvenance.get(tabId)?.pageScope ?? null,
    requests: new Map(),
    trackingSince
  };
  networkRequestStates.set(tabId, state);
  return state;
}

async function seedNetworkRequestProvenance(tabId, target, signal) {
  throwIfAborted(signal);
  await enableRequiredCdpDomain(target, "Page", signal);
  const epoch = await seedMainFrameEpoch(tabId, target);
  const current = tabPageProvenance.get(tabId);
  if (!epoch || !current
    || epoch.documentId !== current.documentId
    || epoch.navigationGeneration !== current.navigationGeneration
    || epoch.pageScope !== current.pageScope) {
    throw new Error("network capture requires a proven current top-level main-frame loader");
  }
  rotateNetworkStateToEpoch(tabId, epoch);
}

function rotateNetworkStateToEpoch(tabId, epoch) {
  const existing = networkRequestStates.get(tabId);
  if (existing
    && existing.awaitingTopLevelDocument === false
    && existing.documentId === epoch.documentId
    && existing.navigationGeneration === epoch.navigationGeneration
    && existing.frameId === epoch.frameId
    && existing.loaderId === epoch.loaderId) return existing;
  networkRequestStates.delete(tabId);
  const state = ensureNetworkRequestState(tabId);
  Object.assign(state, {
    awaitingTopLevelDocument: false,
    documentId: epoch.documentId,
    frameId: epoch.frameId,
    loaderId: epoch.loaderId,
    navigationGeneration: epoch.navigationGeneration,
    pageScope: epoch.pageScope
  });
  return state;
}

function awaitProvenNetworkMainFrame(tabId, pageScope) {
  if (!networkTrackerAttached.has(tabId)) return;
  networkRequestStates.delete(tabId);
  const state = ensureNetworkRequestState(tabId);
  state.awaitingTopLevelDocument = true;
  state.pageScope = pageScope ?? null;
}

async function enableRequiredCdpDomain(target, domain, signal) {
  const tabId = target.tabId;
  const enabled = cdpEnabledDomains.get(tabId) ?? new Set();
  if (!enabled.has(domain)) {
    throwIfAborted(signal);
    await chrome.debugger.sendCommand(target, `${domain}.enable`, {});
    enabled.add(domain);
    cdpEnabledDomains.set(tabId, enabled);
    throwIfAborted(signal);
  }
}

function trackNetworkEvent(tabId, method, params) {
  if (!["Network.requestWillBeSent", "Network.responseReceived", "Network.loadingFinished", "Network.loadingFailed"].includes(method)) return;
  const state = networkRequestStates.get(tabId);
  const requestId = typeof params?.requestId === "string" ? params.requestId : "";
  if (!state || requestId.length === 0 || requestId.length > 500) return;
  const now = Date.now();

  if (method === "Network.requestWillBeSent") {
    if (state.awaitingTopLevelDocument
      || typeof state.loaderId !== "string"
      || typeof state.frameId !== "string"
      || params?.loaderId !== state.loaderId
      || params?.frameId !== state.frameId) return;
    state.lastActivityAt = now;
    const cursor = state.nextCursor++;
    const previous = state.requests.get(requestId);
    let entry = previous;
    if (!entry && state.requests.size >= MAX_NETWORK_REQUEST_STATES) {
      const completedId = [...state.requests].find(([, candidate]) => candidate.inFlight === false)?.[0];
      if (completedId) removeNetworkEntry(state, completedId);
      else {
        state.overflowed = true;
        state.dropped += 1;
        return;
      }
    }
    if (previous) state.bufferChars -= previous.bufferChars ?? 0;
    entry = {
      cursor,
      encodedLength: 0,
      failure: null,
      finishedAt: null,
      inFlight: true,
      initiatorType: sanitizeNetworkToken(params?.initiator?.type, 50, "other"),
      method: sanitizeNetworkToken(params?.request?.method, 20, "GET").toUpperCase(),
      mimeType: "",
      requestId,
      resourceType: sanitizeNetworkToken(params?.type, 50, "Other"),
      startedAt: finiteNetworkNumber(params.timestamp, now),
      status: null,
      url: redactNetworkUrl(params?.request?.url)
    };
    state.requests.delete(requestId);
    state.requests.set(requestId, entry);
    updateNetworkEntrySize(state, entry);
    trimNetworkRequestState(state);
    return;
  }

  const entry = state.requests.get(requestId);
  if (!entry) return;
  state.lastActivityAt = now;
  state.bufferChars -= entry.bufferChars ?? 0;
  entry.cursor = state.nextCursor++;
  if (method === "Network.responseReceived") {
    entry.resourceType = sanitizeNetworkToken(params?.type, 50, entry.resourceType);
    entry.status = Number.isInteger(params?.response?.status) ? params.response.status : entry.status;
    entry.mimeType = sanitizeNetworkToken(params?.response?.mimeType, 200, entry.mimeType);
    entry.encodedLength = finiteNonNegativeNetworkNumber(params?.response?.encodedDataLength, entry.encodedLength);
  } else {
    entry.inFlight = false;
    entry.finishedAt = finiteNetworkNumber(params.timestamp, now);
    if (method === "Network.loadingFinished") {
      entry.encodedLength = finiteNonNegativeNetworkNumber(params.encodedDataLength, entry.encodedLength);
    } else {
      entry.failure = truncateString(params?.errorText || "Network request failed", MAX_NETWORK_FAILURE_CHARS);
    }
  }
  state.requests.delete(requestId);
  state.requests.set(requestId, entry);
  updateNetworkEntrySize(state, entry);
  trimNetworkRequestState(state);
}

function redactNetworkUrl(value) {
  if (typeof value !== "string") return "";
  try {
    const parsed = new URL(value);
    if (!["http:", "https:", "ws:", "wss:"].includes(parsed.protocol)) {
      return `${parsed.protocol}[REDACTED]`;
    }
    parsed.username = "";
    parsed.password = "";
    parsed.hash = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (isSensitiveQueryKey(key)) parsed.searchParams.set(key, "[REDACTED]");
    }
    return truncateString(parsed.href, MAX_NETWORK_URL_CHARS);
  } catch {
    return "[invalid URL]";
  }
}

function isSensitiveQueryKey(key) {
  if (typeof key !== "string") return false;
  const normalized = key.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]/gu, "");
  return normalized.length > 0 && (SENSITIVE_QUERY_KEYS.has(normalized)
    || SENSITIVE_QUERY_KEY_FRAGMENTS.some((fragment) => normalized.includes(fragment)));
}

function sanitizeNetworkToken(value, maxChars, fallback) {
  return typeof value === "string" && value.length > 0 ? truncateString(value, maxChars) : fallback;
}

function finiteNetworkNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function finiteNonNegativeNetworkNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function publicNetworkEntry(entry) {
  return {
    cursor: entry.cursor,
    encodedLength: entry.encodedLength,
    failure: entry.failure,
    finishedAt: entry.finishedAt,
    initiatorType: entry.initiatorType,
    method: entry.method,
    mimeType: entry.mimeType,
    requestId: entry.requestId,
    resourceType: entry.resourceType,
    startedAt: entry.startedAt,
    status: entry.status,
    url: entry.url
  };
}

function updateNetworkEntrySize(state, entry) {
  entry.bufferChars = JSON.stringify(publicNetworkEntry(entry)).length;
  state.bufferChars += entry.bufferChars;
}

function removeNetworkEntry(state, requestId, countAsDropped = true) {
  const entry = state.requests.get(requestId);
  if (!entry) return false;
  state.requests.delete(requestId);
  state.bufferChars -= entry.bufferChars ?? 0;
  if (countAsDropped) state.dropped += 1;
  return true;
}

function trimNetworkRequestState(state) {
  while (state.requests.size > MAX_NETWORK_REQUEST_STATES || state.bufferChars > MAX_NETWORK_BUFFER_CHARS) {
    const completedId = [...state.requests].find(([, candidate]) => candidate.inFlight === false)?.[0];
    if (!completedId) {
      state.overflowed = true;
      const oldestId = state.requests.keys().next().value;
      if (oldestId === undefined) return;
      removeNetworkEntry(state, oldestId);
      continue;
    }
    removeNetworkEntry(state, completedId);
  }
}

function networkIdleSnapshot(tabId) {
  const state = networkRequestStates.get(tabId);
  if (!state) return {
    idleForMs: 0,
    inFlight: 0,
    overflowed: true,
    proven: false,
    provenancePending: true,
    trackingSince: null
  };
  let inFlight = 0;
  for (const request of state.requests.values()) {
    if (request.inFlight === true) inFlight += 1;
  }
  const current = tabPageProvenance.get(tabId);
  const epoch = tabMainFrameEpochs.get(tabId);
  const proven = Boolean(state.awaitingTopLevelDocument === false
    && current
    && epoch
    && typeof state.frameId === "string"
    && typeof state.loaderId === "string"
    && state.documentId === current.documentId
    && state.navigationGeneration === current.navigationGeneration
    && state.pageScope === current.pageScope
    && epoch.pageScope === current.pageScope
    && state.frameId === epoch.frameId
    && state.loaderId === epoch.loaderId
    && state.documentId === epoch.documentId
    && state.navigationGeneration === epoch.navigationGeneration);
  return {
    idleForMs: proven ? Math.max(0, Date.now() - state.lastActivityAt) : 0,
    inFlight,
    overflowed: state.overflowed,
    proven,
    provenancePending: !proven,
    trackingSince: state.trackingSince
  };
}

async function ensureConsoleLogDebugger(tabId) {
  await refreshTabPageProvenance(tabId);
  return withPersistentDebuggerMutation(tabId, async (target, scoped) => {
    const alreadyAttached = consoleLogAttached.has(tabId);
    if (!scoped && !isPersistentDebuggerAttached(tabId)) {
      await chrome.debugger.attach(target, DEBUGGER_VERSION);
    }
    await enableCdpDomains(target, ["Page", "Runtime"]);
    await seedMainFrameEpoch(tabId, target);
    consoleLogAttached.add(tabId);
    return { tabId, attached: true, alreadyAttached };
  });
}

function appendConsoleLog(tabId, method, params, provenance) {
  if (!provenance || provenance.pageScope !== tabPageProvenance.get(tabId)?.pageScope) return;
  let buffer = consoleLogBuffers.get(tabId);
  if (!buffer) {
    buffer = [];
    consoleLogBuffers.set(tabId, buffer);
  }
  const entry = normalizeConsoleLog(method, params);
  let bufferedChars = consoleLogBufferChars.get(tabId) ?? 0;
  buffer.push(entry);
  bufferedChars += JSON.stringify(entry).length;
  while (buffer.length > CONSOLE_LOG_BUFFER_MAX || bufferedChars > CONSOLE_LOG_BUFFER_MAX_CHARS) {
    const removed = buffer.shift();
    bufferedChars -= JSON.stringify(removed).length;
  }
  consoleLogBufferChars.set(tabId, bufferedChars);
}

function normalizeConsoleLog(method, params) {
  const entry = { source: method, timestamp: Date.now() };
  if (method === "Runtime.consoleAPICalled") {
    entry.level = typeof params?.type === "string" ? params.type.toLowerCase() : "log";
    entry.text = truncateString((Array.isArray(params?.args) ? params.args : [])
      .map(formatRuntimeConsoleArgument)
      .filter((value) => value.length > 0)
      .join(" "), MAX_CONSOLE_LOG_TEXT_CHARS);
    return entry;
  }
  if (method === "Console.messageAdded") {
    const message = params?.message ?? {};
    entry.level = typeof message.level === "string" ? message.level.toLowerCase() : "info";
    entry.text = truncateString(message.text, MAX_CONSOLE_LOG_TEXT_CHARS);
    if (typeof message.url === "string") entry.url = truncateString(message.url, MAX_CONSOLE_LOG_URL_CHARS);
    if (Number.isFinite(message.line)) entry.line = message.line;
    if (Number.isFinite(message.column)) entry.column = message.column;
    return entry;
  }
  if (method === "Log.entryAdded") {
    const logEntry = params?.entry ?? {};
    entry.level = typeof logEntry.level === "string" ? logEntry.level.toLowerCase() : "info";
    entry.text = truncateString(logEntry.text, MAX_CONSOLE_LOG_TEXT_CHARS);
    if (typeof logEntry.url === "string") entry.url = truncateString(logEntry.url, MAX_CONSOLE_LOG_URL_CHARS);
    if (Number.isFinite(logEntry.lineNumber)) entry.line = logEntry.lineNumber;
    if (Number.isFinite(logEntry.columnNumber)) entry.column = logEntry.columnNumber;
    return entry;
  }
  if (method === "Runtime.exceptionThrown") {
    const details = params?.exceptionDetails ?? {};
    const exc = details.exception ?? {};
    entry.level = "error";
    entry.text = truncateString((typeof exc.description === "string" && exc.description)
      || (typeof details.text === "string" && details.text)
      || (typeof exc.value === "string" ? exc.value : null)
      || "Uncaught exception", MAX_CONSOLE_LOG_TEXT_CHARS);
    if (typeof details.url === "string") entry.url = truncateString(details.url, MAX_CONSOLE_LOG_URL_CHARS);
    if (Number.isFinite(details.lineNumber)) entry.line = details.lineNumber;
    if (Number.isFinite(details.columnNumber)) entry.column = details.columnNumber;
    return entry;
  }
  entry.level = "info";
  entry.text = "Unrecognized console event";
  return entry;
}

function formatRuntimeConsoleArgument(argument) {
  if (!argument || typeof argument !== "object") return "";
  if (["string", "number", "boolean", "bigint"].includes(argument.type) && argument.value != null) {
    return String(argument.value);
  }
  if (typeof argument.unserializableValue === "string") return argument.unserializableValue;
  if (typeof argument.description === "string") return argument.description;
  return argument.type === "undefined" ? "undefined" : "";
}

function truncateString(value, maxChars) {
  return typeof value === "string" ? value.slice(0, maxChars) : "";
}

const ALLOWED_URL_SCHEMES = new Set(["http:", "https:"]);

function validateNavigationUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol === "about:") {
    if (parsed.href === "about:blank") return;
    throw new Error("only about:blank is allowed for about: URLs");
  }
  if (!ALLOWED_URL_SCHEMES.has(parsed.protocol)) {
    throw new Error(`Disallowed URL scheme: ${parsed.protocol}`);
  }
}

function isValidCdpMethod(method) {
  return typeof method === "string" && method.length <= MAX_KEY_CHARS && CDP_METHOD_RE.test(method);
}

async function ensureCdpEventDebugger(tabId, methods) {
  await withPersistentDebuggerMutation(tabId, async (target, scoped) => {
    if (!scoped && !isPersistentDebuggerAttached(tabId)) {
      await chrome.debugger.attach(target, DEBUGGER_VERSION);
    }
    cdpEventAttached.add(tabId);
    await enableCdpDomains(target, [...new Set(["Page", ...methods.map((method) => method.split(".")[0])])]);
    await seedMainFrameEpoch(tabId, target);
  });
}

async function seedMainFrameEpoch(tabId, target) {
  const current = tabPageProvenance.get(tabId);
  if (!current) return null;
  const existing = tabMainFrameEpochs.get(tabId);
  if (existing
    && existing.documentId === current.documentId
    && existing.navigationGeneration === current.navigationGeneration
    && existing.pageScope === current.pageScope) return existing;
  let frame;
  try { frame = (await chrome.debugger.sendCommand(target, "Page.getFrameTree", {}))?.frameTree?.frame; } catch { return null; }
  if (!frame || frame.parentId != null || typeof frame.id !== "string" || typeof frame.loaderId !== "string") return null;
  const pageScope = safeCanonicalPermissionScope(frame.url);
  if (!pageScope || pageScope !== current.pageScope) return null;
  observeMainFrame(tabId, { frameId: frame.id, loaderId: frame.loaderId, pageScope });
  return tabMainFrameEpochs.get(tabId) ?? null;
}

async function enableCdpDomains(target, domains) {
  const tabId = target.tabId;
  const enabled = Number.isInteger(tabId) ? (cdpEnabledDomains.get(tabId) ?? new Set()) : new Set();
  for (const domain of domains) {
    if (!/^[A-Za-z][A-Za-z0-9]*$/u.test(domain) || enabled.has(domain)) continue;
    try {
      await chrome.debugger.sendCommand(target, `${domain}.enable`, {});
      enabled.add(domain);
    } catch {
      // Some domains do not expose an enable command. Do not mark failures as
      // enabled so transient target errors can be retried on the next request.
    }
  }
  if (Number.isInteger(tabId)) cdpEnabledDomains.set(tabId, enabled);
}

async function detachCdpEventDebuggerIfIdle(tabId) {
  if (cdpSubscriptions.has(tabId) || !cdpEventAttached.has(tabId)) return;
  const target = { tabId };
  if (scopedDebuggerTargets.has(tabId)) {
    cdpEventAttached.delete(tabId);
    return;
  }
  await withDebuggerLock(debuggerKey(target), async () => {
    if (cdpSubscriptions.has(tabId) || !cdpEventAttached.has(tabId)) return;
    cdpEventAttached.delete(tabId);
    if (!isPersistentDebuggerAttached(tabId)) {
      cdpEnabledDomains.delete(tabId);
      await chrome.debugger.detach(target).catch(() => {});
    }
  });
}

async function withPersistentDebuggerMutation(tabId, operation) {
  const scopedTarget = scopedDebuggerTargets.get(tabId);
  if (scopedTarget) return operation(scopedTarget, true);
  const target = { tabId };
  return withDebuggerLock(debuggerKey(target), () => operation(target, false));
}

function limitString(value, name, maxLength) {
  if (value.length > maxLength) throw new Error(`${name} is too large; max ${maxLength} characters`);
  return value;
}

// Resolves modifier key names to the CDP bitmask: Alt=1, Control=2, Meta=4, Shift=8.
// "ControlOrMeta" maps to Control on non-Mac, Meta (Cmd) on Mac.
function resolveModifiers(modifiers) {
  if (!Array.isArray(modifiers) || modifiers.length === 0) return 0;
  const platform = navigator.userAgentData?.platform ?? navigator.platform ?? "";
  const isMac = /mac/i.test(platform);
  let mask = 0;
  for (const mod of modifiers) {
    switch (mod) {
      case "Alt":    mask |= 1; break;
      case "Control": mask |= 2; break;
      case "Meta":   mask |= 4; break;
      case "Shift":  mask |= 8; break;
      case "ControlOrMeta": mask |= isMac ? 4 : 2; break;
      default: throw new Error(`Unknown modifier: ${mod}. Use Alt, Control, Meta, Shift, or ControlOrMeta`);
    }
  }
  return mask;
}
