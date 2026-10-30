import assert from "node:assert/strict";
import test from "node:test";
import {
  matchTranslatorsForUrl,
  normalizeScrapedItems,
  parseTranslatorDriverResult,
  stripTranslatorEnvelope
} from "../src/zotero-connector.js";

const WEB_TYPE = 4;

function translator(overrides) {
  return {
    label: "example",
    translatorID: "00000000-0000-0000-0000-000000000000",
    translatorType: WEB_TYPE,
    priority: 100,
    target: "^https://example\\.com/",
    ...overrides
  };
}

test("translator matching filters by target and translator type", () => {
  const translators = [
    translator({ label: "beck-online", target: "^https?://beck[-.]online\\.beck\\.de/" }),
    translator({ label: "generic", target: "https?://", priority: 1 }),
    translator({ label: "import-only", translatorType: 1, target: "^https?://beck[-.]online\\.beck\\.de/" }),
    translator({ label: "broken-regex", target: "(unclosed" })
  ];

  const matches = matchTranslatorsForUrl(
    translators,
    "https://beck-online.beck.de/?vpath=bibdata%2Fkomm%2Ffoo.htm",
    { limit: 10 }
  );
  assert.deepEqual(matches.map((entry) => entry.label), ["generic", "beck-online"]);
});

test("translator matching sorts by priority and bounds the result", () => {
  const translators = [
    translator({ label: "slow", priority: 200 }),
    translator({ label: "fast", priority: 50 })
  ];
  const matches = matchTranslatorsForUrl(translators, "https://example.com/page", { limit: 1 });
  assert.deepEqual(matches.map((entry) => entry.label), ["fast"]);
});

test("translator envelopes strip the metadata header and test cases", () => {
  const code = stripTranslatorEnvelope(
    `{\n\t"translatorID": "abc",\n\t"label": "demo"\n}\n\nvar detectWeb = function() {};\n/** BEGIN TEST CASES **\nvar testCases = [];\n`
  );
  assert.match(code, /var detectWeb/u);
  assert.doesNotMatch(code, /translatorID/u);
  assert.doesNotMatch(code, /testCases/u);
});

test("translator driver results parse item types and surface page errors", () => {
  assert.deepEqual(parseTranslatorDriverResult(JSON.stringify({ itemType: "encyclopediaArticle" })), {
    itemType: "encyclopediaArticle"
  });
  assert.throws(
    () => parseTranslatorDriverResult(JSON.stringify({ error: "nope" })),
    /Translator failed in page: nope/u
  );
  assert.throws(() => parseTranslatorDriverResult("not json"), /invalid JSON/u);
  assert.throws(() => parseTranslatorDriverResult(""), /empty result/u);
});

test("scraped items gain defaults and stable connector ids", () => {
  const [item] = normalizeScrapedItems(
    [{ itemType: "encyclopediaArticle", title: "A. Section", creators: [] }],
    { url: "https://beck-online.beck.de/x", connectorId: "item-1" }
  );
  assert.equal(item.url, "https://beck-online.beck.de/x");
  assert.equal(item.accessDate, new Date().toISOString().slice(0, 10));
  assert.equal(item.libraryCatalog, "beck-online");
  assert.equal(item.id, "item-1-0");
});

test("scraped items without a type or title fail closed", () => {
  assert.throws(
    () => normalizeScrapedItems([{ title: "No type" }], { url: "https://example.com" }),
    /no itemType/u
  );
  assert.throws(
    () => normalizeScrapedItems([{ itemType: "webpage" }], { url: "https://example.com" }),
    /no title/u
  );
  assert.throws(() => normalizeScrapedItems("nope", { url: "https://example.com" }), /array/u);
});
