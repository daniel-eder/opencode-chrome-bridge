// Helpers for Zotero Connector interop.
//
// The Zotero Connector browser extension determines the item type with real
// translators (target regexp prefilter in the background page + detectWeb()
// executed in the page DOM). The translation-server API cannot do this for
// authenticated pages such as beck-online because it refetches the URL
// without the user's session. These helpers therefore cooperate with the
// *installed* connector flow:
//
// 1. Fetch translator metadata + code from the local Zotero client
//    (POST /connector/getTranslators, POST /connector/getTranslatorCode).
// 2. Run the candidate translator's real detectWeb()/scrape() in the page
//    through the bridge's evaluate command (real DOM, real item type).
// 3. Save the produced items through POST /connector/saveItems and,
//    optionally, attach a rendered PDF via POST /connector/saveAttachment.
//
// Only the local loopback Zotero client is ever contacted.

const CONNECTOR_BASE_URL = process.env.ZOTERO_CONNECTOR_URL || "http://127.0.0.1:23119";
const CONNECTOR_API_VERSION = "3";
const CONNECTOR_TIMEOUT_MS = 15000;
const WEB_TRANSLATOR_TYPE = 4; // Zotero.Translator.TRANSLATOR_TYPES.web

export function zoteroConnectorBaseUrl() {
  return CONNECTOR_BASE_URL;
}

async function connectorFetch(path, { body, contentType, fetchImpl = fetch, timeoutMs = CONNECTOR_TIMEOUT_MS } = {}) {
  let response;
  try {
    response = await fetchImpl(`${CONNECTOR_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": contentType ?? "application/json",
        "X-Zotero-Version": "7.0",
        "X-Zotero-Connector-API-Version": CONNECTOR_API_VERSION,
        ...(contentType === "application/pdf" ? {} : {})
      },
      body,
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    throw new Error(`Zotero connector is not reachable at ${CONNECTOR_BASE_URL}${path}: ${error?.message ?? error}`);
  }
  return response;
}

export async function zoteroConnectorCall(method, data, options = {}) {
  const response = await connectorFetch(`/connector/${method}`, {
    body: JSON.stringify(data ?? {}),
    fetchImpl: options.fetchImpl,
    timeoutMs: options.timeoutMs
  });
  if (response.status >= 400) {
    const text = await response.text().catch(() => "");
    throw new Error(`Zotero connector method ${method} failed with status ${response.status}${text ? `: ${text.slice(0, 300)}` : ""}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  return response.text();
}

export async function zoteroPing(options = {}) {
  const response = await options.fetchImpl
    ? await options.fetchImpl(`${CONNECTOR_BASE_URL}/connector/ping`, { signal: AbortSignal.timeout(options.timeoutMs ?? CONNECTOR_TIMEOUT_MS) })
    : await fetch(`${CONNECTOR_BASE_URL}/connector/ping`, { signal: AbortSignal.timeout(options.timeoutMs ?? CONNECTOR_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Zotero connector ping failed with status ${response.status}`);
  return true;
}

export async function getZoteroTranslators(options = {}) {
  const metadata = await zoteroConnectorCall("getTranslators", {}, options);
  if (!Array.isArray(metadata)) throw new Error("Zotero connector returned invalid translator metadata");
  return metadata;
}

export function matchTranslatorsForUrl(translators, url, { limit = 10 } = {}) {
  const matches = [];
  for (const translator of translators) {
    if (!translator || typeof translator !== "object") continue;
    if (typeof translator.translatorType === "number" && (translator.translatorType & WEB_TRANSLATOR_TYPE) === 0) continue;
    if (typeof translator.target !== "string" || translator.target.length === 0) continue;
    let pattern;
    try {
      pattern = new RegExp(translator.target);
    } catch {
      continue;
    }
    let matched = false;
    try {
      matched = pattern.test(url);
    } catch {
      continue;
    }
    if (matched) {
      matches.push({
        label: translator.label,
        translatorID: translator.translatorID,
        priority: Number.isFinite(translator.priority) ? translator.priority : 0,
        target: translator.target
      });
    }
  }
  matches.sort((a, b) => (a.priority - b.priority) || String(a.label).localeCompare(String(b.label)));
  return matches.slice(0, limit);
}

export async function getZoteroTranslatorCode(translatorID, options = {}) {
  if (typeof translatorID !== "string" || translatorID.length === 0) {
    throw new Error("translatorID must be a non-empty string");
  }
  const code = await zoteroConnectorCall("getTranslatorCode", { translatorID }, options);
  if (typeof code !== "string" || code.length === 0) {
    throw new Error(`Zotero connector returned no code for translator ${translatorID}`);
  }
  return stripTranslatorTests(code);
}

export function stripTranslatorTests(code) {
  return stripTranslatorEnvelope(String(code));
}

// getTranslatorCode returns the translator metadata JSON block followed by
// the translator source followed by a test-cases block. Only the source
// between them is evaluatable in a page.
export function stripTranslatorEnvelope(code) {
  let source = String(code);
  const trimmed = source.trimStart();
  if (trimmed.startsWith("{")) {
    const close = source.indexOf("}");
    if (close !== -1) {
      source = source.slice(close + 1);
    }
  }
  const marker = "/** BEGIN TEST CASES **";
  const testIndex = source.indexOf(marker);
  if (testIndex !== -1) source = source.slice(0, testIndex);
  return source;
}

// Minimal ZU/Zotero shims sufficient for single-item beck-online-style
// translators. Multi-item flows (selectItems/processDocuments) are rejected
// so the caller can ask the user to open a single section instead.
const TRANSLATOR_PRELUDE = `
var ZU = {
  xpath: function(doc, expr) {
    var context = doc;
    if (context && context.ownerDocument) context = context.ownerDocument;
    try {
      var resolver = function(prefix) {
        if (prefix === 'x' || prefix === 'xhtml') return 'http://www.w3.org/1999/xhtml';
        return null;
      };
      var result = (context || document).evaluate(expr, arguments.length > 2 && arguments[2] ? arguments[2] : (doc && doc.ownerDocument ? doc : doc), resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      var nodes = [];
      for (var i = 0; i < result.snapshotLength; i++) nodes.push(result.snapshotItem(i));
      return nodes;
    } catch (e) { return []; }
  },
  xpathText: function(doc, expr) {
    try {
      var nodes = ZU.xpath.apply(null, arguments);
      if (!nodes || !nodes.length) return null;
      var node = nodes[0];
      var text = node.textContent !== undefined && node.textContent !== null ? node.textContent : String(node);
      text = String(text).replace(/\\s+/g, ' ').trim();
      return text.length ? text : null;
    } catch (e) { return null; }
  },
  trimInternal: function(s) { return String(s === undefined || s === null ? '' : s).replace(/\\s+/g, ' ').trim(); },
  cleanAuthor: function(name, type, useComma) {
    name = ZU.trimInternal(name);
    if (!name) return { lastName: '', firstName: '', creatorType: type || 'author' };
    var parts = name.split(',');
    if (parts.length > 1) {
      return { lastName: ZU.trimInternal(parts[0]), firstName: ZU.trimInternal(parts.slice(1).join(',')), creatorType: type || 'author' };
    }
    var tokens = name.split(/\\s+/);
    if (tokens.length === 1) return { lastName: name, firstName: '', creatorType: type || 'author' };
    return { lastName: tokens[tokens.length - 1], firstName: tokens.slice(0, -1).join(' '), creatorType: type || 'author' };
  },
  processDocuments: function() { throw new Error('Translators requiring multiple documents are not supported; open a single section instead'); }
};
function text(doc, selector) {
  try { var node = doc.querySelector(selector); return node ? ZU.trimInternal(node.textContent) : ''; }
  catch (e) { return ''; }
}
function attr(doc, selector, name) {
  try { var node = doc.querySelector(selector); return node ? node.getAttribute(name) : null; }
  catch (e) { return null; }
}
var Zotero = {
  Item: function(itemType) {
    this.itemType = itemType;
    this.creators = [];
    this.tags = [];
    this.notes = [];
    this.seeAlso = [];
    this.attachments = [];
    this.complete = function() {
      var snapshot = {};
      for (var key in this) {
        if (typeof this[key] === 'function') continue;
        snapshot[key] = this[key];
      }
      snapshot.attachments = (snapshot.attachments || []).map(function(a) {
        return { title: a && a.title ? a.title : 'Snapshot' };
      });
      __zoteroCollected.push(snapshot);
    };
  },
  selectItems: function() { throw new Error('Translators offering multiple items are not supported; open a single section instead'); }
};
var __zoteroCollected = [];
`;

export function buildTranslatorDetectExpression(translatorCode) {
  const safeCode = stripTranslatorTests(String(translatorCode));
  return `(function(){${TRANSLATOR_PRELUDE}\n${safeCode}\ntry {
    var detected = detectWeb(document, location.href);
    return JSON.stringify({ itemType: detected === false ? false : detected });
  } catch (e) { return JSON.stringify({ error: String((e && e.message) || e) }); }
})()`;
}

export function buildTranslatorScrapeExpression(translatorCode) {
  const safeCode = stripTranslatorTests(String(translatorCode));
  return `(function(){${TRANSLATOR_PRELUDE}\n${safeCode}\ntry {
    scrape(document, location.href);
    return JSON.stringify({ items: __zoteroCollected });
  } catch (e) { return JSON.stringify({ error: String((e && e.message) || e) }); }
})()`;
}

export function parseTranslatorDriverResult(raw) {
  if (typeof raw !== "string" || raw.length === 0) {
    throw new Error("Translator driver returned an empty result");
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Translator driver returned invalid JSON");
  }
  if (parsed && typeof parsed.error === "string") throw new Error(`Translator failed in page: ${parsed.error}`);
  return parsed;
}

export function randomConnectorId(prefix = "bridge") {
  const bytes = [];
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 12; i += 1) bytes.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  return `${prefix}-${bytes.join("")}`;
}

export async function zoteroSaveItems({ items, uri, sessionID, fetchImpl = fetch, timeoutMs = CONNECTOR_TIMEOUT_MS }) {
  if (!Array.isArray(items) || items.length === 0) throw new Error("zoteroSaveItems requires a non-empty items array");
  if (typeof uri !== "string" || uri.length === 0) throw new Error("zoteroSaveItems requires a source uri");
  const id = typeof sessionID === "string" && sessionID.length > 0 ? sessionID : randomConnectorId("session");
  const response = await connectorFetch("/connector/saveItems", {
    body: JSON.stringify({ items, uri, sessionID: id }),
    fetchImpl,
    timeoutMs
  });
  if (response.status !== 200 && response.status !== 201) {
    const text = await response.text().catch(() => "");
    throw new Error(`Zotero saveItems failed with status ${response.status}${text ? `: ${text.slice(0, 300)}` : ""}`);
  }
  return { sessionID: id, status: response.status };
}

export async function zoteroSavePdfAttachment({ pdfBytes, sessionID, parentItemID, title, url, fetchImpl = fetch, timeoutMs = 60000 }) {
  if (!(pdfBytes instanceof Uint8Array) && !Buffer.isBuffer(pdfBytes)) {
    throw new Error("zoteroSavePdfAttachment requires PDF bytes");
  }
  if (typeof sessionID !== "string" || sessionID.length === 0) throw new Error("saveAttachment requires the saveItems sessionID");
  if (typeof parentItemID !== "string" || parentItemID.length === 0) throw new Error("saveAttachment requires a parent connector item id");
  const metadata = JSON.stringify({ sessionID, parentItemID, title: title || "document.pdf", url: url || "" });
  const response = await fetchImpl(`${CONNECTOR_BASE_URL}/connector/saveAttachment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdfBytes.length),
      "X-Metadata": metadata,
      "X-Zotero-Version": "7.0",
      "X-Zotero-Connector-API-Version": CONNECTOR_API_VERSION
    },
    body: pdfBytes,
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Zotero saveAttachment failed with status ${response.status}${text ? `: ${text.slice(0, 300)}` : ""}`);
  }
  return { status: response.status };
}

export async function zoteroLatestItem({ fetchImpl = fetch, timeoutMs = CONNECTOR_TIMEOUT_MS } = {}) {
  const response = await (fetchImpl ?? fetch)(`${CONNECTOR_BASE_URL}/api/users/0/items?sort=dateAdded&direction=desc&limit=1`, {
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!response.ok) throw new Error(`Zotero local API failed with status ${response.status}`);
  const payload = await response.json();
  const first = Array.isArray(payload) ? payload[0] : null;
  return first?.data ?? first ?? null;
}

export function normalizeScrapedItems(items, { url, connectorId } = {}) {
  if (!Array.isArray(items)) throw new Error("Translator produced no items array");
  const today = new Date().toISOString().slice(0, 10);
  return items.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Translator item ${index} is invalid`);
    if (typeof item.itemType !== "string" || item.itemType.length === 0) {
      throw new Error(`Translator item ${index} has no itemType`);
    }
    const normalized = { ...item };
    if (typeof normalized.title !== "string" || normalized.title.length === 0) {
      throw new Error(`Translator item ${index} has no title`);
    }
    if (!Array.isArray(normalized.creators)) normalized.creators = [];
    if (!Array.isArray(normalized.tags)) normalized.tags = [];
    if (!Array.isArray(normalized.attachments)) normalized.attachments = [];
    if (typeof normalized.url !== "string" || normalized.url.length === 0) normalized.url = url;
    if (typeof normalized.accessDate !== "string") normalized.accessDate = today;
    if (typeof normalized.libraryCatalog !== "string") normalized.libraryCatalog = "beck-online";
    normalized.id = `${connectorId ?? randomConnectorId("item")}-${index}`;
    return normalized;
  });
}
