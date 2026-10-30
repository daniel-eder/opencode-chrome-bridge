import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import {
  installOpenCodePlugin,
  LEGACY_PLUGIN_KEY,
  parseJsonc,
  PLUGIN_KEY,
  prunePluginPath,
  withPluginPath
} from "../scripts/lib/opencode-config.mjs";
import pluginEntry from "../src/plugin-entry.js";
import {
  createToolContext,
  toInputSchema,
  toToolResult,
  PLUGIN_ID
} from "../src/plugin.js";
import {
  readServiceRegistration,
  requestPermission,
  resetServiceEndpointCache,
  serviceAuthorizationHeader,
  serviceRegistrationPath
} from "../src/opencode-service-client.js";

const repoRoot = path.resolve(import.meta.dirname, "..");

async function loadSchema() {
  const { tool } = await import("@opencode-ai/plugin");
  return tool.schema;
}

function stubPluginContext(directory = "/workspace/project") {
  return { session: { get: async () => ({ location: { directory } }) } };
}

function stubToolContext(overrides = {}) {
  return { sessionID: "ses_1", messageID: "msg_1", agent: "build", id: "call_1", ...overrides };
}

test("plugin entrypoint exposes only the plugin module OpenCode validates", async () => {
  const namespace = await import("../src/plugin-entry.js");
  assert.deepEqual(Object.keys(namespace), ["default"]);
  assert.equal(pluginEntry.id, PLUGIN_ID);
  assert.equal(typeof pluginEntry.setup, "function");
});

test("plugin setup registers every tool with a JSON Schema input", async () => {
  const added = [];
  let disposed = false;
  const context = {
    ...stubPluginContext(),
    tool: {
      transform: async (callback) => {
        callback({ add: (definition) => added.push(definition) });
        return { dispose: async () => { disposed = true; } };
      }
    }
  };

  const cleanup = await pluginEntry.setup(context);

  const sharedPlugin = (await import("../src/opencode-plugin.js")).default;
  const { tool: sharedTools } = await sharedPlugin();
  assert.deepEqual(added.map((entry) => entry.name), Object.keys(sharedTools));
  assert.ok(added.length > 0);
  for (const definition of added) {
    assert.equal(typeof definition.description, "string");
    assert.equal(definition.input.type, "object");
    assert.equal(typeof definition.execute, "function");
    // Code mode would batch calls behind the per-origin approval wrapper.
    assert.equal(definition.options.codemode, false);
    // The approval wrapper raises its own prompt; a declared permission action
    // would make OpenCode ask a second time for the same call.
    assert.equal(definition.options.permission, undefined);
  }

  await cleanup();
  assert.equal(disposed, true);
});

test("Zod defaults stay optional in the published input schema", async () => {
  const schema = await loadSchema();
  const input = toInputSchema({
    url: schema.string(),
    originGrant: schema.enum(["once", "session"]).default("once")
  }, schema);

  assert.deepEqual(input.required, ["url"]);
  assert.equal(input.additionalProperties, false);
  assert.deepEqual(input.properties.originGrant.enum, ["once", "session"]);
});

test("tool results become OpenCode content", () => {
  assert.deepEqual(toToolResult("{\"ok\":true}"), { content: "{\"ok\":true}" });
  assert.deepEqual(
    toToolResult({
      title: "Screenshot",
      output: "saved",
      metadata: { tabId: 7 },
      attachments: [{ type: "file", mime: "image/png", url: "file:///shot.png", filename: "shot.png" }]
    }),
    {
      content: [
        { type: "text", text: "saved" },
        { type: "file", uri: "file:///shot.png", mime: "image/png", name: "shot.png" }
      ],
      metadata: { tabId: 7, title: "Screenshot" }
    }
  );
});

test("the tool context is rebuilt from the OpenCode session", async () => {
  let sessionLookups = 0;
  const pluginContext = {
    session: {
      get: async ({ sessionID }) => {
        sessionLookups += 1;
        assert.equal(sessionID, "ses_1");
        return { location: { directory: "/workspace/project" } };
      }
    }
  };
  const directories = new Map();

  const first = await createToolContext(stubToolContext(), pluginContext, directories);
  const second = await createToolContext(stubToolContext(), pluginContext, directories);

  assert.equal(first.directory, "/workspace/project");
  assert.equal(first.worktree, "/workspace/project");
  assert.equal(first.sessionID, "ses_1");
  assert.equal(first.messageID, "msg_1");
  assert.equal(first.agent, "build");
  assert.equal(first.abort instanceof AbortSignal, true);
  assert.equal(first.abort.aborted, false);
  assert.equal(second.directory, "/workspace/project");
  assert.equal(sessionLookups, 1, "session directory is resolved once per session");
});

test("tools refuse to run without a session-scoped context", async () => {
  await assert.rejects(
    createToolContext({ messageID: "msg_1" }, stubPluginContext(), new Map()),
    /session-scoped tool context/u
  );
});

test("metadata updates are forwarded to progress", async () => {
  const updates = [];
  const context = await createToolContext(
    stubToolContext({ progress: async (update) => updates.push(update) }),
    stubPluginContext(),
    new Map()
  );

  context.metadata({ title: "Navigating", metadata: { tabId: 3 } });
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(updates, [{ tabId: 3, title: "Navigating" }]);
});

test("approval prompts are raised through the OpenCode permission API", async () => {
  resetServiceEndpointCache();
  const requests = [];
  const fetchImpl = async (url, init) => {
    requests.push({ url, init });
    if (url.endsWith("/api/info") || url.endsWith("/api/health")) return new Response("{}", { status: 200 });
    return Response.json({ data: { id: "per_1", effect: "allow" } });
  };
  const context = await createToolContext(stubToolContext(), stubPluginContext(), new Map(), {
    fetchImpl,
    read: async () => JSON.stringify({ url: "http://127.0.0.1:4321", password: "secret" })
  });

  await context.ask({
    permission: "chrome_open",
    patterns: ["chrome_open"],
    always: ["chrome_open"],
    metadata: { action: "Open a page" }
  });

  const permissionRequest = requests.at(-1);
  assert.equal(permissionRequest.url, "http://127.0.0.1:4321/api/session/ses_1/permission");
  assert.equal(permissionRequest.init.method, "POST");
  assert.equal(permissionRequest.init.headers.authorization, serviceAuthorizationHeader("secret"));
  assert.deepEqual(JSON.parse(permissionRequest.init.body), {
    action: "chrome_open",
    resources: ["chrome_open"],
    save: ["chrome_open"],
    metadata: { action: "Open a page" },
    agent: "build",
    source: { type: "tool", messageID: "msg_1", id: "call_1" }
  });
  resetServiceEndpointCache();
});

test("a denied permission stops the tool", async () => {
  resetServiceEndpointCache();
  const fetchImpl = async (url) => url.endsWith("/api/info") || url.endsWith("/api/health")
    ? new Response("{}", { status: 200 })
    : Response.json({ data: { id: "per_1", effect: "deny" } });

  await assert.rejects(
    requestPermission({ sessionID: "ses_1", action: "chrome_open", resources: ["chrome_open"] }, {
      fetchImpl,
      read: async () => JSON.stringify({ url: "http://127.0.0.1:4321", password: "secret" })
    }),
    /Permission denied for chrome_open/u
  );
  resetServiceEndpointCache();
});

test("an unreachable session fails closed with an actionable message", async () => {
  resetServiceEndpointCache();
  const fetchImpl = async (url) => url.endsWith("/api/info") || url.endsWith("/api/health")
    ? new Response("{}", { status: 200 })
    : new Response("", { status: 404 });

  await assert.rejects(
    requestPermission({ sessionID: "ses_missing", action: "chrome_open", resources: ["chrome_open"] }, {
      fetchImpl,
      read: async () => JSON.stringify({ url: "http://127.0.0.1:4321", password: "secret" })
    }),
    /--standalone cannot approve browser access/u
  );
  resetServiceEndpointCache();
});

test("the service health probe falls back to the legacy endpoint", async () => {
  resetServiceEndpointCache();
  const fetchImpl = async (url) => url.endsWith("/api/info")
    ? new Response("{}", { status: 404 })
    : url.endsWith("/api/health")
      ? new Response("{}", { status: 200 })
      : Response.json({ data: { id: "per_1", effect: "allow" } });
  const context = await createToolContext(stubToolContext(), stubPluginContext(), new Map(), {
    fetchImpl,
    read: async () => JSON.stringify({ url: "http://127.0.0.1:4321", password: "secret" })
  });

  await context.ask({
    permission: "chrome_open",
    patterns: ["chrome_open"],
    always: ["chrome_open"],
    metadata: { action: "Open a page" }
  });
  resetServiceEndpointCache();
});

test("a missing service health endpoint fails closed", async () => {
  resetServiceEndpointCache();
  const fetchImpl = async () => new Response("{}", { status: 404 });

  await assert.rejects(
    requestPermission({ sessionID: "ses_1", action: "chrome_open", resources: ["chrome_open"] }, {
      fetchImpl,
      read: async () => JSON.stringify({ url: "http://127.0.0.1:4321", password: "secret" })
    }),
    /service health check failed with status 404/u
  );
  resetServiceEndpointCache();
});

test("the OpenCode service registration must be local and authenticated", async () => {
  await assert.rejects(
    readServiceRegistration({ read: async () => JSON.stringify({ url: "http://example.com", password: "x" }) }),
    /not local/u
  );
  await assert.rejects(
    readServiceRegistration({ read: async () => JSON.stringify({ url: "http://127.0.0.1:4321" }) }),
    /missing a password/u
  );
  await assert.rejects(
    readServiceRegistration({
      file: "/missing/service.json",
      read: async () => { throw Object.assign(new Error("nope"), { code: "ENOENT" }); }
    }),
    /registration not found at \/missing\/service\.json/u
  );
  assert.equal(
    serviceRegistrationPath({ XDG_STATE_HOME: "/state" }),
    path.join("/state", "opencode", "service.json")
  );
});

test("config entries leave unrelated keys alone", () => {
  const parsed = parseJsonc(`{
    "plugin": ["/home/ada/bridge"],
    "theme": "dark"
  }`);
  const once = withPluginPath(parsed, "/home/ada/bridge", PLUGIN_KEY);
  const twice = withPluginPath(once, "/home/ada/bridge", PLUGIN_KEY);

  assert.deepEqual(twice.theme, "dark");
  assert.deepEqual(twice.plugins, ["/home/ada/bridge"]);
});

test("object plugin entries are recognised instead of duplicated", () => {
  const config = { plugins: [{ package: "/home/ada/bridge", options: { verbose: true } }] };

  assert.deepEqual(withPluginPath(config, "/home/ada/bridge", PLUGIN_KEY).plugins, config.plugins);
  assert.throws(
    () => withPluginPath({ plugins: [42] }, "/home/ada/bridge", PLUGIN_KEY),
    /strings or \{ package \} objects/u
  );
});

test("the legacy file entry is migrated to the package root", () => {
  const stale = "/home/ada/bridge/src/plugin-entry-v2.js";
  const parsed = parseJsonc(`{
    "plugins": ["${stale}"]
  }`);

  assert.deepEqual(
    withPluginPath(parsed, "/home/ada/bridge", PLUGIN_KEY, { stale: [stale] }).plugins,
    ["/home/ada/bridge"]
  );
});

test("migrating the legacy file entry keeps object options", () => {
  const stale = "/home/ada/bridge/src/plugin-entry-v2.js";
  const config = { plugins: [{ package: stale, options: { verbose: true } }] };

  assert.deepEqual(
    withPluginPath(config, "/home/ada/bridge", PLUGIN_KEY, { stale: [stale] }).plugins,
    [{ package: "/home/ada/bridge", options: { verbose: true } }]
  );
});

test("migrating the legacy file entry removes the duplicate when the root exists", () => {
  const stale = "/home/ada/bridge/src/plugin-entry-v2.js";
  const config = { plugins: [stale, "/home/ada/bridge"] };

  assert.deepEqual(
    withPluginPath(config, "/home/ada/bridge", PLUGIN_KEY, { stale: [stale] }).plugins,
    ["/home/ada/bridge"]
  );
});

test("pruning the legacy plugin key keeps other plugins", () => {
  const config = {
    plugins: ["/home/ada/bridge"],
    [LEGACY_PLUGIN_KEY]: ["/home/ada/bridge", "/home/ada/other"]
  };

  assert.deepEqual(prunePluginPath(config, "/home/ada/bridge", LEGACY_PLUGIN_KEY), {
    plugins: ["/home/ada/bridge"],
    [LEGACY_PLUGIN_KEY]: ["/home/ada/other"]
  });
});

test("pruning an empty legacy plugin key removes the key", () => {
  assert.deepEqual(
    prunePluginPath({ plugins: [], [LEGACY_PLUGIN_KEY]: ["/home/ada/bridge"] }, "/home/ada/bridge", LEGACY_PLUGIN_KEY),
    { plugins: [] }
  );
});

test("installing the plugin entry preserves object entries and comments", async () => {
  const original = `{
  // Keep this user explanation.
  "plugins": [
    { "package": "opencode-acme-plugin", "options": { "enabled": true } }
  ]
}`;
  let written = null;

  const result = await installOpenCodePlugin({
    configPath: "/home/ada/.config/opencode/opencode.jsonc",
    configDirectory: "/home/ada/.config/opencode",
    pluginPath: "/home/ada/bridge",
    key: PLUGIN_KEY,
    readFile: async () => original,
    writeFile: async (_, contents) => { written = contents; },
    mkdir: async () => {}
  });

  assert.equal(result.changed, true);
  assert.match(written, /Keep this user explanation/u);
  assert.deepEqual(parseJsonc(written).plugins, [
    { package: "opencode-acme-plugin", options: { enabled: true } },
    "/home/ada/bridge"
  ]);
});

test("installing the plugin entry migrates the legacy file path in place", async () => {
  const original = `{
  // Keep this user explanation.
  "plugins": [
    // The old file entry.
    "/home/ada/bridge/src/plugin-entry-v2.js"
  ]
}`;
  let written = null;

  const result = await installOpenCodePlugin({
    configPath: "/home/ada/.config/opencode/opencode.jsonc",
    configDirectory: "/home/ada/.config/opencode",
    pluginPath: "/home/ada/bridge",
    key: PLUGIN_KEY,
    stale: ["/home/ada/bridge/src/plugin-entry-v2.js"],
    readFile: async () => original,
    writeFile: async (_, contents) => { written = contents; },
    mkdir: async () => {}
  });

  assert.equal(result.changed, true);
  assert.match(written, /Keep this user explanation/u);
  assert.match(written, /The old file entry/u);
  assert.deepEqual(parseJsonc(written).plugins, ["/home/ada/bridge"]);
});

test("installing the plugin entry migrates object file entries without losing options", async () => {
  const original = `{
  "plugins": [
    { "package": "/home/ada/bridge/src/plugin-entry-v2.js", "options": { "verbose": true } }
  ]
}`;
  let written = null;

  await installOpenCodePlugin({
    configPath: "/home/ada/.config/opencode/opencode.jsonc",
    configDirectory: "/home/ada/.config/opencode",
    pluginPath: "/home/ada/bridge",
    key: PLUGIN_KEY,
    stale: ["/home/ada/bridge/src/plugin-entry-v2.js"],
    readFile: async () => original,
    writeFile: async (_, contents) => { written = contents; },
    mkdir: async () => {}
  });

  assert.deepEqual(parseJsonc(written).plugins, [
    { package: "/home/ada/bridge", options: { verbose: true } }
  ]);
});

test("installing the plugin entry prunes the legacy plugin key", async () => {
  const original = `{
  // Keep this user explanation.
  "plugin": [
    "/home/ada/bridge",
    "opencode-other-plugin"
  ],
  "plugins": []
}`;
  let written = null;

  const result = await installOpenCodePlugin({
    configPath: "/home/ada/.config/opencode/opencode.jsonc",
    configDirectory: "/home/ada/.config/opencode",
    pluginPath: "/home/ada/bridge",
    key: PLUGIN_KEY,
    prune: [{ key: LEGACY_PLUGIN_KEY, paths: ["/home/ada/bridge"] }],
    readFile: async () => original,
    writeFile: async (_, contents) => { written = contents; },
    mkdir: async () => {}
  });

  assert.equal(result.changed, true);
  assert.match(written, /Keep this user explanation/u);
  assert.deepEqual(parseJsonc(written).plugins, ["/home/ada/bridge"]);
  assert.deepEqual(parseJsonc(written).plugin, ["opencode-other-plugin"]);
});

test("the package exposes the plugin entrypoint for direct config references", async () => {
  const manifest = parseJsonc(await import("node:fs/promises").then((fs) => fs.readFile(
    path.join(repoRoot, "package.json"),
    "utf8"
  )));

  assert.equal(manifest.exports["."], "./src/plugin-entry.js");
  assert.equal(manifest.exports["./server"], "./src/plugin-entry.js");
  assert.equal(manifest.exports["./v2"], undefined);
});
