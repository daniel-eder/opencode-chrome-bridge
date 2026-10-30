// OpenCode plugin module.
//
// The plugin is a `{ id, setup }` module that registers tools through
// `ctx.tool.transform()`. Tool inputs are JSON Schema, the project directory
// is resolved from the session, and approval prompts go through OpenCode's
// permission engine on the local service (see ./opencode-service-client.js).
//
// Tool behaviour itself lives in ./opencode-plugin.js, which defines every
// `chrome_*` tool once — including the approval wrapper that makes every
// browser tool deny-by-default. This module only translates that surrounding
// contract. That keeps one source of truth for tool behaviour and security
// policy.
import createChromeBridgePlugin from "./opencode-plugin.js";
import { requestPermission } from "./opencode-service-client.js";

export const PLUGIN_ID = "opencode-chrome-bridge";

export default {
  id: PLUGIN_ID,
  async setup(context) {
    const { tool } = await loadOpenCodeTool();
    const { tool: tools } = await createChromeBridgePlugin();
    const directories = new Map();
    const registration = await context.tool.transform((draft) => {
      for (const [name, definition] of Object.entries(tools)) {
        draft.add(toPluginTool(name, definition, tool.schema, context, directories));
      }
    });
    return () => registration.dispose();
  }
};

export function toPluginTool(name, definition, schema, pluginContext, directories) {
  return {
    name,
    description: definition.description,
    input: toInputSchema(definition.args, schema),
    // The approval wrapper in opencode-plugin.js raises its own permission
    // prompt for every tool, so declaring `options.permission` here would ask
    // the user twice for one call. Code mode is off because the wrapper's
    // per-origin page scoping assumes tools are invoked one call at a time.
    options: { codemode: false },
    async execute(input, toolContext) {
      const context = await createToolContext(toolContext, pluginContext, directories);
      return toToolResult(await definition.execute(input ?? {}, context));
    }
  };
}

export function toInputSchema(args, schema) {
  // `io: "input"` keeps Zod defaults optional in the published schema; without
  // it every defaulted field is advertised to the model as required.
  return schema.toJSONSchema(schema.strictObject(args ?? {}), { io: "input" });
}

export async function createToolContext(toolContext, pluginContext, directories, options = {}) {
  const sessionID = toolContext?.sessionID;
  const directory = await resolveSessionDirectory(sessionID, pluginContext, directories);
  return {
    sessionID,
    messageID: toolContext?.messageID,
    agent: toolContext?.agent,
    directory,
    worktree: directory,
    // OpenCode does not hand tools an abort signal. A signal that never
    // aborts keeps the tool call sites working; their own timeouts still apply.
    abort: toolContext?.abort ?? toolContext?.signal ?? new AbortController().signal,
    metadata(update) {
      const progress = toolContext?.progress;
      if (typeof progress !== "function") return;
      // Fire-and-forget: metadata() is synchronous and callers do not await.
      void Promise.resolve(progress({ ...update?.metadata, title: update?.title })).catch(() => {});
    },
    ask(input) {
      return requestPermission({
        sessionID,
        action: input.permission,
        resources: input.patterns,
        save: input.always,
        metadata: input.metadata,
        agent: toolContext?.agent,
        source: toolContext?.messageID !== undefined && toolContext?.id !== undefined
          ? { type: "tool", messageID: toolContext.messageID, id: toolContext.id }
          : undefined
      }, options);
    }
  };
}

async function resolveSessionDirectory(sessionID, pluginContext, directories) {
  if (typeof sessionID !== "string" || sessionID.length === 0) {
    throw new Error("OpenCode Chrome Bridge tools require a session-scoped tool context");
  }
  if (directories?.has(sessionID)) return directories.get(sessionID);
  const session = await pluginContext.session.get({ sessionID });
  const directory = session?.location?.directory;
  if (typeof directory !== "string" || directory.length === 0) {
    throw new Error(`OpenCode session ${sessionID} did not report a project directory`);
  }
  directories?.set(sessionID, directory);
  return directory;
}

export function toToolResult(result) {
  if (typeof result === "string") return { content: result };
  const content = [{ type: "text", text: result.output }];
  for (const attachment of result.attachments ?? []) {
    content.push({ type: "file", uri: attachment.url, mime: attachment.mime, name: attachment.filename });
  }
  const metadata = result.title === undefined ? result.metadata : { ...result.metadata, title: result.title };
  return metadata === undefined ? { content } : { content, metadata };
}

async function loadOpenCodeTool() {
  const resolvedPath = import.meta.resolve("@opencode-ai/plugin");
  return import(resolvedPath);
}
