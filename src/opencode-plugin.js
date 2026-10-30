import path from "node:path";
import { lstat, open, realpath } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import {
  bridgeCommand,
  bridgeStatus,
  pollEvents,
  requireBridgeCapabilities,
  withBridgePageScopes,
  withoutBridgePageScopes,
  writeDataUrlToFile,
  writePdfDataUrlToFile
} from "./bridge-client.js";
import {
  materializeContextText,
  materializePageAssetBundle,
  materializeReadPageArtifacts
} from "./workspace-artifacts.js";
// Tool metadata lives in ./tool-metadata.js: OpenCode's plugin loader treats
// every module export as a plugin entrypoint, so the entrypoint must not
// re-export non-function values.
import {
  ALL_TOOL_REQUIRED_CAPABILITIES,
  DESTINATION_SCOPED_TOOLS,
  PAGE_SCOPED_TOOLS,
  TAB_SCOPED_TOOLS,
  TOOL_CAPABILITY_REQUIREMENTS
} from "./tool-metadata.js";
const MAX_UPLOAD_FILES = 20;
const MAX_UPLOAD_TOTAL_BYTES = 50 * 1024 * 1024;
const UPLOAD_CHUNK_BYTES = 256 * 1024;
const PAGE_ORIGIN_PERMISSION = "browser.origin";
const SCHEDULE_UNATTENDED_PERMISSION = "browser.schedule-unattended";
const MAX_ORIGIN_GRANT_SESSIONS = 100;
const MAX_ORIGIN_GRANTS_PER_SESSION = 100;
const WEBMCP_LIST_TRANSPORT_TIMEOUT_MS = 35_000;
const WEBMCP_INVOKE_TRANSPORT_TIMEOUT_MS = 0;
const pageOriginSessionGrants = new Map();

async function webMcpBridgeCommand(method, params, signal) {
  try {
    return await bridgeCommand(method, params, {
      signal,
      timeoutMs: method === "webMcpInvoke" ? WEBMCP_INVOKE_TRANSPORT_TIMEOUT_MS : WEBMCP_LIST_TRANSPORT_TIMEOUT_MS
    });
  } catch (error) {
    if (/Bridge request timed out/iu.test(error?.message ?? "")) {
      throw new Error("WebMCP platform failure: isolated discovery did not settle before the transport deadline");
    }
    throw error;
  }
}

const RETURNED_URL_TOOLS = new Set([
  "chrome_accessibility_tree", "chrome_activate_tab", "chrome_back", "chrome_dom_content",
  "chrome_forward", "chrome_get_tab", "chrome_open", "chrome_page_text", "chrome_reload",
  "chrome_tab_context", "chrome_wait_for"
]);
const BATCH_RETURNED_URL_ACTIONS = new Set([
  "activateTab", "back", "forward", "getTab", "navigate", "reload", "tabContext", "waitFor"
]);
const ALLOWED_RAW_PAGE_CDP_METHODS = new Set([
  "Page.getLayoutMetrics", "Runtime.evaluate", "Runtime.getProperties", "Page.navigate"
]);

const BATCH_ACTION_CAPABILITIES = Object.freeze({
  activateTab: ["browser.tabs", "browser.windows"],
  back: ["browser.navigation", "browser.tabs"],
  clickElement: ["browser.accessibility", "browser.cdp", "browser.tabs"],
  fillElement: ["browser.accessibility", "browser.cdp", "browser.tabs"],
  findElements: ["browser.find", "browser.tabs"],
  forward: ["browser.navigation", "browser.tabs"],
  getTab: ["browser.tabs"],
  navigate: ["browser.navigation", "browser.tabs"],
  reload: ["browser.navigation", "browser.tabs"],
  tabContext: ["browser.page-context", "browser.tabs"]
});

export default async function OpenCodeChromeBridgePlugin() {
  const { tool } = await loadOpenCodeTool();
  const schema = tool.schema;
  const waitConditionSchema = schema.discriminatedUnion("type", [
    schema.strictObject({
      type: schema.literal("url"),
      value: schema.string().min(1).max(2000),
      match: schema.enum(["contains", "exact"]).optional()
    }),
    schema.strictObject({ type: schema.literal("navigation") }),
    schema.strictObject({
      type: schema.literal("text"),
      value: schema.string().min(1).max(2000),
      caseSensitive: schema.boolean().optional()
    }),
    schema.strictObject({
      type: schema.literal("ref"),
      ref: schema.string().min(1).max(50),
      visibleOnly: schema.boolean().optional()
    }),
    schema.strictObject({
      type: schema.literal("selector"),
      selector: schema.string().min(1).max(2000),
      visibleOnly: schema.boolean().optional()
    }),
    schema.strictObject({
      type: schema.literal("networkIdle"),
      idleMs: schema.number().int().min(10).max(30000).optional()
    }),
    schema.strictObject({
      type: schema.literal("download"),
      downloadId: schema.number().int().min(0)
    })
  ]);
  const batchActionTimeoutMs = schema.number().int().min(50).max(30000).optional();
  const batchTabIdParams = schema.strictObject({ tabId: schema.number().int() });
  const batchAction = schema.discriminatedUnion("type", [
    schema.strictObject({ type: schema.literal("getTab"), params: batchTabIdParams, timeoutMs: batchActionTimeoutMs }),
    schema.strictObject({ type: schema.literal("activateTab"), params: batchTabIdParams, timeoutMs: batchActionTimeoutMs }),
    schema.strictObject({
      type: schema.literal("navigate"),
      params: schema.strictObject({ tabId: schema.number().int(), url: schema.string().min(1).max(2000) }),
      timeoutMs: batchActionTimeoutMs
    }),
    schema.strictObject({ type: schema.literal("reload"), params: batchTabIdParams, timeoutMs: batchActionTimeoutMs }),
    schema.strictObject({ type: schema.literal("back"), params: batchTabIdParams, timeoutMs: batchActionTimeoutMs }),
    schema.strictObject({ type: schema.literal("forward"), params: batchTabIdParams, timeoutMs: batchActionTimeoutMs }),
    schema.strictObject({
      type: schema.literal("tabContext"),
      params: schema.strictObject({
        tabId: schema.number().int(),
        maxChars: schema.number().int().min(100).max(200000).optional(),
        maxSelectionChars: schema.number().int().min(1).max(10000).optional()
      }),
      timeoutMs: batchActionTimeoutMs
    }),
    schema.strictObject({
      type: schema.literal("findElements"),
      params: schema.strictObject({
        tabId: schema.number().int(),
        query: schema.string().min(1).max(500),
        role: schema.string().min(1).max(50).optional(),
        interactiveOnly: schema.boolean().optional(),
        visibleOnly: schema.boolean().optional(),
        limit: schema.number().int().min(1).max(100).optional()
      }),
      timeoutMs: batchActionTimeoutMs
    }),
    schema.strictObject({
      type: schema.literal("waitFor"),
      params: schema.strictObject({
        tabId: schema.number().int().optional(),
        condition: waitConditionSchema,
        timeoutMs: schema.number().int().min(50).max(120000).optional(),
        pollIntervalMs: schema.number().int().min(10).max(1000).optional()
      }),
      timeoutMs: batchActionTimeoutMs
    }),
    schema.strictObject({
      type: schema.literal("clickElement"),
      params: schema.strictObject({
        tabId: schema.number().int(),
        ref: schema.string().min(1).max(50),
        button: schema.enum(["left", "middle", "right"]).optional(),
        modifiers: schema.array(schema.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).max(5).optional()
      }),
      timeoutMs: batchActionTimeoutMs
    }),
    schema.strictObject({
      type: schema.literal("fillElement"),
      params: schema.strictObject({
        tabId: schema.number().int(),
        ref: schema.string().min(1).max(50),
        text: schema.string().max(100000),
        clear: schema.boolean().optional()
      }),
      timeoutMs: batchActionTimeoutMs
    })
  ]);
  const workflowStepTimeoutMs = schema.number().int().min(50).max(30000).optional();
  const workflowTabParams = schema.strictObject({ tabId: schema.number().int() });
  const workflowStep = schema.discriminatedUnion("method", [
    ...["getTab", "activateTab", "reload", "back", "forward"].map((method) => schema.strictObject({
      method: schema.literal(method), params: workflowTabParams, timeoutMs: workflowStepTimeoutMs
    })),
    schema.strictObject({
      method: schema.literal("navigate"),
      params: schema.strictObject({ tabId: schema.number().int(), url: schema.string().min(1).max(2000) }),
      timeoutMs: workflowStepTimeoutMs
    }),
    schema.strictObject({
      method: schema.literal("tabContext"),
      params: schema.strictObject({
        tabId: schema.number().int(),
        maxChars: schema.number().int().min(100).max(200000).optional(),
        maxSelectionChars: schema.number().int().min(1).max(10000).optional()
      }),
      timeoutMs: workflowStepTimeoutMs
    }),
    schema.strictObject({
      method: schema.literal("findElements"),
      params: schema.strictObject({
        tabId: schema.number().int(), query: schema.string().min(1).max(500),
        role: schema.string().min(1).max(50).optional(), interactiveOnly: schema.boolean().optional(),
        visibleOnly: schema.boolean().optional(), limit: schema.number().int().min(1).max(100).optional()
      }),
      timeoutMs: workflowStepTimeoutMs
    }),
    schema.strictObject({
      method: schema.literal("waitFor"),
      params: schema.strictObject({
        tabId: schema.number().int().optional(), condition: waitConditionSchema,
        timeoutMs: schema.number().int().min(50).max(120000).optional(),
        pollIntervalMs: schema.number().int().min(10).max(1000).optional()
      }),
      timeoutMs: workflowStepTimeoutMs
    }),
    schema.strictObject({
      method: schema.literal("clickElement"),
      params: schema.strictObject({
        tabId: schema.number().int(), ref: schema.string().min(1).max(50),
        button: schema.enum(["left", "middle", "right"]).optional(),
        modifiers: schema.array(schema.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).max(5).optional()
      }),
      timeoutMs: workflowStepTimeoutMs
    }),
    schema.strictObject({
      method: schema.literal("screenshot"),
      params: schema.strictObject({
        tabId: schema.number().int(), format: schema.enum(["png", "jpeg"]).optional(),
        quality: schema.number().int().min(1).max(100).optional()
      }),
      timeoutMs: workflowStepTimeoutMs
    })
  ]);
  const workflowSchema = schema.strictObject({
    schemaVersion: schema.literal(1),
    id: schema.string().min(1).max(100),
    name: schema.string().min(1).max(120),
    shortcut: schema.string().min(1).max(80),
    requiredCapabilities: schema.array(schema.string().min(1).max(100)).max(100),
    requiredOrigins: schema.array(schema.string().url().max(2000)).max(100),
    steps: schema.array(workflowStep).min(1).max(100),
    createdAt: schema.string().datetime({ offset: true }).max(100),
    updatedAt: schema.string().datetime({ offset: true }).max(100)
  });
  const workflowSelectorArgs = {
    id: schema.string().min(1).max(100).optional().describe("Workflow id. Use exactly one selector."),
    name: schema.string().min(1).max(120).optional().describe("Workflow name. Use exactly one selector."),
    shortcut: schema.string().min(1).max(80).optional().describe("Normalized workflow shortcut. Use exactly one selector.")
  };
  const scheduleRecurrence = schema.discriminatedUnion("kind", [
    schema.strictObject({ kind: schema.literal("daily"), hour: schema.number().int().min(0).max(23), minute: schema.number().int().min(0).max(59) }),
    schema.strictObject({ kind: schema.literal("weekly"), weekday: schema.number().int().min(0).max(6), hour: schema.number().int().min(0).max(23), minute: schema.number().int().min(0).max(59) }),
    schema.strictObject({ kind: schema.literal("monthly"), day: schema.number().int().min(1).max(31), hour: schema.number().int().min(0).max(23), minute: schema.number().int().min(0).max(59) }),
    schema.strictObject({ kind: schema.literal("annual"), month: schema.number().int().min(1).max(12), day: schema.number().int().min(1).max(31), hour: schema.number().int().min(0).max(23), minute: schema.number().int().min(0).max(59) })
  ]);
  const scheduleCreateArgs = {
    name: schema.string().min(1).max(120),
    workflowId: schema.string().min(1).max(100),
    recurrence: scheduleRecurrence,
    requiredOrigins: schema.array(schema.string().url().max(2000)).max(100),
    enabled: schema.boolean().default(true),
    notify: schema.enum(["none", "success", "failure", "always"]).default("none")
  };

  return {
    tool: requireApprovals({
      chrome_status: tool({
        description: "Check whether the local OpenCode Chrome Bridge native host is reachable.",
        args: {},
        async execute() {
          return JSON.stringify(await bridgeStatus(ALL_TOOL_REQUIRED_CAPABILITIES), null, 2);
        }
      }),
      chrome_tabs: tool({
        description: "List open Chrome tabs visible to the OpenCode Chrome Bridge extension.",
        args: {},
        async execute() {
          return JSON.stringify(filterPublicPageMetadata(await bridgeCommand("listTabs")), null, 2);
        }
      }),
      chrome_open: tool({
        description: "Open a new Chrome tab, or navigate an existing tab when tabId is provided.",
        args: {
          url: schema.string().describe("URL to open or navigate to."),
          tabId: schema.number().int().optional().describe("Existing Chrome tab id to navigate."),
          sessionId: schema.string().optional().describe("Optional browser-control session id to claim the created or navigated tab."),
          turnId: schema.string().optional().describe("Optional browser-control turn id to claim the created or navigated tab.")
        },
        async execute(args) {
          const result = args.tabId == null
            ? await bridgeCommand("createTab", {
              url: args.url,
              active: true,
              sessionId: args.sessionId,
              turnId: args.turnId
            })
            : await bridgeCommand("navigate", {
              tabId: args.tabId,
              url: args.url,
              sessionId: args.sessionId,
              turnId: args.turnId
            });
          return JSON.stringify(result, null, 2);
        }
      }),
      chrome_close_tab: tool({
        description: "Close a Chrome tab by id.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id to close.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("closeTab", args), null, 2);
        }
      }),
      chrome_activate_tab: tool({
        description: "Focus and activate a Chrome tab, bringing its window to the foreground.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id to activate.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("activateTab", args), null, 2);
        }
      }),
      chrome_reload: tool({
        description: "Reload a Chrome tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id to reload.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("reload", args), null, 2);
        }
      }),
      chrome_back: tool({
        description: "Navigate a Chrome tab back in history.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("back", args), null, 2);
        }
      }),
      chrome_forward: tool({
        description: "Navigate a Chrome tab forward in history.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("forward", args), null, 2);
        }
      }),
      chrome_get_tab: tool({
        description: "Get metadata for a single Chrome tab by id.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("getTab", args), null, 2);
        }
      }),
      chrome_claim_tab: tool({
        description: "Claim an existing user Chrome tab into a browser-control session so it can later be finalized as handoff, deliverable, or released.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id to claim."),
          sessionId: schema.string().describe("Browser-control session id."),
          turnId: schema.string().describe("Browser-control turn id."),
          origin: schema.enum(["user", "agent"]).default("user").describe("Whether the tab existed before the agent or was agent-created.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("claimTab", args), null, 2);
        }
      }),
      chrome_finalize_tabs: tool({
        description: "Finalize a browser-control session. Agent-created tabs not listed in keep are closed; kept tabs are marked as handoff or deliverable and left open.",
        args: {
          sessionId: schema.string().describe("Browser-control session id to finalize."),
          keep: schema.array(schema.object({
            tabId: schema.number().int(),
            status: schema.enum(["handoff", "deliverable"])
          })).default([]).describe("Tabs to keep open after finalization.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("finalizeTabs", args), null, 2);
        }
      }),
      chrome_resume_session: tool({
        description: "Resume live handoff tabs from a managed browser session, clean up stale leases, regroup them, and assign a new turn.",
        args: {
          sessionId: schema.string().min(1).max(100).describe("Browser-control session id to resume."),
          turnId: schema.string().min(1).max(100).describe("New browser-control turn id.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("resumeSession", args), null, 2);
        }
      }),
      chrome_end_turn: tool({
        description: "End a browser-control turn without finalizing tabs. Active leases for the turn are released and persistent debuggers are detached.",
        args: {
          sessionId: schema.string().describe("Browser-control session id."),
          turnId: schema.string().describe("Browser-control turn id to end.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("endTurn", args), null, 2);
        }
      }),
      chrome_page_text: tool({
        description: "Extract title, URL, and visible body text from a Chrome tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          maxChars: schema.number().int().min(1).max(50000).default(12000).describe("Maximum text characters to return.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("pageText", args), null, 2);
        }
      }),
      chrome_tab_context: tool({
        description: "Read bounded visible text, page metadata, current selection, selected element references, MIME type, and document dimensions from a Chrome tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          maxChars: schema.number().int().min(100).max(200000).default(50000).describe("Maximum visible-text characters returned by the extension."),
          outputDirectory: schema.string().optional().describe("Project-relative directory where oversized or explicitly requested text is written as a collision-safe artifact."),
          maxSelectionChars: schema.number().int().min(1).max(10000).default(2000).describe("Maximum selected-text characters to return."),
          previewChars: schema.number().int().min(100).max(20000).default(12000).describe("Inline text preview size when an artifact is written."),
          saveText: schema.boolean().default(false).describe("Write visible text as an artifact even when it fits in the inline preview. Requires outputDirectory.")
        },
        async execute(args, context) {
          requireArtifactDirectoryWhenRequested(args);
          const result = await bridgeCommand("tabContext", {
            maxChars: args.maxChars,
            maxSelectionChars: args.maxSelectionChars,
            tabId: args.tabId
          });
          const materialized = await maybeMaterializeContext(result, args, context.directory);
          return JSON.stringify({
            ...materialized.context,
            visibleTextArtifact: materialized.artifact
          }, null, 2);
        }
      }),
      chrome_read_page: tool({
        description: "Read one coherent page result containing bounded tab context, an accessibility snapshot, and an optional screenshot workspace artifact.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          maxChars: schema.number().int().min(100).max(200000).default(50000).describe("Maximum visible-text characters returned by the extension."),
          maxSelectionChars: schema.number().int().min(1).max(10000).default(2000).describe("Maximum selected-text characters to return."),
          maxNodes: schema.number().int().min(1).max(2000).default(800).describe("Maximum accessibility nodes to return."),
          interactiveOnly: schema.boolean().default(false).describe("Return only interactive accessibility nodes."),
          includeScreenshot: schema.boolean().default(false).describe("Capture the visible viewport and write it below outputDirectory."),
          outputDirectory: schema.string().optional().describe("Project-relative directory for screenshot and oversized text artifacts."),
          screenshotFormat: schema.enum(["png", "jpeg"]).default("png").describe("Screenshot image format."),
          screenshotQuality: schema.number().int().min(1).max(100).default(80).describe("JPEG screenshot quality. Ignored for PNG."),
          previewChars: schema.number().int().min(100).max(20000).default(12000).describe("Inline text preview size when an artifact is written."),
          saveText: schema.boolean().default(false).describe("Write visible text as an artifact even when it fits in the inline preview. Requires outputDirectory.")
        },
        async execute(args, context) {
          requireArtifactDirectoryWhenRequested(args);
          const result = await bridgeCommand("readPage", {
            includeScreenshot: args.includeScreenshot,
            interactiveOnly: args.interactiveOnly,
            maxChars: args.maxChars,
            maxNodes: args.maxNodes,
            maxSelectionChars: args.maxSelectionChars,
            screenshotFormat: args.screenshotFormat,
            screenshotQuality: args.screenshotQuality,
            tabId: args.tabId
          }, { timeoutMs: args.includeScreenshot ? 30000 : undefined });
          return JSON.stringify(await materializeReadPageArtifacts({
            forceText: args.saveText === true,
            outputDirectory: args.outputDirectory,
            previewChars: args.previewChars,
            projectDirectory: context.directory,
            result
          }), null, 2);
        }
      }),
      chrome_find: tool({
        description: "Find and rank page elements deterministically by reference, role, accessible name, label, placeholder, and visible text.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          query: schema.string().min(1).max(500).describe("Natural-language or reference query used to rank elements."),
          role: schema.string().min(1).max(50).optional().describe("Optional exact accessibility role filter, such as button or textbox."),
          interactiveOnly: schema.boolean().default(false).describe("Only return interactive elements."),
          visibleOnly: schema.boolean().default(true).describe("Only return currently visible elements."),
          limit: schema.number().int().min(1).max(100).default(20).describe("Maximum ranked matches to return.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("findElements", args), null, 2);
        }
      }),
      chrome_wait_for: tool({
        description: "Wait deterministically for exactly one typed condition: URL, navigation, text, ref, selector, network idle, or download completion.",
        args: {
          tabId: schema.number().int().optional().describe("Chrome tab id. Required for every condition except download."),
          condition: waitConditionSchema.describe("One typed wait condition. Fields not belonging to the selected type are rejected."),
          timeoutMs: schema.number().int().min(50).max(120000).default(10000).describe("Overall wait timeout."),
          pollIntervalMs: schema.number().int().min(10).max(1000).default(100).describe("Polling interval for deterministic checks.")
        },
        async execute(args) {
          const timeoutMs = args.timeoutMs ?? 10_000;
          return JSON.stringify(await bridgeCommand("waitFor", args, {
            timeoutMs: Math.min(125_000, timeoutMs + 5_000)
          }), null, 2);
        }
      }),
      chrome_batch: tool({
        description: "Run a bounded batch of typed high-level browser actions sequentially after one OpenCode approval, with ordered action-indexed results.",
        args: {
          actions: schema.array(batchAction).min(1).max(25).describe("One to 25 typed actions. Nested batches, workflow/scheduler meta-actions, and raw CDP are not allowed."),
          stopOnError: schema.boolean().default(true).describe("Stop after the first failed action. Set false to continue after ordinary action errors."),
          totalTimeoutMs: schema.number().int().min(50).max(120000).default(60000).describe("Overall batch execution budget in milliseconds.")
        },
        async execute(args) {
          const totalTimeoutMs = args.totalTimeoutMs ?? 60_000;
          return JSON.stringify(await bridgeCommand("browserBatch", args, {
            timeoutMs: Math.min(125_000, totalTimeoutMs + 5_000)
          }), null, 2);
        }
      }),
      chrome_dom_content: tool({
        description: "Get the full HTML source or text content of a Chrome tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          contentType: schema.enum(["html", "text"]).default("html").describe("Return full HTML source or plain text."),
          maxChars: schema.number().int().min(1).max(500000).default(50000).describe("Maximum characters to return.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("domContent", args), null, 2);
        }
      }),
      chrome_set_viewport: tool({
        description: "Emulate a viewport size for a Chrome tab through CDP without resizing the browser window.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id used to identify the window."),
          width: schema.number().int().min(100).max(7680).describe("Window width in pixels."),
          height: schema.number().int().min(100).max(4320).describe("Window height in pixels.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("setViewport", args), null, 2);
        }
      }),
      chrome_reset_viewport: tool({
        description: "Clear CDP viewport emulation for a Chrome tab and restore its normal page metrics.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id used to identify the window.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("resetViewport", args), null, 2);
        }
      }),
      chrome_screenshot: tool({
        description: "Capture the visible viewport of a Chrome tab and save it to a PNG or JPEG file. Omit tabId to capture the currently active window.",
        args: {
          outputPath: schema.string().describe("Absolute or project-relative path for the image file."),
          tabId: schema.number().int().optional().describe("Chrome tab id to capture. Omit to capture the active window."),
          format: schema.enum(["png", "jpeg"]).default("png").describe("Image format.")
        },
        async execute(args, context) {
          const outputPath = await resolveProjectOutputPath(context.directory, args.outputPath, "outputPath");
          const result = await bridgeCommand(
            "screenshot",
            { tabId: args.tabId ?? null, format: args.format },
            { timeoutMs: 30000 }
          );
          const file = await writeDataUrlToFile(result.dataUrl, outputPath);
          return JSON.stringify(file, null, 2);
        }
      }),
      chrome_screenshot_region: tool({
        description: "Capture a rectangular region of a Chrome tab and save it to a PNG or JPEG file. Coordinates are CSS pixels against the page; the region can extend beyond the visible viewport. Defaults to JPEG with quality 80 to keep file size small.",
        args: {
          outputPath: schema.string().describe("Absolute or project-relative path for the image file."),
          x: schema.number().describe("Region top-left x in CSS pixels (page coordinates)."),
          y: schema.number().describe("Region top-left y in CSS pixels (page coordinates)."),
          width: schema.number().int().min(1).describe("Region width in CSS pixels."),
          height: schema.number().int().min(1).describe("Region height in CSS pixels."),
          tabId: schema.number().int().optional().describe("Chrome tab id to capture. Omit to capture the active tab in the active window."),
          format: schema.enum(["png", "jpeg"]).default("jpeg").describe("Image format. JPEG recommended for small file size."),
          quality: schema.number().int().min(1).max(100).default(80).describe("JPEG quality (1-100). Ignored for PNG."),
          timeoutMs: schema.number().int().min(1000).max(120000).optional().describe("Bridge timeout in milliseconds.")
        },
        async execute(args, context) {
          const outputPath = await resolveProjectOutputPath(context.directory, args.outputPath, "outputPath");
          const result = await bridgeCommand(
            "screenshotRegion",
            {
              tabId: args.tabId ?? null,
              x: args.x,
              y: args.y,
              width: args.width,
              height: args.height,
              format: args.format,
              quality: args.quality
            },
            { timeoutMs: args.timeoutMs ?? 30000 }
          );
          const file = await writeDataUrlToFile(result.dataUrl, outputPath);
          return JSON.stringify({ ...file, region: result.region, format: result.format }, null, 2);
        }
      }),
      chrome_print_pdf: tool({
        description: "Render a Chrome tab to PDF via Page.printToPDF and save it to a file. Bypasses the native print dialog, which extensions cannot click.",
        args: {
          outputPath: schema.string().describe("Absolute or project-relative path for the PDF file."),
          tabId: schema.number().int().describe("Chrome tab id to print."),
          landscape: schema.boolean().default(false).describe("Use landscape orientation."),
          displayHeaderFooter: schema.boolean().default(true).describe("Include default header and footer."),
          printBackground: schema.boolean().default(true).describe("Include background graphics."),
          scale: schema.number().min(0.1).max(2).default(1).describe("Print scale factor (0.1-2)."),
          timeoutMs: schema.number().int().min(1000).max(120000).optional().describe("Bridge timeout in milliseconds.")
        },
        async execute(args, context) {
          const outputPath = await resolveProjectOutputPath(context.directory, args.outputPath, "outputPath");
          const result = await bridgeCommand(
            "printPdf",
            {
              tabId: args.tabId,
              landscape: args.landscape ?? false,
              displayHeaderFooter: args.displayHeaderFooter ?? true,
              printBackground: args.printBackground ?? true,
              scale: args.scale ?? 1
            },
            { timeoutMs: args.timeoutMs ?? 60000 }
          );
          const file = await writePdfDataUrlToFile(result.dataUrl, outputPath);
          return JSON.stringify({ ...file, format: result.format }, null, 2);
        }
      }),
      chrome_click: tool({
        description: "Click viewport coordinates in a Chrome tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          x: schema.number().describe("Viewport x coordinate."),
          y: schema.number().describe("Viewport y coordinate."),
          button: schema.enum(["left", "middle", "right"]).default("left").describe("Mouse button to use."),
          modifiers: schema.array(schema.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional().describe("Modifier keys to hold during click.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("click", args), null, 2);
        }
      }),
      chrome_double_click: tool({
        description: "Double-click viewport coordinates in a Chrome tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          x: schema.number().describe("Viewport x coordinate."),
          y: schema.number().describe("Viewport y coordinate."),
          button: schema.enum(["left", "middle", "right"]).default("left").describe("Mouse button to use."),
          modifiers: schema.array(schema.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional().describe("Modifier keys to hold during click.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("doubleClick", args), null, 2);
        }
      }),
      chrome_hover: tool({
        description: "Move the mouse to viewport coordinates in a Chrome tab without clicking.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          x: schema.number().describe("Viewport x coordinate."),
          y: schema.number().describe("Viewport y coordinate.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("hover", args), null, 2);
        }
      }),
      chrome_scroll: tool({
        description: "Scroll at a viewport position in a Chrome tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          x: schema.number().describe("Viewport x coordinate to scroll at."),
          y: schema.number().describe("Viewport y coordinate to scroll at."),
          deltaX: schema.number().optional().describe("Horizontal scroll amount in pixels (positive = right). At least one of deltaX or deltaY is required and must be non-zero."),
          deltaY: schema.number().optional().describe("Vertical scroll amount in pixels (positive = down). At least one of deltaX or deltaY is required and must be non-zero.")
        },
        async execute(args) {
          if ((args.deltaX ?? 0) === 0 && (args.deltaY ?? 0) === 0) {
            throw new Error("chrome_scroll requires a non-zero deltaX or deltaY");
          }
          return JSON.stringify(await bridgeCommand("scroll", args), null, 2);
        }
      }),
      chrome_type: tool({
        description: "Insert text into the currently focused element in a Chrome tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          text: schema.string().describe("Text to type.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("type", args), null, 2);
        }
      }),
      chrome_keypress: tool({
        description: "Send a keyboard key to a Chrome tab. Supports modifier keys for shortcuts like Ctrl+C.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          key: schema.string().describe("Chrome DevTools Protocol key value, for example Enter, Tab, Escape, KeyA."),
          modifiers: schema.array(schema.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional().describe("Modifier keys to hold. Use ControlOrMeta for Ctrl on Windows/Linux or Cmd on Mac.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("keypress", args), null, 2);
        }
      }),
      chrome_evaluate: tool({
        description: "Evaluate JavaScript in a Chrome tab using the Chrome Debugger Protocol. Use for inspection or controlled local automation.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          expression: schema.string().describe("JavaScript expression to evaluate in the page.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("evaluate", args), null, 2);
        }
      }),
      chrome_wizard_step: tool({
        description: "Run a click + wait + optional eval + optional screenshot sequence in a single tool call. Use to drive a multi-step form or wizard without chaining four separate chrome_click, chrome_evaluate, and chrome_screenshot invocations per step.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          x: schema.number().describe("Viewport x coordinate to click."),
          y: schema.number().describe("Viewport y coordinate to click."),
          button: schema.enum(["left", "middle", "right"]).default("left").describe("Mouse button to use."),
          modifiers: schema.array(schema.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional().describe("Modifier keys to hold during click."),
          waitMs: schema.number().int().min(0).max(10000).default(400).describe("Milliseconds to wait after the click before evaluating or screenshotting."),
          expression: schema.string().optional().describe("JavaScript expression to evaluate after the wait."),
          screenshotPath: schema.string().optional().describe("If set, capture a viewport screenshot to this project-relative path after the wait."),
          screenshotFormat: schema.enum(["png", "jpeg"]).default("jpeg").describe("Screenshot format when screenshotPath is set."),
          screenshotQuality: schema.number().int().min(1).max(100).default(80).describe("JPEG quality (1-100) when screenshotFormat is jpeg."),
          timeoutMs: schema.number().int().min(1000).max(120000).optional().describe("Per-bridge-call timeout in milliseconds.")
        },
        async execute(args, context) {
          const timeoutMs = args.timeoutMs;

          let clickResult;
          let transitionScope;
          let transitionBinding;
          try {
            clickResult = await bridgeCommand("click", {
              tabId: args.tabId,
              x: args.x,
              y: args.y,
              button: args.button,
              modifiers: args.modifiers
            }, { timeoutMs });
            transitionScope = clickResult?.transition?.pageScope;
            if (transitionScope && typeof context.authorizePageTransition === "function") {
              transitionBinding = await context.authorizePageTransition(transitionScope);
            }
          } catch (error) {
            transitionScope = pageScopeFromMismatchError(error);
            if (!transitionScope || typeof context.authorizePageTransition !== "function") throw error;
            transitionBinding = await context.authorizePageTransition(transitionScope);
            clickResult = { navigated: true, scope: transitionScope };
          }

          const waitMs = args.waitMs ?? 400;
          if (waitMs > 0) await sleep(waitMs);

          // A navigation may commit asynchronously after the native click has
          // already returned. Always bind the finishing work to the live page
          // after the wait, without repeating the click. This metadata read
          // must escape the inherited pre-click page scopes: after a
          // navigation those scopes no longer match the tab and a scoped
          // getTab would be rejected before the transition can be authorized.
          const liveTab = await withoutBridgePageScopes(() => bridgeCommand("getTab", { tabId: args.tabId }));
          if (typeof liveTab?.url !== "string") throw new Error("Wizard target no longer exposes a page URL");
          const liveScope = canonicalPageScope(liveTab.url);
          if (typeof context.authorizePageTransition !== "function") {
            throw new Error("Wizard finishing work requires live page transition authorization");
          }
          transitionScope = liveScope;
          transitionBinding = await context.authorizePageTransition(liveScope);

          const finishStep = async () => {
            let evaluation;
            if (typeof args.expression === "string" && args.expression.length > 0) {
              evaluation = await bridgeCommand("evaluate", {
                tabId: args.tabId,
                expression: args.expression
              }, { timeoutMs });
            }

            let screenshot;
            if (typeof args.screenshotPath === "string" && args.screenshotPath.length > 0) {
              const outputPath = await resolveProjectOutputPath(context.directory, args.screenshotPath, "screenshotPath");
              const result = await bridgeCommand(
                "screenshot",
                { tabId: args.tabId, format: args.screenshotFormat, quality: args.screenshotQuality },
                { timeoutMs: Math.max(timeoutMs ?? 15000, 30000) }
              );
              screenshot = await writeDataUrlToFile(result.dataUrl, outputPath);
            }
            return { evaluation, screenshot };
          };
          const { evaluation, screenshot } = transitionScope
            ? await withBridgePageScopes([transitionScope], finishStep, transitionBinding ? [transitionBinding] : [])
            : await finishStep();

          return JSON.stringify({
            clicked: true,
            clickResult,
            waitedMs: waitMs,
            evaluation,
            screenshot
          }, null, 2);
        }
      }),
      chrome_cdp_targets: tool({
        description: "List Chrome DevTools Protocol targets visible to the OpenCode Chrome Bridge extension.",
        args: {},
        async execute() {
          return JSON.stringify(filterPublicPageMetadata(await bridgeCommand("cdpTargets")), null, 2);
        }
      }),
      chrome_cdp: tool({
        description: "Run a full Chrome DevTools Protocol (full CDP) command against a Chrome tab or target. This can inspect and control sensitive browser internals.",
        args: {
          method: schema.string().describe("CDP method name, for example Runtime.evaluate or DOM.getDocument."),
          commandParams: schema.record(schema.string(), schema.any()).optional().describe("CDP command parameters."),
          tabId: schema.number().int().optional().describe("Chrome tab id to attach to."),
          targetId: schema.string().optional().describe("Chrome debugger target id to attach to when tabId is not used.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("cdpCommand", args, { timeoutMs: 30000 }), null, 2);
        }
      }),
      chrome_history: tool({
        description: "Search the user's Chrome history visible to the OpenCode Chrome Bridge extension.",
        args: {
          query: schema.string().optional().describe("Search text. Omit or use an empty string for recent history."),
          limit: schema.number().int().min(1).max(1000).default(100).describe("Maximum history entries to return."),
          from: schema.union([schema.string(), schema.number()]).optional().describe("Start time as an ISO date string or millisecond timestamp."),
          to: schema.union([schema.string(), schema.number()]).optional().describe("End time as an ISO date string or millisecond timestamp.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("history", args), null, 2);
        }
      }),
      chrome_bookmarks: tool({
        description: "Search the user's Chrome bookmarks visible to the OpenCode Chrome Bridge extension.",
        args: {
          query: schema.string().optional().describe("Bookmark search text. Omit or use an empty string for all searchable bookmarks."),
          limit: schema.number().int().min(1).max(1000).default(100).describe("Maximum bookmarks to return.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("bookmarks", args), null, 2);
        }
      }),
      chrome_set_window_state: tool({
        description: "Set a Chrome window state: normal, minimized, maximized, or fullscreen.",
        args: {
          windowId: schema.number().int().describe("Chrome window id."),
          state: schema.enum(["normal", "minimized", "maximized", "fullscreen"]).describe("Target window state.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("setWindowState", args), null, 2);
        }
      }),
      chrome_get_window_state: tool({
        description: "Get metadata and state for a single Chrome window by id.",
        args: {
          windowId: schema.number().int().describe("Chrome window id.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("getWindowState", args), null, 2);
        }
      }),
      chrome_open_window: tool({
        description: "Create a new Chrome window with optional URL, type, size, position, and state.",
        args: {
          url: schema.string().optional().describe("URL to open in the new window."),
          type: schema.enum(["popup", "panel"]).optional().describe("Window type. Defaults to a normal window."),
          state: schema.enum(["normal", "minimized", "maximized", "fullscreen"]).optional().describe("Initial window state."),
          width: schema.number().int().min(100).max(7680).optional().describe("Window width in pixels."),
          height: schema.number().int().min(100).max(4320).optional().describe("Window height in pixels."),
          left: schema.number().int().optional().describe("Window left offset in pixels."),
          top: schema.number().int().optional().describe("Window top offset in pixels."),
          incognito: schema.boolean().optional().describe("Open as an incognito window."),
          sessionId: schema.string().optional().describe("Optional browser-control session id to claim newly-created tabs."),
          turnId: schema.string().optional().describe("Optional browser-control turn id to claim newly-created tabs.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("createWindow", args), null, 2);
        }
      }),
      chrome_drag: tool({
        description: "Drag the mouse along a path of viewport coordinates with smooth interpolation. Performs a press-move-release sequence.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          points: schema.array(schema.object({ x: schema.number(), y: schema.number() })).min(1).max(100).describe("Array of {x,y} viewport coordinates defining the drag path."),
          steps: schema.number().int().min(1).max(500).default(20).describe("Interpolation steps between consecutive points."),
          stepDelayMs: schema.number().int().min(0).max(1000).default(8).describe("Delay between interpolated steps in milliseconds."),
          button: schema.enum(["left", "middle", "right"]).default("left").describe("Mouse button to use."),
          modifiers: schema.array(schema.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional().describe("Modifier keys to hold.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("moveSequence", { ...args, drag: true }), null, 2);
        }
      }),
      chrome_move: tool({
        description: "Move the mouse along a path of viewport coordinates with smooth interpolation, without pressing any button.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          points: schema.array(schema.object({ x: schema.number(), y: schema.number() })).min(1).max(100).describe("Array of {x,y} viewport coordinates defining the move path."),
          steps: schema.number().int().min(1).max(500).default(20).describe("Interpolation steps between consecutive points."),
          stepDelayMs: schema.number().int().min(0).max(1000).default(8).describe("Delay between interpolated steps in milliseconds.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("moveSequence", { ...args, drag: false }), null, 2);
        }
      }),
      chrome_downloads_list: tool({
        description: "List Chrome downloads, optionally filtered by state or query.",
        args: {
          state: schema.enum(["in_progress", "interrupted", "complete"]).optional().describe("Filter downloads by state."),
          query: schema.string().optional().describe("Search query for filename or URL."),
          limit: schema.number().int().min(1).max(1000).default(100).describe("Maximum downloads to return.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("listDownloads", args), null, 2);
        }
      }),
      chrome_download_cancel: tool({
        description: "Cancel an in-progress Chrome download by id.",
        args: {
          downloadId: schema.number().int().describe("Chrome download id.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("cancelDownload", args), null, 2);
        }
      }),
      chrome_download_pause: tool({
        description: "Pause an in-progress Chrome download by id.",
        args: {
          downloadId: schema.number().int().describe("Chrome download id.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("pauseDownload", args), null, 2);
        }
      }),
      chrome_download_resume: tool({
        description: "Resume a paused Chrome download by id.",
        args: {
          downloadId: schema.number().int().describe("Chrome download id.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("resumeDownload", args), null, 2);
        }
      }),
      chrome_download_show: tool({
        description: "Show a downloaded file in its folder, or show the default downloads folder.",
        args: {
          downloadId: schema.number().int().optional().describe("Chrome download id. Omit to show the default downloads folder."),
          showDefaultFolder: schema.boolean().optional().describe("Show the default downloads folder instead of a specific file.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("showDownload", args), null, 2);
        }
      }),
      chrome_tab_group_create: tool({
        description: "Create a Chrome tab group from a set of tabs, with optional title, color, and collapsed state.",
        args: {
          tabIds: schema.array(schema.number().int()).describe("Array of Chrome tab ids to group."),
          title: schema.string().optional().describe("Tab group title."),
          color: schema.enum(["grey", "blue", "red", "yellow", "green", "pink", "orange", "cyan", "purple"]).optional().describe("Tab group color."),
          collapsed: schema.boolean().optional().describe("Whether the tab group is collapsed."),
          windowId: schema.number().int().optional().describe("Chrome window id to create the group in.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("createTabGroup", args), null, 2);
        }
      }),
      chrome_tab_group_update: tool({
        description: "Update a Chrome tab group title, color, or collapsed state.",
        args: {
          groupId: schema.number().int().describe("Chrome tab group id."),
          title: schema.string().optional().describe("New tab group title."),
          color: schema.enum(["grey", "blue", "red", "yellow", "green", "pink", "orange", "cyan", "purple"]).optional().describe("New tab group color."),
          collapsed: schema.boolean().optional().describe("Whether the tab group is collapsed.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("updateTabGroup", args), null, 2);
        }
      }),
      chrome_tab_groups: tool({
        description: "List Chrome tab groups, optionally filtered by window.",
        args: {
          windowId: schema.number().int().optional().describe("Chrome window id to filter tab groups.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("listTabGroups", args), null, 2);
        }
      }),
      chrome_group_tabs: tool({
        description: "Add Chrome tabs to an existing tab group, or create a new group when groupId is omitted.",
        args: {
          tabIds: schema.array(schema.number().int()).describe("Array of Chrome tab ids to group."),
          groupId: schema.number().int().optional().describe("Existing tab group id. Omit to create a new group.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("groupTabs", args), null, 2);
        }
      }),
      chrome_ungroup_tabs: tool({
        description: "Remove Chrome tabs from their tab group.",
        args: {
          tabIds: schema.array(schema.number().int()).describe("Array of Chrome tab ids to remove from their group.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("ungroupTabs", args), null, 2);
        }
      }),
      chrome_events: tool({
        description: "Poll buffered browser events (tabs, windows, downloads, CDP) from the Chrome bridge. Returns events since the given sequence number.",
        args: {
          since: schema.number().int().min(0).default(0).describe("Return events with seq greater than this value. Use 0 for the current buffer, or the nextSeq from the previous call.")
        },
        async execute(args) {
          return JSON.stringify(filterOriginBearingEvents(await pollEvents(args.since ?? 0)), null, 2);
        }
      }),
      chrome_get_console_logs: tool({
        description: "Read accumulated console messages and uncaught exceptions for a Chrome tab. On the first call, auto-attaches a persistent debugger and enables the Runtime domain so console events flow into the buffer. Pass clear:true to reset the buffer after reading. Useful to diagnose runtime errors on the page.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          clear: schema.boolean().optional().describe("If true, empty the buffer after returning the entries."),
          autoAttach: schema.boolean().optional().describe("If true (default), auto-attach the persistent console debugger on the first call. Set false to read the existing buffer without attaching.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("getConsoleLogs", {
            tabId: args.tabId,
            clear: args.clear ?? false,
            autoAttach: args.autoAttach !== false
          }), null, 2);
        }
      }),
      chrome_network_requests: tool({
        description: "Read bounded high-level network request summaries for a Chrome tab. URLs redact credentials, fragments, and sensitive query values; response/request bodies, cookies, and authorization headers are never captured.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          methods: schema.array(schema.string().min(1).max(20)).max(20).optional().describe("Optional exact HTTP method allowlist."),
          resourceTypes: schema.array(schema.string().min(1).max(50)).max(20).optional().describe("Optional exact CDP resource type allowlist."),
          statusMin: schema.number().int().min(0).max(999).optional().describe("Optional minimum HTTP status."),
          statusMax: schema.number().int().min(0).max(999).optional().describe("Optional maximum HTTP status."),
          urlContains: schema.string().min(1).max(500).optional().describe("Optional substring matched against the redacted URL."),
          failuresOnly: schema.boolean().optional().describe("Only return requests with a loading failure."),
          since: schema.number().int().min(0).optional().describe("Only return entries with a cursor greater than this value."),
          limit: schema.number().int().min(1).max(500).optional().describe("Maximum entries to return; defaults to 100."),
          clear: schema.boolean().optional().describe("Clear the tab's network buffer after taking this snapshot."),
          autoAttach: schema.boolean().optional().describe("Auto-attach and enable Network capture when needed; defaults to true.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("networkRequests", {
            ...args,
            autoAttach: args.autoAttach !== false,
            clear: args.clear === true,
            failuresOnly: args.failuresOnly === true,
            limit: args.limit ?? 100,
            since: args.since ?? 0
          }), null, 2);
        }
      }),
      chrome_page_assets: tool({
        description: "Inventory page assets from the DOM and Chrome DevTools Protocol. Optionally fetch bounded resource content and write one atomic collision-safe bundle with a URL manifest, MIME types, SHA-256 hashes, sizes, truncation, and errors inside the OpenCode workspace.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          includeContent: schema.boolean().optional().describe("Fetch resource content through CDP. Automatically enabled when outputDirectory is set."),
          outputDirectory: schema.string().min(1).max(500).optional().describe("Project-relative directory where a collision-safe page-assets bundle is written."),
          maxTotalBytes: schema.number().int().min(1).max(10 * 1024 * 1024).optional().describe("Total decoded resource byte cap; defaults to 5 MiB and cannot exceed 10 MiB.")
        },
        async execute(args, context) {
          const includeContent = args.includeContent === true || typeof args.outputDirectory === "string";
          const inventory = await bridgeCommand("pageAssets", {
            tabId: args.tabId,
            includeContent,
            maxTotalBytes: args.maxTotalBytes ?? 5 * 1024 * 1024
          }, { signal: context.abort });
          if (typeof args.outputDirectory !== "string") return JSON.stringify(inventory, null, 2);
          const bundle = await materializePageAssetBundle({
            assets: inventory.assets,
            inventoryTruncated: inventory.truncated === true,
            outputDirectory: args.outputDirectory,
            projectDirectory: context.directory,
            totalByteLimit: args.maxTotalBytes ?? 5 * 1024 * 1024
          });
          return JSON.stringify({
            ...inventory,
            assets: bundle.assets,
            bundle: {
              path: bundle.path,
              relativePath: bundle.relativePath,
              totalBytes: bundle.totalBytes
            }
          }, null, 2);
        }
      }),
      chrome_notify: tool({
        description: "Show a bounded branded OpenCode desktop notification through Chrome.",
        args: {
          title: schema.string().min(1).max(120).describe("Notification title, up to 120 characters."),
          message: schema.string().min(1).max(1000).describe("Notification message, up to 1000 characters.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("notify", args), null, 2);
        }
      }),
      chrome_release_debuggers: tool({
        description: "Release persistent Chrome debugger attachments and buffered state created by console logging, network capture, or CDP event subscriptions.",
        args: {
          tabIds: schema.array(schema.number().int()).optional().describe("Specific tab ids to release. Omit to release all persistent debugger attachments.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("releaseDebuggers", { tabIds: args.tabIds }), null, 2);
        }
      }),
      chrome_cursor_state: tool({
        description: "Set the visible browser-control cursor state and favicon badge for a tab: active, handoff, deliverable, hidden, or abort.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          state: schema.enum(["active", "handoff", "deliverable", "hidden", "abort"]).describe("Cursor state to show.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("setCursorState", args), null, 2);
        }
      }),
      chrome_favicon_badge: tool({
        description: "Set or clear the OpenCode browser-control favicon badge for a tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          badge: schema.enum(["active", "handoff", "deliverable"]).optional().describe("Badge to show. Omit to clear.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("setFaviconBadge", { tabId: args.tabId, badge: args.badge ?? null }), null, 2);
        }
      }),
      chrome_accessibility_tree: tool({
        description: "Capture a compact accessibility tree of a Chrome tab with stable element references (e1, e2, ...). Use the refs with chrome_click_element and chrome_fill_element to act on elements without pixel coordinates. Sensitive fields (passwords, payment autocomplete) are always redacted. Refs are valid until the tab navigates.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          interactiveOnly: schema.boolean().optional().describe("If true, only include interactive elements (buttons, links, inputs)."),
          maxNodes: schema.number().int().min(1).max(2000).default(800).describe("Maximum elements to include."),
          maxChars: schema.number().int().min(100).max(200000).default(50000).describe("Maximum characters of tree text to return.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("accessibilityTree", args), null, 2);
        }
      }),
      chrome_webmcp_list: tool({
        description: "List the bounded declarative WebMCP tools exposed by the current document. This experimental adapter reads feature-detected document.modelContext or navigator.modelContext APIs in the extension's ISOLATED world.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id whose approved current origin and exact document will be bound to this discovery call."),
          timeoutMs: schema.number().int().min(50).max(30_000).default(10_000).describe("WebMCP discovery deadline in milliseconds.")
        },
        async execute(args, context) {
          return JSON.stringify(await webMcpBridgeCommand("webMcpList", args, context.abort), null, 2);
        }
      }),
      chrome_webmcp_invoke: tool({
        description: "Invoke one exact WebMCP tool exposed by the current document, with bounded JSON input and output. The current origin requires explicit approval; once native executeTool dispatch commits, it settles naturally.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id whose current origin has been explicitly approved."),
          toolName: schema.string().min(1).max(100).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/u).describe("Exact WebMCP tool name returned by chrome_webmcp_list."),
          input: schema.any().optional().describe("Losslessly JSON-serializable input, limited to 64 KiB."),
          timeoutMs: schema.number().int().min(50).max(30_000).default(10_000).describe("Admission/pre-dispatch deadline in milliseconds; it does not time out a committed page tool.")
        },
        async execute(args, context) {
          return JSON.stringify(await webMcpBridgeCommand("webMcpInvoke", {
            input: Object.hasOwn(args, "input") ? args.input : {},
            tabId: args.tabId,
            timeoutMs: args.timeoutMs,
            toolName: args.toolName
          }, context.abort), null, 2);
        }
      }),
      chrome_click_element: tool({
        description: "Click an element in a Chrome tab by its accessibility-tree reference. Scrolls the element into view and clicks its center through CDP. Capture chrome_accessibility_tree first to obtain refs.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          ref: schema.string().describe("Element reference from chrome_accessibility_tree, e.g. e12."),
          button: schema.enum(["left", "middle", "right"]).default("left").describe("Mouse button to use."),
          modifiers: schema.array(schema.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional().describe("Modifier keys to hold during click.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("clickElement", args), null, 2);
        }
      }),
      chrome_fill_element: tool({
        description: "Focus an input, textarea, or contenteditable element by accessibility-tree reference and type text into it. By default the existing content is selected first, so the new text replaces it.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          ref: schema.string().describe("Element reference from chrome_accessibility_tree, e.g. e12."),
          text: schema.string().describe("Text to type into the element."),
          clear: schema.boolean().default(true).describe("Select existing content first so the text replaces it. Set false to append at the current caret.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("fillElement", args), null, 2);
        }
      }),
      chrome_upload_files: tool({
        description: "Upload workspace files to a live file input by accessibility-tree reference. Every real path must remain inside the current OpenCode workspace; directories, symlink escapes, oversized inputs, stale refs, and partial uploads are rejected.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id."),
          ref: schema.string().min(1).max(50).describe("Live file-input reference from chrome_accessibility_tree."),
          paths: schema.array(schema.string().min(1).max(4096)).min(1).max(MAX_UPLOAD_FILES).describe("Workspace-relative or contained absolute file paths.")
        },
        async execute(args, context) {
          return JSON.stringify(await uploadWorkspaceFiles({
            directory: context.directory,
            paths: args.paths,
            ref: args.ref,
            signal: context.abort,
            tabId: args.tabId
          }), null, 2);
        }
      }),
      chrome_workflow_start: tool({
        description: "Start recording successful allowlisted browser commands into a bounded reusable workflow. Sensitive command fields are never recorded.",
        args: {
          name: schema.string().min(1).max(120).describe("Workflow display name."),
          shortcut: schema.string().min(1).max(80).optional().describe("Unique shortcut; defaults to the normalized name.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("workflowStartRecording", args), null, 2);
        }
      }),
      chrome_workflow_stop: tool({
        description: "Stop the active workflow recording, validate it, and persist it locally.",
        args: {},
        async execute() {
          return JSON.stringify(await bridgeCommand("workflowStopRecording"), null, 2);
        }
      }),
      chrome_workflow_cancel: tool({
        description: "Cancel and discard the active workflow recording.",
        args: {},
        async execute() {
          return JSON.stringify(await bridgeCommand("workflowCancelRecording"), null, 2);
        }
      }),
      chrome_workflows: tool({
        description: "List locally persisted workflows without returning their step bodies.",
        args: {},
        async execute() {
          return JSON.stringify(await bridgeCommand("workflowList"), null, 2);
        }
      }),
      chrome_workflow_get: tool({
        description: "Get one versioned workflow by exactly one of id, name, or shortcut.",
        args: { ...workflowSelectorArgs },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("workflowGet", args), null, 2);
        }
      }),
      chrome_workflow_import: tool({
        description: "Validate and import one bounded version-1 typed workflow. Recursive, meta, and sensitive steps are rejected.",
        args: { workflow: workflowSchema.describe("Complete versioned workflow definition.") },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("workflowImport", args), null, 2);
        }
      }),
      chrome_workflow_delete: tool({
        description: "Delete one persisted workflow by exactly one of id, name, or shortcut.",
        args: { ...workflowSelectorArgs },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("workflowDelete", args), null, 2);
        }
      }),
      chrome_workflow_run: tool({
        description: "Preflight the complete capability and origin union, then run one typed workflow sequentially with indexed results and bounded timeouts.",
        args: {
          ...workflowSelectorArgs,
          totalTimeoutMs: schema.number().int().min(50).max(120000).optional().describe("Overall workflow deadline in milliseconds.")
        },
        async execute(args, context) {
          return JSON.stringify(await bridgeCommand("workflowRun", args, {
            signal: context.abort,
            timeoutMs: Math.min(126000, (args.totalTimeoutMs ?? 60000) + 5000)
          }), null, 2);
        }
      }),
      chrome_schedule_create: tool({
        description: "Create a bounded local-calendar schedule for one workflow using explicit persistent unattended origin grants.",
        args: scheduleCreateArgs,
        async execute(args, context) {
          const approval = await requestScheduleUnattendedApproval(args, context);
          return JSON.stringify(await bridgeCommand("scheduleCreate", { ...args, approval }), null, 2);
        }
      }),
      chrome_schedules: tool({
        description: "List persisted workflow schedules without execution history bodies.",
        args: {},
        async execute() {
          return JSON.stringify(await bridgeCommand("scheduleList"), null, 2);
        }
      }),
      chrome_schedule_update: tool({
        description: "Update one workflow schedule and recompute its next local-calendar occurrence.",
        args: {
          id: schema.string().min(1).max(100),
          name: schema.string().min(1).max(120).optional(),
          recurrence: scheduleRecurrence.optional(),
          requiredOrigins: schema.array(schema.string().url().max(2000)).max(100).optional(),
          enabled: schema.boolean().optional(),
          notify: schema.enum(["none", "success", "failure", "always"]).optional()
        },
        async execute(args, context) {
          const approval = await requestScheduleUnattendedApproval(args, context);
          return JSON.stringify(await bridgeCommand("scheduleUpdate", { ...args, approval }), null, 2);
        }
      }),
      chrome_schedule_delete: tool({
        description: "Delete one persisted workflow schedule and its named Chrome alarm.",
        args: { id: schema.string().min(1).max(100) },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("scheduleDelete", args), null, 2);
        }
      }),
      chrome_schedule_run_now: tool({
        description: "Run one schedule now through the same unattended fail-closed capability and origin preflight.",
        args: { id: schema.string().min(1).max(100) },
        async execute(args, context) {
          return JSON.stringify(await bridgeCommand("scheduleRunNow", args, {
            signal: context.abort,
            timeoutMs: 126000
          }), null, 2);
        }
      }),
      chrome_schedule_history: tool({
        description: "Read the bounded sanitized execution history for one workflow schedule.",
        args: { id: schema.string().min(1).max(100) },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("scheduleHistory", args), null, 2);
        }
      }),
      chrome_blocked_urls: tool({
        description: "List the effective blocked URL patterns the bridge enforces on navigation. Patterns come from enterprise managed storage and the extension's local storage key blockedUrlPatterns.",
        args: {},
        async execute() {
          return JSON.stringify(await bridgeCommand("getBlockedUrlPatterns"), null, 2);
        }
      }),
      chrome_subscribe_cdp: tool({
        description: "Subscribe to Chrome DevTools Protocol events for a tab. Emitted events appear via chrome_events with category 'cdp'.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id to subscribe to."),
          methods: schema.array(schema.string()).describe("Array of CDP event method names to subscribe to, e.g. [\"Network.responseReceived\", \"Console.messageAdded\"].")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("subscribeCdpEvents", args), null, 2);
        }
      }),
      chrome_unsubscribe_cdp: tool({
        description: "Unsubscribe from Chrome DevTools Protocol events for a tab. Omit methods to remove all subscriptions for the tab.",
        args: {
          tabId: schema.number().int().describe("Chrome tab id to unsubscribe from."),
          methods: schema.array(schema.string()).optional().describe("Array of CDP event method names to unsubscribe from. Omit to remove all subscriptions for the tab.")
        },
        async execute(args) {
          return JSON.stringify(await bridgeCommand("unsubscribeCdpEvents", args), null, 2);
        }
      })
    }, schema)
  };
}

// Every tool that can inspect or mutate Chrome requires explicit approval before
// running. context.ask() surfaces OpenCode's native "allow once / allow always / deny"
// prompt. Keep this deny-by-default: newly-added browser tools are guarded even when
// they do not yet have custom prompt metadata. Only the local bridge status probe is
// safe to run without access to browser data.
const APPROVAL_EXEMPT_TOOLS = new Set(["chrome_status"]);

const APPROVAL_METADATA = {
  chrome_batch: (args) => ({
    action: "Run one prevalidated sequential browser batch",
    actionCount: Array.isArray(args.actions) ? args.actions.length : 0,
    actionTypes: Array.isArray(args.actions) ? args.actions.slice(0, 25).map((entry) => entry?.type) : [],
    stopOnError: args.stopOnError,
    totalTimeoutMs: args.totalTimeoutMs
  }),
  chrome_cdp: (args) => ({ action: "Run a full Chrome DevTools Protocol command", method: args.method, tabId: args.tabId, targetId: args.targetId }),
  chrome_evaluate: (args) => ({ action: "Evaluate JavaScript in the page", tabId: args.tabId, expression: previewText(args.expression) }),
  chrome_wizard_step: (args) => ({ action: "Click, then optionally evaluate JavaScript and screenshot", tabId: args.tabId, expression: previewText(args.expression) }),
  chrome_wait_for: (args) => ({ action: "Wait for one browser condition", tabId: args.tabId, condition: args.condition?.type, timeoutMs: args.timeoutMs }),
  chrome_open: (args) => ({ action: "Open or navigate a tab", url: args.url, tabId: args.tabId }),
  chrome_open_window: (args) => ({ action: "Open a new browser window", url: args.url }),
  chrome_click: (args) => ({ action: "Click in the page", tabId: args.tabId, x: args.x, y: args.y, button: args.button }),
  chrome_double_click: (args) => ({ action: "Double-click in the page", tabId: args.tabId, x: args.x, y: args.y }),
  chrome_hover: (args) => ({ action: "Move the mouse over the page", tabId: args.tabId, x: args.x, y: args.y }),
  chrome_scroll: (args) => ({ action: "Scroll the page", tabId: args.tabId }),
  chrome_type: (args) => ({ action: "Type text into the focused element", tabId: args.tabId, text: previewText(args.text) }),
  chrome_keypress: (args) => ({ action: "Send a key to the page", tabId: args.tabId, key: args.key, modifiers: args.modifiers }),
  chrome_drag: (args) => ({ action: "Drag the mouse across the page", tabId: args.tabId, points: args.points?.length }),
  chrome_move: (args) => ({ action: "Move the mouse across the page", tabId: args.tabId, points: args.points?.length }),
  chrome_history: (args) => ({ action: "Search the user's browsing history", query: args.query }),
  chrome_bookmarks: (args) => ({ action: "Search the user's bookmarks", query: args.query }),
  chrome_page_text: (args) => ({ action: "Read the page text", tabId: args.tabId }),
  chrome_tab_context: (args) => ({ action: "Read bounded page context and selection", tabId: args.tabId, outputDirectory: args.outputDirectory }),
  chrome_read_page: (args) => ({ action: "Read page context, accessibility, and optional screenshot", tabId: args.tabId, includeScreenshot: args.includeScreenshot, outputDirectory: args.outputDirectory }),
  chrome_accessibility_tree: (args) => ({ action: "Read the page accessibility tree", tabId: args.tabId }),
  chrome_webmcp_list: (args) => ({ action: "List declarative WebMCP tools exposed by the current page", tabId: args.tabId }),
  chrome_webmcp_invoke: (args) => ({ action: "Invoke one declarative WebMCP page tool", tabId: args.tabId, toolName: args.toolName, timeoutMs: args.timeoutMs }),
  chrome_click_element: (args) => ({ action: "Click a page element by reference", tabId: args.tabId, ref: args.ref }),
  chrome_fill_element: (args) => ({ action: "Type into a page element by reference", tabId: args.tabId, ref: args.ref, text: previewText(args.text) }),
  chrome_upload_files: (args) => ({ action: "Upload workspace files to a page file input", tabId: args.tabId, ref: args.ref, files: args.paths?.length }),
  chrome_find: (args) => ({ action: "Find ranked page elements", tabId: args.tabId, query: previewText(args.query), role: args.role }),
  chrome_dom_content: (args) => ({ action: "Read the page DOM content", tabId: args.tabId, contentType: args.contentType }),
  chrome_get_console_logs: (args) => ({ action: "Read the page console logs", tabId: args.tabId }),
  chrome_network_requests: (args) => ({ action: "Read bounded page network request summaries", tabId: args.tabId, clear: args.clear }),
  chrome_page_assets: (args) => ({ action: "Inventory or bundle page assets", tabId: args.tabId, outputDirectory: args.outputDirectory }),
  chrome_notify: (args) => ({ action: "Show a Chrome notification", title: previewText(args.title) }),
  chrome_workflow_start: (args) => ({ action: "Start recording a reusable browser workflow", name: args.name, shortcut: args.shortcut }),
  chrome_workflow_stop: () => ({ action: "Stop and save the active browser workflow recording" }),
  chrome_workflow_cancel: () => ({ action: "Cancel the active browser workflow recording" }),
  chrome_workflows: () => ({ action: "List saved browser workflows" }),
  chrome_workflow_get: (args) => ({ action: "Read one saved browser workflow", id: args.id, name: args.name, shortcut: args.shortcut }),
  chrome_workflow_import: (args) => ({ action: "Import a typed browser workflow", name: args.workflow?.name, shortcut: args.workflow?.shortcut, steps: args.workflow?.steps?.length }),
  chrome_workflow_delete: (args) => ({ action: "Delete one saved browser workflow", id: args.id, name: args.name, shortcut: args.shortcut }),
  chrome_workflow_run: (args) => ({ action: "Run one saved browser workflow", id: args.id, name: args.name, shortcut: args.shortcut, totalTimeoutMs: args.totalTimeoutMs }),
  chrome_screenshot: (args) => ({ action: "Capture a screenshot of the page", tabId: args.tabId, outputPath: args.outputPath }),
  chrome_screenshot_region: (args) => ({ action: "Capture a screenshot region of the page", tabId: args.tabId, outputPath: args.outputPath }),
  chrome_print_pdf: (args) => ({ action: "Render the page to a PDF file", tabId: args.tabId, outputPath: args.outputPath }),
  chrome_downloads_list: (args) => ({ action: "List the user's Chrome downloads", query: args.query })
};

async function requestScheduleUnattendedApproval(args, context) {
  const approval = await bridgeCommand("scheduleApprovalPreview", args);
  if (!approval || typeof approval !== "object" || Array.isArray(approval)
    || approval.version !== 1
    || typeof approval.pattern !== "string"
    || !/^v1:[a-f0-9]{64}$/u.test(approval.pattern)
    || typeof approval.scheduleId !== "string"
    || typeof approval.workflowId !== "string"
    || !Number.isInteger(approval.workflowSchemaVersion)
    || !approval.recurrence || typeof approval.recurrence !== "object" || Array.isArray(approval.recurrence)
    || typeof approval.notificationPolicy !== "string"
    || !Array.isArray(approval.requiredOrigins)
    || !Array.isArray(approval.managedTabs)) {
    throw new Error("Schedule approval preview is invalid");
  }
  await context.ask({
    permission: SCHEDULE_UNATTENDED_PERMISSION,
    patterns: [approval.pattern],
    always: [approval.pattern],
    metadata: {
      action: "Approve unattended browser workflow schedule",
      notificationPolicy: approval.notificationPolicy,
      originCount: approval.requiredOrigins.length,
      origins: [...approval.requiredOrigins],
      recurrence: { ...approval.recurrence },
      scheduleId: approval.scheduleId,
      workflowFingerprint: approval.workflowFingerprint,
      workflowId: approval.workflowId,
      workflowSchemaVersion: approval.workflowSchemaVersion
    }
  });
  return approval;
}

function requireApprovals(tools, schema) {
  const guarded = { ...tools };
  for (const [name, definition] of Object.entries(guarded)) {
    if (APPROVAL_EXEMPT_TOOLS.has(name)) continue;
    if (PAGE_SCOPED_TOOLS.has(name)) {
      definition.args.originGrant = schema.enum(["once", "session"]).default("once")
        .describe("Use once for this call, or explicitly cache approved page scopes only for the current OpenCode session.");
    }
    const describe = APPROVAL_METADATA[name]
      ?? (() => ({ action: definition.description ?? `Run ${name}` }));
    const run = definition.execute;
    guarded[name] = {
      ...definition,
      async execute(args, context) {
        if (typeof context?.ask !== "function") {
          throw new Error(`${name} requires an OpenCode runtime with permission prompts`);
        }
        await context.ask({
          permission: name,
          patterns: [name],
          always: [name],
          metadata: describe(args)
        });
        const requiredCapabilities = requiredCapabilitiesForTool(name, args);
        await requireBridgeCapabilities(requiredCapabilities);
        const executionArgs = PAGE_SCOPED_TOOLS.has(name) ? withoutOriginGrant(args) : args;
        if (!PAGE_SCOPED_TOOLS.has(name) || (name === "chrome_wait_for" && args?.condition?.type === "download")) {
          return run(executionArgs, context);
        }
        const callGrants = new Set();
        const operationStartedAt = name === "chrome_batch" ? Date.now() : undefined;
        validateRawCdpAccess(name, executionArgs);
        await resolveImplicitPageTarget(name, executionArgs);
        const pageMetadata = new Map();
        const beforeScopes = await resolvePageScopes(name, executionArgs, pageMetadata);
        const beforeBindings = await resolvePageBindings(name, executionArgs, pageMetadata);
        await authorizePageScopes(
          approvalScopesForTool(name, executionArgs, beforeScopes, "before"),
          args?.originGrant,
          context,
          describe(args),
          callGrants
        );
        const executionContext = {
          ...context,
          authorizePageTransition: async (scope) => {
            await authorizePageScopes(
              approvalScopesForTool(name, executionArgs, [scope], "transition"),
              args?.originGrant,
              context,
              {
                ...describe(args),
                action: `Authorize page transition during ${name}`
              },
              callGrants
            );
            // authorizePageTransition is called from inside the scoped
            // execution; the binding read describes the newly authorized page,
            // so it must not be sent under the stale pre-transition scopes.
            return Number.isInteger(executionArgs.tabId)
              ? (await withoutBridgePageScopes(() => resolvePageBindings(name, executionArgs)))[0]
              : undefined;
          }
        };
        const result = name === "chrome_batch"
          ? await runPermissionAwareBatch(
            executionArgs, args?.originGrant, context, describe(args), callGrants, operationStartedAt
          )
          : beforeScopes.length === 0
            ? await run(executionArgs, executionContext)
            : await withBridgePageScopes(beforeScopes, () => run(executionArgs, executionContext), beforeBindings);
        const afterScopes = [
          ...pageScopesFromReturnedResult(name, executionArgs, result),
          ...await resolvePostExecutionPageScopes(name, executionArgs, result)
        ];
        await authorizePageScopes(approvalScopesForTool(name, executionArgs, afterScopes, "after"), args?.originGrant, context, {
          ...describe(args),
          action: `Re-authorize page scope after ${name}`
        }, callGrants);
        return result;
      }
    };
  }
  return guarded;
}

async function runPermissionAwareBatch(args, originGrant, context, metadata, callGrants, operationStartedAt) {
  const startedAt = operationStartedAt ?? Date.now();
  const totalTimeoutMs = args.totalTimeoutMs ?? 60_000;
  const deadline = startedAt + totalTimeoutMs;
  const results = [];
  let stoppedAt = null;
  for (let index = 0; index < args.actions.length; index += 1) {
    const action = args.actions[index];
    const remaining = deadline - Date.now();
    let scopes;
    let bindings = [];
    try {
      if (remaining < 50) throw new Error(`browser batch total timeout after ${totalTimeoutMs}ms`);
      const pageMetadata = new Map();
      scopes = await resolveBatchPageScopes([action], pageMetadata);
      bindings = await resolvePageBindings("chrome_batch", { actions: [action] }, pageMetadata);
      await authorizePageScopes(scopes, originGrant, context, {
        ...metadata,
        action: `Authorize browser batch action ${index}`,
        actionIndex: index,
        actionType: action.type
      }, callGrants);
    } catch (error) {
      results.push({ error: error?.message ?? String(error), index, ok: false, type: action?.type });
      if (error?.pageOriginDenied === true || args.stopOnError !== false || remaining < 50) {
        stoppedAt = index;
        break;
      }
      continue;
    }
    try {
      const actionRemaining = deadline - Date.now();
      if (actionRemaining < 50) throw new Error(`browser batch total timeout after ${totalTimeoutMs}ms`);
      const executeOne = () => bridgeCommand("browserBatch", {
        actions: [action],
        stopOnError: true,
        totalTimeoutMs: Math.min(actionRemaining, totalTimeoutMs)
      }, { timeoutMs: Math.min(125_000, actionRemaining + 5_000) });
      const one = scopes.length === 0 ? await executeOne() : await withBridgePageScopes(scopes, executeOne, bindings);
      const entry = one?.results?.[0];
      if (!entry?.ok) throw new Error(entry?.error ?? `browser batch action ${index} failed`);
      results.push({ ...entry, index });
    } catch (error) {
      results.push({ error: error?.message ?? String(error), index, ok: false, type: action?.type });
      if (args.stopOnError !== false) {
        stoppedAt = index;
        break;
      }
    }
  }
  return JSON.stringify({
    completed: results.length,
    elapsedMs: Date.now() - startedAt,
    ok: results.length === args.actions.length && results.every((entry) => entry.ok),
    results,
    stoppedAt,
    totalActions: args.actions.length
  }, null, 2);
}

export function canonicalPageScope(value) {
  if (typeof value !== "string" || hasAmbiguousPageScopeEncoding(value)) {
    throw new Error("Page scope contains an ambiguous encoded separator or traversal");
  }
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Page origin permission requires a valid absolute http or https URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Page origin permission supports only http and https URLs");
  }
  const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
  return `${parsed.protocol}//${parsed.hostname}:${port}${normalizePermissionPath(parsed.pathname)}`;
}

function hasAmbiguousPageScopeEncoding(value) {
  const pathPart = value.split(/[?#]/u, 1)[0];
  return /\\|%(?:2f|5c|2e|25)/iu.test(pathPart);
}

export function pageScopeCovers(grant, requested) {
  const granted = splitPageScope(canonicalPageScope(grant));
  const target = splitPageScope(canonicalPageScope(requested));
  if (granted.origin !== target.origin) return false;
  if (granted.path === "/") return true;
  if (target.path === granted.path) return true;
  const prefix = granted.path.endsWith("/") ? granted.path.slice(0, -1) : granted.path;
  return target.path.startsWith(`${prefix}/`);
}

function approvalScopesForTool(name, args, scopes, phase) {
  const exact = [...new Set(scopes.map(canonicalPageScope))];
  const needsOriginRoot = name === "chrome_evaluate"
    || (name === "chrome_wizard_step" && typeof args?.expression === "string" && args.expression.length > 0);
  if (needsOriginRoot) return exact.map(originRootPageScope);
  if (name !== "chrome_cdp") return exact;
  if (args?.method === "Page.navigate") {
    if (phase !== "before" || exact.length === 0) return exact;
    return [originRootPageScope(exact[0]), ...exact.slice(1)];
  }
  return exact.map(originRootPageScope);
}

function originRootPageScope(scope) {
  return `${splitPageScope(canonicalPageScope(scope)).origin}/`;
}

export function clearPageOriginSessionGrants() {
  pageOriginSessionGrants.clear();
}

async function authorizePageScopes(scopes, originGrant, context, metadata, callGrants = new Set()) {
  const requested = [...new Set(scopes.map(canonicalPageScope))].sort();
  if (requested.length === 0) return;
  const sessionMode = originGrant === "session";
  const sessionID = sessionMode ? requirePermissionSessionID(context?.sessionID) : null;
  const grants = [...callGrants, ...(sessionID == null ? [] : (pageOriginSessionGrants.get(sessionID) ?? []))];
  const missing = requested.filter((scope) => !grants.some((grant) => pageScopeCovers(grant, scope)));
  if (missing.length === 0) return;
  await context.ask({
    permission: PAGE_ORIGIN_PERMISSION,
    patterns: missing,
    always: missing,
    metadata: {
      ...metadata,
      action: metadata?.action ?? "Access browser pages",
      originCount: missing.length,
      origins: missing
    }
  }).catch((error) => {
    if (error && typeof error === "object") error.pageOriginDenied = true;
    throw error;
  });
  for (const scope of missing) callGrants.add(scope);
  if (sessionID != null) cachePageOriginSessionGrants(sessionID, missing);
}

async function resolvePageScopes(name, args, pageMetadata) {
  if (DESTINATION_SCOPED_TOOLS.has(name)) return args.url == null ? [] : [canonicalPageScope(args.url)];
  if (name === "chrome_batch") return resolveBatchPageScopes(args.actions, pageMetadata);
  if (name === "chrome_workflow_run") {
    const workflow = await bridgeCommand("workflowGet", workflowSelector(args));
    if (!Array.isArray(workflow.steps)) throw new Error("Workflow steps must be an array");
    const tabIds = [...new Set(workflow.steps.map((step) => step?.params?.tabId).filter(Number.isInteger))];
    const currentScopes = await scopesForTabIds(tabIds, pageMetadata);
    const origins = [...new Set([
      ...currentScopes.map(originRootPageScope),
      ...workflow.steps
        .filter((step) => step?.method === "navigate" && typeof step.params?.url === "string")
        .map((step) => originRootPageScope(canonicalPageScope(step.params.url)))
    ])].sort();
    args.expectedOrigins = origins;
    return origins;
  }
  if (name === "chrome_tabs") {
    return scopesFromTabs(filterPublicPageMetadata(await bridgeCommand("listTabs")));
  }
  if (name === "chrome_cdp_targets") {
    return scopesFromTabs(filterPublicPageMetadata(await bridgeCommand("cdpTargets")));
  }
  if (name === "chrome_events") {
    return pageScopesFromObject(filterOriginBearingEvents(await pollEvents(args.since ?? 0)));
  }
  if (name === "chrome_cdp" && !Number.isInteger(args.tabId)) {
    if (typeof args.targetId !== "string" || args.targetId.length === 0) {
      throw new Error("chrome_cdp requires tabId for origin-scoped authorization, or a valid targetId");
    }
    const targets = await bridgeCommand("cdpTargets");
    const target = Array.isArray(targets) ? targets.find((entry) => entry?.id === args.targetId || entry?.targetId === args.targetId) : null;
    if (typeof target?.url !== "string") throw new Error("Unable to resolve the CDP target page origin");
    if (!Number.isInteger(target.tabId)) throw new Error("CDP target is not bound to a top-level Chrome tab");
    args.tabId = target.tabId;
    const scopes = [canonicalPageScope(target.url)];
    if (args.method === "Page.navigate") scopes.push(canonicalPageScope(args.commandParams?.url));
    return scopes;
  }
  if (TAB_SCOPED_TOOLS.has(name)) {
    if (Number.isInteger(args.tabId)) {
      const scopes = [await scopeForTab(args.tabId, pageMetadata)];
      if (name === "chrome_cdp" && args.method === "Page.navigate") {
        scopes.push(canonicalPageScope(args.commandParams?.url));
      }
      return scopes;
    }
    if (name === "chrome_screenshot" || name === "chrome_screenshot_region") {
      const activeTabs = (await bridgeCommand("listTabs")).filter((tab) => tab?.active === true);
      if (activeTabs.length === 0) throw new Error("Unable to resolve an active page origin for the screenshot");
      return scopesFromTabs(activeTabs);
    }
    throw new Error(`${name} requires a tabId for origin-scoped page access`);
  }
  return [];
}

function workflowSelector(args) {
  return Object.fromEntries(["id", "name", "shortcut"]
    .filter((field) => args?.[field] != null)
    .map((field) => [field, args[field]]));
}

async function resolvePageBindings(name, args, pageMetadata) {
  let tabIds = [];
  if (name === "chrome_batch") tabIds = batchTabIds(args.actions);
  else if (name === "chrome_workflow_run") {
    const workflow = await bridgeCommand("workflowGet", workflowSelector(args));
    if (!Array.isArray(workflow?.steps)) throw new Error("Workflow steps must be an array");
    tabIds = [...new Set(workflow.steps.map((step) => step?.params?.tabId).filter(Number.isInteger))];
  }
  else if (Number.isInteger(args?.tabId)) tabIds = [args.tabId];
  if (tabIds.length === 0) return [];
  const bindings = [];
  for (const tabId of tabIds) {
    const tab = await tabMetadata(tabId, pageMetadata);
    if (typeof tab?.documentId !== "string" || !Number.isInteger(tab?.navigationGeneration)) continue;
    bindings.push({
      documentId: tab.documentId,
      navigationGeneration: tab.navigationGeneration,
      pageScope: canonicalPageScope(tab.url),
      tabId
    });
  }
  return bindings;
}

function validateRawCdpAccess(name, args) {
  if (name !== "chrome_cdp") return;
  if (!ALLOWED_RAW_PAGE_CDP_METHODS.has(args.method)) {
    throw new Error(`CDP method ${String(args.method)} is not allowed; use a dedicated high-level browser tool`);
  }
}

async function resolvePostExecutionPageScopes(name, args, result) {
  if (name === "chrome_close_tab") return [];
  if (name === "chrome_batch") return scopesForTabIds(batchTabIds(args.actions));
  if (name === "chrome_tabs") return scopesFromTabs(filterPublicPageMetadata(await bridgeCommand("listTabs")));
  if (name === "chrome_cdp_targets") return scopesFromTabs(filterPublicPageMetadata(await bridgeCommand("cdpTargets")));
  if (name === "chrome_events") return [];
  if (DESTINATION_SCOPED_TOOLS.has(name)) {
    if (Number.isInteger(args.tabId)) return [await scopeForTab(args.tabId)];
    const output = parseToolOutput(result);
    if (name === "chrome_open_window" && Number.isInteger(output?.id)) {
      const tabs = await bridgeCommand("listTabs");
      if (!Array.isArray(tabs)) throw new Error("Chrome tab metadata must be an array");
      return scopesFromTabs(tabs.filter((tab) => tab?.windowId === output.id));
    }
    const createdTabs = Array.isArray(output?.tabs) ? output.tabs : [output];
    const scopes = [];
    for (const tab of createdTabs) {
      if (Number.isInteger(tab?.id)) scopes.push(await scopeForTab(tab.id));
      else if (typeof tab?.url === "string") scopes.push(canonicalPageScope(tab.url));
    }
    return scopes;
  }
  if (TAB_SCOPED_TOOLS.has(name) && Number.isInteger(args.tabId)) return [await scopeForTab(args.tabId)];
  if ((name === "chrome_screenshot" || name === "chrome_screenshot_region") && args.tabId == null) {
    return resolvePageScopes(name, args);
  }
  if (name === "chrome_cdp" && typeof args.targetId === "string") {
    return resolvePageScopes(name, args);
  }
  return [];
}

async function resolveImplicitPageTarget(name, args) {
  if ((name !== "chrome_screenshot" && name !== "chrome_screenshot_region") || Number.isInteger(args.tabId)) return;
  const tab = await bridgeCommand("getActiveTab");
  if (!Number.isInteger(tab?.id) || !isPagePermissionUrl(tab.url)) {
    throw new Error("The actual active screenshot tab is not an authorized web page");
  }
  args.tabId = tab.id;
}

async function resolveBatchPageScopes(actions, pageMetadata) {
  const scopes = [];
  const currentTabIds = new Set();
  for (const action of actions) {
    if (action?.type === "navigate") {
      scopes.push(canonicalPageScope(action.params?.url));
      continue;
    }
    if (action?.type === "waitFor" && action.params?.condition?.type === "download") continue;
    if (Number.isInteger(action?.params?.tabId)) currentTabIds.add(action.params.tabId);
  }
  scopes.push(...await scopesForTabIds([...currentTabIds], pageMetadata));
  return [...new Set(scopes)].sort();
}

function batchTabIds(actions) {
  return [...new Set(actions
    .map((action) => action?.params?.tabId)
    .filter(Number.isInteger))];
}

async function scopesForTabIds(tabIds, pageMetadata) {
  return Promise.all(tabIds.map((tabId) => scopeForTab(tabId, pageMetadata)));
}

async function scopeForTab(tabId, pageMetadata) {
  const tab = await tabMetadata(tabId, pageMetadata);
  if (typeof tab?.url !== "string") throw new Error(`Chrome tab ${tabId} did not expose a page URL`);
  return canonicalPageScope(tab.url);
}

async function tabMetadata(tabId, cache) {
  if (cache?.has(tabId)) return cache.get(tabId);
  const tab = await bridgeCommand("getTab", { tabId });
  cache?.set(tabId, tab);
  return tab;
}

function scopesFromTabs(tabs) {
  if (!Array.isArray(tabs)) throw new Error("Chrome tab metadata must be an array");
  return [...new Set(tabs.flatMap((tab) => {
    if (typeof tab?.url !== "string") throw new Error("Chrome tab did not expose a page URL");
    return isPagePermissionUrl(tab.url) ? [canonicalPageScope(tab.url)] : [];
  }))].sort();
}

function filterPublicPageMetadata(entries) {
  if (!Array.isArray(entries)) throw new Error("Chrome page metadata must be an array");
  return entries.filter((entry) => isPagePermissionUrl(entry?.url));
}

function filterOriginBearingEvents(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.events)) return payload;
  return {
    ...payload,
    events: payload.events.filter((entry) => {
      const event = entry?.event ?? entry;
      if (event?.category === "cdp") {
        return typeof event.pageScope === "string"
          && Number.isInteger(event.navigationGeneration)
          && isPagePermissionUrl(event.pageScope);
      }
      return !containsUnsupportedPageUrl(event);
    })
  };
}

export function sanitizeOriginBearingEvents(payload) {
  return filterOriginBearingEvents(payload);
}

function containsUnsupportedPageUrl(value) {
  if (!value || typeof value !== "object") return false;
  for (const [key, entry] of Object.entries(value)) {
    if ((key === "url" || key === "pendingUrl") && typeof entry === "string" && !isPagePermissionUrl(entry)) return true;
    if (entry && typeof entry === "object" && containsUnsupportedPageUrl(entry)) return true;
  }
  return false;
}

function pageScopesFromObject(value) {
  const scopes = [];
  if (!value || typeof value !== "object") return scopes;
  for (const [key, entry] of Object.entries(value)) {
    if ((key === "url" || key === "pendingUrl" || key === "pageScope") && isPagePermissionUrl(entry)) scopes.push(canonicalPageScope(entry));
    else if (entry && typeof entry === "object") scopes.push(...pageScopesFromObject(entry));
  }
  return [...new Set(scopes)].sort();
}

function withoutOriginGrant(args) {
  if (!args || typeof args !== "object") return args;
  const clean = { ...args };
  delete clean.originGrant;
  return clean;
}

function normalizePermissionPath(pathname) {
  const pathValue = pathname || "/";
  const normalized = pathValue.replace(/%([0-9a-fA-F]{2})/gu, (encoded, hex) => {
    const value = Number.parseInt(hex, 16);
    const character = String.fromCharCode(value);
    return /[A-Za-z0-9._~-]/u.test(character) ? character : `%${hex.toUpperCase()}`;
  });
  return normalized;
}

function isPagePermissionUrl(value) {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function parseToolOutput(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function pageScopeFromMismatchError(error) {
  const match = /Page scope changed or is not authorized: (https?:\/\/\S+)/u.exec(error?.message ?? "");
  return match ? canonicalPageScope(match[1]) : null;
}

function pageScopesFromReturnedResult(name, args, value) {
  const output = parseToolOutput(value);
  if (name === "chrome_tabs" || name === "chrome_cdp_targets") {
    return Array.isArray(output) ? scopesFromTabs(output) : [];
  }
  if (name === "chrome_events") return pageScopesFromObject(output);
  if (name === "chrome_read_page") {
    return isPagePermissionUrl(output?.context?.url) ? [canonicalPageScope(output.context.url)] : [];
  }
  if (name === "chrome_batch") {
    if (!Array.isArray(output?.results)) return [];
    return output.results.flatMap((entry) => {
      const action = args.actions?.[entry?.index];
      if (!action || !BATCH_RETURNED_URL_ACTIONS.has(action.type)) return [];
      return isPagePermissionUrl(entry?.result?.url) ? [canonicalPageScope(entry.result.url)] : [];
    });
  }
  if (RETURNED_URL_TOOLS.has(name) && isPagePermissionUrl(output?.url)) {
    return [canonicalPageScope(output.url)];
  }
  return [];
}

function splitPageScope(scope) {
  const parsed = new URL(scope);
  const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
  return {
    origin: `${parsed.protocol}//${parsed.hostname}:${port}`,
    path: normalizePermissionPath(parsed.pathname)
  };
}

function requirePermissionSessionID(sessionID) {
  if (typeof sessionID !== "string" || sessionID.length === 0 || sessionID.length > 200) {
    throw new Error("originGrant session requires a bounded OpenCode context.sessionID");
  }
  return sessionID;
}

function cachePageOriginSessionGrants(sessionID, scopes) {
  let grants = pageOriginSessionGrants.get(sessionID);
  if (!grants) {
    if (pageOriginSessionGrants.size >= MAX_ORIGIN_GRANT_SESSIONS) {
      pageOriginSessionGrants.delete(pageOriginSessionGrants.keys().next().value);
    }
    grants = new Set();
    pageOriginSessionGrants.set(sessionID, grants);
  }
  for (const scope of scopes) {
    if (grants.size >= MAX_ORIGIN_GRANTS_PER_SESSION) break;
    grants.add(scope);
  }
}

export function requiredCapabilitiesForTool(name, args) {
  const required = TOOL_CAPABILITY_REQUIREMENTS[name];
  if (!required) throw new Error(`Browser tool ${name} is missing an explicit capability declaration`);
  if (name === "chrome_batch") {
    if (!Array.isArray(args?.actions) || args.actions.length === 0 || args.actions.length > 25) {
      throw new Error("chrome_batch requires between 1 and 25 typed actions");
    }
    const union = new Set(required);
    for (const action of args.actions) {
      for (const capability of requiredCapabilitiesForBatchAction(action)) union.add(capability);
    }
    return [...union].sort();
  }
  if (name === "chrome_read_page" && args?.includeScreenshot !== true) {
    return required.filter((capability) => capability !== "browser.screenshots" && capability !== "browser.windows");
  }
  if (name === "chrome_wait_for") {
    if (args?.condition?.type === "download") {
      return required.filter((capability) => capability !== "browser.cdp" && capability !== "browser.tabs");
    }
    if (args?.condition?.type !== "networkIdle") {
      return required.filter((capability) => capability !== "browser.cdp" && capability !== "browser.downloads");
    }
    return required.filter((capability) => capability !== "browser.downloads");
  }
  return required;
}

function requiredCapabilitiesForBatchAction(action) {
  if (action?.type === "waitFor") {
    const conditionType = action.params?.condition?.type;
    if (conditionType === "download") return ["browser.downloads", "browser.wait"];
    if (conditionType === "networkIdle") return ["browser.cdp", "browser.tabs", "browser.wait"];
    return ["browser.tabs", "browser.wait"];
  }
  const required = BATCH_ACTION_CAPABILITIES[action?.type];
  if (!required) throw new Error(`chrome_batch action type ${String(action?.type)} is not allowed`);
  return required;
}

function previewText(value) {
  if (typeof value !== "string") return undefined;
  return value.length > 200 ? `${value.slice(0, 200)}…` : value;
}

export async function uploadWorkspaceFiles({
  command = bridgeCommand,
  directory,
  paths,
  ref,
  signal,
  tabId,
  chunkBytes = UPLOAD_CHUNK_BYTES
}) {
  if (typeof directory !== "string" || directory.length === 0) throw new Error("workspace directory is required");
  if (!Array.isArray(paths) || paths.length === 0) throw new Error("upload requires at least one file");
  if (paths.length > MAX_UPLOAD_FILES) throw new Error(`upload supports at most ${MAX_UPLOAD_FILES} files`);
  if (!Number.isInteger(chunkBytes) || chunkBytes < 1 || chunkBytes > UPLOAD_CHUNK_BYTES) {
    throw new Error(`upload chunkBytes must be between 1 and ${UPLOAD_CHUNK_BYTES}`);
  }
  const workspace = await realpath(directory);
  const files = [];
  let totalBytes = 0;
  let transferId;
  try {
    for (const inputPath of paths) {
      throwIfUploadAborted(signal);
      if (typeof inputPath !== "string" || inputPath.length === 0 || inputPath.length > 4096) {
        throw new Error("upload path is invalid");
      }
      const candidate = path.resolve(workspace, inputPath);
      const resolved = await realpath(candidate).catch(() => { throw new Error(`upload file does not exist: ${inputPath}`); });
      assertUploadPathWithin(workspace, resolved, inputPath);
      let handle;
      try {
        handle = await open(resolved, "r");
        const info = await handle.stat();
        const boundPath = await realpath(candidate).catch(() => { throw new Error(`upload file changed during validation: ${inputPath}`); });
        assertUploadPathWithin(workspace, boundPath, inputPath);
        const boundInfo = await lstat(boundPath);
        if (boundInfo.dev !== info.dev || boundInfo.ino !== info.ino) {
          throw new Error(`upload file identity changed during validation: ${inputPath}`);
        }
        if (!info.isFile()) throw new Error(`upload path is not a regular file: ${inputPath}`);
        totalBytes += info.size;
        if (!Number.isSafeInteger(totalBytes) || totalBytes > MAX_UPLOAD_TOTAL_BYTES) {
          throw new Error(`upload total exceeds ${MAX_UPLOAD_TOTAL_BYTES} bytes`);
        }
        files.push({
          chunkCount: Math.ceil(info.size / chunkBytes),
          handle,
          name: path.basename(candidate),
          size: info.size,
          type: "application/octet-stream"
        });
        handle = null;
      } finally {
        await handle?.close();
      }
    }
    throwIfUploadAborted(signal);
    const begun = await command("fileUploadBegin", {
      tabId,
      totalBytes,
      files: files.map(({ chunkCount, name, size, type }) => ({ chunkCount, name, size, type }))
    }, { signal });
    transferId = begun?.transferId;
    if (typeof transferId !== "string" || transferId.length < 8 || transferId.length > 128) {
      throw new Error("bridge returned an invalid upload transfer id");
    }
    for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
      const file = files[fileIndex];
      let position = 0;
      for (let chunkIndex = 0; chunkIndex < file.chunkCount; chunkIndex += 1) {
        throwIfUploadAborted(signal);
        const expected = Math.min(chunkBytes, file.size - position);
        const buffer = Buffer.allocUnsafe(expected);
        const { bytesRead } = await file.handle.read(buffer, 0, expected, position);
        if (bytesRead !== expected) throw new Error(`upload file changed while reading: ${file.name}`);
        await command("fileUploadChunk", {
          transferId,
          fileIndex,
          chunkIndex,
          data: buffer.toString("base64")
        }, { signal });
        position += bytesRead;
      }
    }
    throwIfUploadAborted(signal);
    return await command("fileUploadCommit", { transferId, tabId, ref }, { signal });
  } catch (error) {
    if (transferId) {
      try { await command("fileUploadAbort", { transferId }); } catch {}
    }
    throw error;
  } finally {
    await Promise.all(files.map((file) => file.handle.close().catch(() => {})));
  }
}

function assertUploadPathWithin(workspace, resolved, inputPath) {
  const relative = path.relative(workspace, resolved);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`upload path escapes outside the workspace: ${inputPath}`);
  }
}

function throwIfUploadAborted(signal) {
  if (!signal?.aborted) return;
  throw signal.reason instanceof Error ? signal.reason : new Error("file upload was cancelled");
}

function requireArtifactDirectoryWhenRequested(args) {
  if ((args.includeScreenshot === true || args.saveText === true)
    && (typeof args.outputDirectory !== "string" || args.outputDirectory.length === 0)) {
    throw new Error("outputDirectory is required when includeScreenshot or saveText is enabled");
  }
}

async function maybeMaterializeContext(context, args, projectDirectory) {
  if (typeof args.outputDirectory !== "string" || args.outputDirectory.length === 0) {
    return { artifact: null, context };
  }
  return materializeContextText({
    context,
    force: args.saveText === true,
    outputDirectory: args.outputDirectory,
    previewChars: args.previewChars,
    projectDirectory
  });
}

async function resolveProjectOutputPath(projectDirectory, outputPath, fieldName) {
  const resolvedDir = await realpath(projectDirectory);
  const resolvedPath = path.isAbsolute(outputPath)
    ? path.resolve(outputPath)
    : path.resolve(resolvedDir, outputPath);
  assertPathWithin(resolvedDir, resolvedPath, fieldName);

  const nearestExistingPath = await nearestExistingAncestor(resolvedPath);
  const nearestExistingRealPath = await realpath(nearestExistingPath);
  assertPathWithin(resolvedDir, nearestExistingRealPath, fieldName);

  return resolvedPath;
}

async function nearestExistingAncestor(candidatePath) {
  let current = candidatePath;
  while (true) {
    try {
      await lstat(current);
      return current;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      const parent = path.dirname(current);
      if (parent === current) throw error;
      current = parent;
    }
  }
}

function assertPathWithin(root, candidate, fieldName) {
  const relative = path.relative(root, candidate);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) return;
  throw new Error(`${fieldName} must be within the project directory: ${root}`);
}

async function loadOpenCodeTool() {
  const resolvedPath = import.meta.resolve("@opencode-ai/plugin");
  return import(resolvedPath);
}
