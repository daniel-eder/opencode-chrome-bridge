export function parseJsonc(input) {
  // OpenCode on Windows may write its config with a UTF-8 BOM; strip it so
  // JSON.parse accepts an otherwise valid document.
  const withoutBom = input.charCodeAt(0) === 0xFEFF ? input.slice(1) : input;
  return JSON.parse(stripTrailingCommas(stripJsonComments(withoutBom)));
}

// OpenCode reads the `plugins` key, whose entries are either package directory
// strings or `{ package, options }` objects. A previous release wrote the
// entrypoint file directly into `plugins`, which OpenCode skips because it
// only loads directories; those stale file entries are migrated in place.
export const PLUGIN_KEY = "plugins";
// The `plugin` key belongs to the previous plugin generation and is no longer
// installed. The installer removes this repository's path from it when present
// so OpenCode stops logging a failed-to-load warning for the legacy entry.
// Entries belonging to other plugins are never touched.
export const LEGACY_PLUGIN_KEY = "plugin";

export function withPluginPath(config, pluginPath, key = PLUGIN_KEY, { stale = [] } = {}) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new TypeError("OpenCode config must be an object");
  }
  if (config[key] !== undefined && !Array.isArray(config[key])) {
    throw new TypeError(`OpenCode config ${key} must be an array`);
  }
  const plugins = [...(config[key] ?? [])];
  if (plugins.some((entry) => entryPackage(entry) === undefined)) {
    throw new TypeError(
      "OpenCode config plugins array must contain strings or { package } objects"
    );
  }
  // Earlier releases wrote the entrypoint file directly into `plugins`,
  // which OpenCode skips because it only loads directories. Rewrite those
  // entries in place, keeping any options the user attached.
  const stalePaths = new Set(stale.filter((candidate) => candidate !== pluginPath));
  const migrated = [];
  const seenSerialized = new Set();
  for (const entry of plugins) {
    const candidate = stalePaths.has(entryPackage(entry))
      ? (entry !== null && typeof entry === "object" && !Array.isArray(entry)
        ? { ...entry, package: pluginPath }
        : pluginPath)
      : entry;
    // Collapse exact duplicates so a stale entry plus an existing root become
    // one entry instead of loading the plugin twice.
    if (seenSerialized.has(JSON.stringify(candidate))) continue;
    seenSerialized.add(JSON.stringify(candidate));
    migrated.push(candidate);
  }
  if (!migrated.some((entry) => entryPackage(entry) === pluginPath)) migrated.push(pluginPath);
  return { ...config, [key]: migrated };
}

function entryPackage(entry) {
  if (typeof entry === "string") return entry;
  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
    return undefined;
  }
  return typeof entry.package === "string" ? entry.package : undefined;
}

// Remove this repository's path from a legacy config key (parsed-object
// level). Entries belonging to other plugins are preserved.
export function prunePluginPath(config, pluginPath, key) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new TypeError("OpenCode config must be an object");
  }
  if (config[key] === undefined) return config;
  if (!Array.isArray(config[key])) {
    throw new TypeError(`OpenCode config ${key} must be an array`);
  }
  const remaining = config[key].filter((entry) => entryPackage(entry) !== pluginPath);
  if (remaining.length === config[key].length) return config;
  if (remaining.length === 0) {
    const { [key]: _removed, ...rest } = config;
    return rest;
  }
  return { ...config, [key]: remaining };
}

export async function installOpenCodePlugin({
  configPath,
  configDirectory,
  pluginPath,
  key = PLUGIN_KEY,
  stale = [],
  prune = [],
  readFile,
  writeFile,
  mkdir
}) {
  let config = {};
  let source = null;
  try {
    source = await readFile(configPath, "utf8");
    config = parseJsonc(source);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  let updated = withPluginPath(config, pluginPath, key, { stale });
  for (const { key: pruneKey, paths } of prune) {
    for (const prunePath of paths) {
      updated = prunePluginPath(updated, prunePath, pruneKey);
    }
  }
  const changed = JSON.stringify(updated) !== JSON.stringify(config);
  await mkdir(configDirectory, { recursive: true });
  if (changed) {
    let nextSource = source === null
      ? `${JSON.stringify(updated, null, 2)}\n`
      : updatePluginInJsonc(source, updated[key], key, { pluginPath, stale });
    if (source !== null) {
      for (const { key: pruneKey, paths } of prune) {
        nextSource = pruneEntriesFromJsonc(nextSource, pruneKey, paths);
      }
    }
    await writeFile(configPath, nextSource);
  }
  return { configPath, changed };
}

// Remove matching entries from another config key's array in the raw JSONC
// text, preserving comments, entry order, and object options.
function pruneEntriesFromJsonc(source, key, paths) {
  const stale = new Set(paths);
  let updated = source;
  for (;;) {
    const tokens = tokenizeJsonc(updated);
    const [property] = findPluginArrays(tokens, key);
    if (!property || property.closeIndex === null) return updated;
    const elements = collectArrayElements(tokens, property.openIndex, property.closeIndex);
    const spans = [];
    for (const element of elements) {
      const current = elementPackage(tokens, element);
      if (current !== undefined && stale.has(current)) {
        spans.push(removalSpan(tokens, element));
      }
    }
    if (spans.length === 0) return updated;
    for (const span of spans.sort((a, b) => b.start - a.start)) {
      updated = `${updated.slice(0, span.start)}${span.text ?? ""}${updated.slice(span.end)}`;
    }
  }
}

function updatePluginInJsonc(source, plugins, key = PLUGIN_KEY, { pluginPath, stale = [] } = {}) {
  const tokens = tokenizeJsonc(source);
  if (tokens.findIndex((token) => token.type === "{") === -1) {
    throw new SyntaxError("OpenCode config must be a JSON object");
  }

  const properties = findPluginArrays(tokens, key);
  if (properties.length > 1) {
    throw new SyntaxError(`OpenCode config contains duplicate ${key} keys`);
  }
  if (properties.length === 1) {
    const [{ start, openIndex, closeIndex }] = properties;
    if (closeIndex === null) throw new TypeError(`OpenCode config ${key} must be an array`);
    const indent = lineIndentAt(source, start);
    let updated = source;
    if (stale.length > 0) {
      updated = replaceEntryPaths(updated, tokens, openIndex, closeIndex, pluginPath, stale);
    }
    // Re-tokenize so the append sees the text after any path rewrite, and skip
    // the append when a rewritten entry already points at the plugin.
    const updatedTokens = tokenizeJsonc(updated);
    const [current] = findPluginArrays(updatedTokens, key);
    const entries = parseJsonc(updated)[key] ?? [];
    if (entries.some((entry) => entryPackage(entry) === pluginPath)) return updated;
    return appendPluginArrayEntry(
      updated,
      updatedTokens,
      current.openIndex,
      current.closeIndex,
      pluginPath,
      `${indent}  `,
      indent,
      updated.includes("\r\n") ? "\r\n" : "\n"
    );
  }

  return appendRootPlugin(source, tokens, plugins, key);
}

function findPluginArrays(tokens, key = PLUGIN_KEY) {
  let objectDepth = 0;
  let arrayDepth = 0;
  const properties = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type === "{") objectDepth += 1;
    else if (token.type === "}") objectDepth -= 1;
    else if (token.type === "[") arrayDepth += 1;
    else if (token.type === "]") arrayDepth -= 1;
    else if (
      token.type === "string"
      && token.value === key
      && objectDepth === 1
      && arrayDepth === 0
      && tokens[index + 1]?.type === ":"
    ) {
      const openIndex = index + 2;
      const closeIndex = tokens[openIndex]?.type === "[" ? matchingArrayClose(tokens, openIndex) : null;
      properties.push({ start: token.start, keyIndex: index, openIndex, closeIndex });
    }
  }
  return properties;
}

// Rewrite stale plugin paths inside the existing array in place, so the
// surrounding comments, entry order, and object options survive untouched.
// When the target path is already present, stale duplicates are removed
// instead of being rewritten into a second copy.
function replaceEntryPaths(source, tokens, openIndex, closeIndex, pluginPath, stale) {
  const stalePaths = new Set(stale);
  const elements = collectArrayElements(tokens, openIndex, closeIndex);
  const seen = new Set();
  for (const element of elements) {
    const current = elementPackage(tokens, element);
    if (current !== undefined && !stalePaths.has(current)) seen.add(current);
  }
  const spans = [];
  for (const element of elements) {
    const current = elementPackage(tokens, element);
    if (current === undefined || !stalePaths.has(current)) continue;
    // A stale string alongside the target is removed; a stale object entry is
    // rewritten instead so the user's options survive (mirroring withPluginPath).
    if (seen.has(pluginPath) && element.kind === "string") {
      spans.push(removalSpan(tokens, element));
      continue;
    }
    seen.add(pluginPath);
    if (element.kind === "string") {
      spans.push({ start: element.start, end: element.end, text: JSON.stringify(pluginPath) });
    } else if (element.kind === "object") {
      const valueToken = findPackageValueToken(tokens, element);
      if (valueToken) spans.push({ start: valueToken.start, end: valueToken.end, text: JSON.stringify(pluginPath) });
    }
  }
  // Apply back to front so earlier offsets stay valid.
  let updated = source;
  for (const span of spans.sort((a, b) => b.start - a.start)) {
    updated = `${updated.slice(0, span.start)}${span.text ?? ""}${updated.slice(span.end)}`;
  }
  return updated;
}

// Split the token range of an array literal into its top-level elements.
function collectArrayElements(tokens, openIndex, closeIndex) {
  const elements = [];
  let current = [];
  let depth = 0;
  const flush = () => {
    if (current.length === 0) return;
    const first = tokens[current[0]];
    const last = tokens[current[current.length - 1]];
    elements.push({
      first: current[0],
      last: current[current.length - 1],
      start: first.start,
      end: last.end,
      kind: current.length === 1 && first.type === "string"
        ? "string"
        : first.type === "{"
          ? "object"
          : "other"
    });
    current = [];
  };
  for (let index = openIndex + 1; index < closeIndex; index += 1) {
    const token = tokens[index];
    if (token.type === "," && depth === 0) {
      flush();
      continue;
    }
    current.push(index);
    if (token.type === "{" || token.type === "[") depth += 1;
    if (token.type === "}" || token.type === "]") depth -= 1;
  }
  flush();
  return elements;
}

function elementPackage(tokens, element) {
  if (element.kind === "string") return tokens[element.first].value;
  if (element.kind !== "object") return undefined;
  return findPackageValueToken(tokens, element)?.value;
}

function findPackageValueToken(tokens, element) {
  let depth = 0;
  for (let index = element.first; index <= element.last; index += 1) {
    const token = tokens[index];
    if (token.type === "{") depth += 1;
    else if (token.type === "}") depth -= 1;
    else if (
      token.type === "string"
      && token.value === "package"
      && depth === 1
      && tokens[index + 1]?.type === ":"
      && tokens[index + 2]?.type === "string"
    ) {
      return tokens[index + 2];
    }
  }
  return null;
}

function removalSpan(tokens, element) {
  // Drop one adjacent comma so the array stays valid.
  if (tokens[element.last + 1]?.type === ",") {
    return { start: element.start, end: tokens[element.last + 1].end };
  }
  if (tokens[element.first - 1]?.type === ",") {
    return { start: tokens[element.first - 1].start, end: element.end };
  }
  return { start: element.start, end: element.end };
}

function appendPluginArrayEntry(source, tokens, openIndex, closeIndex, pluginPath, elementIndent, closingIndent, newline) {
  // Walk back from the closing bracket instead of scanning for string tokens:
  // Entries can be `{ "package": "..." }` objects, whose inner
  // strings must not be mistaken for array elements.
  let updated = source;
  let closeStart = tokens[closeIndex].start;
  let preserveTrailingComma = false;
  let cursor = closeIndex - 1;
  while (cursor > openIndex && tokens[cursor].type === ",") {
    preserveTrailingComma = true;
    cursor -= 1;
  }
  const lastElementIndex = cursor > openIndex ? cursor : undefined;
  if (lastElementIndex !== undefined) {
    if (!preserveTrailingComma) {
      const insertionPoint = tokens[lastElementIndex].end;
      updated = `${updated.slice(0, insertionPoint)},${updated.slice(insertionPoint)}`;
      closeStart += 1;
    }
  }

  const closeLineStart = updated.lastIndexOf("\n", closeStart - 1) + 1;
  const closeHasOwnLine = /^\s*$/u.test(updated.slice(closeLineStart, closeStart));
  const insertionPoint = closeHasOwnLine ? closeLineStart : closeStart;
  const before = updated.slice(0, insertionPoint);
  const prefix = before.endsWith("\n") ? "" : newline;
  const entry = `${elementIndent}${JSON.stringify(pluginPath)}${preserveTrailingComma ? "," : ""}`;
  const suffix = closeHasOwnLine ? newline : `${newline}${closingIndent}`;
  return `${before}${prefix}${entry}${suffix}${updated.slice(insertionPoint)}`;
}

function matchingArrayClose(tokens, openIndex) {
  let depth = 0;
  for (let index = openIndex; index < tokens.length; index += 1) {
    if (tokens[index].type === "[") depth += 1;
    if (tokens[index].type === "]") depth -= 1;
    if (depth === 0) return index;
  }
  throw new SyntaxError("Unterminated plugin array in OpenCode config");
}

function appendRootPlugin(source, tokens, plugins, key = PLUGIN_KEY) {
  let depth = 0;
  let closeIndex = -1;
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].type === "{") depth += 1;
    if (tokens[index].type === "}") {
      depth -= 1;
      if (depth === 0) {
        closeIndex = index;
        break;
      }
    }
  }
  if (closeIndex === -1) throw new SyntaxError("Unterminated OpenCode config object");

  const closeToken = tokens[closeIndex];
  const previousToken = tokens[closeIndex - 1];
  const closeIndent = lineIndentAt(source, closeToken.start);
  const propertyIndent = `${closeIndent}  `;
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const property = `${propertyIndent}${JSON.stringify(key)}: ${formatPluginArray(plugins, `${propertyIndent}  `, propertyIndent, newline)}`;

  let updated = source;
  let closeStart = closeToken.start;
  if (previousToken?.type !== "{" && previousToken?.type !== ",") {
    updated = `${updated.slice(0, previousToken.end)},${updated.slice(previousToken.end)}`;
    closeStart += 1;
  }

  const lineStart = updated.lastIndexOf("\n", closeStart - 1) + 1;
  const closeHasOwnLine = /^\s*$/u.test(updated.slice(lineStart, closeStart));
  const insertionPoint = closeHasOwnLine ? lineStart : closeStart;
  const before = updated.slice(0, insertionPoint);
  const prefix = before.endsWith("\n") ? "" : newline;
  const suffix = closeHasOwnLine ? newline : `${newline}${closeIndent}`;
  return `${before}${prefix}${property}${suffix}${updated.slice(insertionPoint)}`;
}

function formatPluginArray(plugins, elementIndent, closingIndent, newline) {
  if (plugins.length === 0) return "[]";
  const entries = plugins.map((entry) => `${elementIndent}${JSON.stringify(entry)}`).join(`,${newline}`);
  return `[${newline}${entries}${newline}${closingIndent}]`;
}

function lineIndentAt(source, index) {
  const lineStart = source.lastIndexOf("\n", index - 1) + 1;
  const indent = source.slice(lineStart, index);
  return /^\s*$/u.test(indent) ? indent : "  ";
}

function tokenizeJsonc(input) {
  const tokens = [];
  for (let index = 0; index < input.length;) {
    const char = input[index];
    const next = input[index + 1];
    if (/\s/u.test(char)) {
      index += 1;
      continue;
    }
    if (char === "/" && next === "/") {
      index += 2;
      while (index < input.length && input[index] !== "\n") index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      const end = input.indexOf("*/", index + 2);
      if (end === -1) throw new SyntaxError("Unterminated block comment in JSONC input");
      index = end + 2;
      continue;
    }
    if (char === "\"") {
      const start = index;
      index += 1;
      let escaped = false;
      while (index < input.length) {
        const current = input[index];
        if (escaped) escaped = false;
        else if (current === "\\") escaped = true;
        else if (current === "\"") {
          index += 1;
          break;
        }
        index += 1;
      }
      const raw = input.slice(start, index);
      tokens.push({ type: "string", value: JSON.parse(raw), start, end: index });
      continue;
    }
    if ("{}[]:,".includes(char)) {
      tokens.push({ type: char, start: index, end: index + 1 });
      index += 1;
      continue;
    }
    const start = index;
    while (index < input.length && !/[\s{}\[\]:,]/u.test(input[index])) index += 1;
    tokens.push({ type: "value", start, end: index });
  }
  return tokens;
}

function stripJsonComments(input) {
  let output = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (inString) {
      output += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === "\"") inString = false;
      continue;
    }
    if (char === "\"") {
      inString = true;
      output += char;
      continue;
    }
    if (char === "/" && next === "/") {
      while (i < input.length && input[i] !== "\n") i += 1;
      output += "\n";
      continue;
    }
    if (char === "/" && next === "*") {
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) i += 1;
      if (i >= input.length) throw new SyntaxError("Unterminated block comment in JSONC input");
      i += 1;
      continue;
    }
    output += char;
  }
  return output;
}

function stripTrailingCommas(input) {
  let output = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (inString) {
      output += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === "\"") inString = false;
      continue;
    }
    if (char === "\"") {
      inString = true;
      output += char;
      continue;
    }
    if (char === ",") {
      let nextIndex = i + 1;
      while (nextIndex < input.length && /\s/u.test(input[nextIndex])) nextIndex += 1;
      if (input[nextIndex] === "}" || input[nextIndex] === "]") continue;
    }
    output += char;
  }
  return output;
}
