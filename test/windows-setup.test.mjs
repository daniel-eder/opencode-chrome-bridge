import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { installOpenCodePlugin, parseJsonc, withPluginPath } from "../scripts/lib/opencode-config.mjs";
import {
  checkWindowsRequirements,
  runWindowsSetup,
  windowsChromeCandidates
} from "../scripts/lib/windows-setup.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

test("OpenCode config keeps unrelated settings and adds the plugin once", () => {
  const parsed = parseJsonc(`{
    // existing user preference
    "theme": "dark",
    "plugins": ["C:\\\\Tools\\\\existing"]
  }`);
  const pluginPath = "C:\\Users\\Ada Example\\bridge";
  const once = withPluginPath(parsed, pluginPath);
  const twice = withPluginPath(once, pluginPath);

  assert.equal(twice.theme, "dark");
  assert.deepEqual(twice.plugins, ["C:\\Tools\\existing", pluginPath]);
});

test("invalid OpenCode JSONC fails instead of being overwritten", () => {
  assert.throws(() => parseJsonc("{ invalid"), /Unexpected|JSON/u);
});

test("OpenCode JSONC accepts comments and trailing commas from the official format", () => {
  assert.deepEqual(parseJsonc(`{
    // OpenCode documents trailing commas in .jsonc files.
    "plugins": ["C:\\\\Tools\\\\existing",],
    "server": {
      "port": 4096,
    },
  }`), {
    plugins: ["C:\\Tools\\existing"],
    server: { port: 4096 }
  });
});

test("OpenCode JSONC accepts a UTF-8 BOM written by Windows editors", () => {
  assert.deepEqual(parseJsonc(`${String.fromCharCode(0xFEFF)}{ "plugins": ["C:\\\\bridge"] }`), {
    plugins: ["C:\\bridge"]
  });
});

test("OpenCode plugin installation preserves unrelated JSONC comments", async () => {
  const original = `{
  // Keep this user explanation.
  "theme": "dark",
  "plugins": [
    // Existing plugin must remain first.
    "C:\\\\Tools\\\\existing",
  ],
}`;
  let written = null;

  const result = await installOpenCodePlugin({
    configPath: "C:\\Users\\Ada\\.config\\opencode\\opencode.jsonc",
    configDirectory: "C:\\Users\\Ada\\.config\\opencode",
    pluginPath: "C:\\Users\\Ada\\bridge",
    readFile: async () => original,
    writeFile: async (_path, contents) => { written = contents; },
    mkdir: async () => {}
  });

  assert.equal(result.changed, true);
  assert.match(written, /Keep this user explanation/u);
  assert.match(written, /Existing plugin must remain first/u);
  assert.equal(parseJsonc(written).theme, "dark");
  assert.deepEqual(parseJsonc(written).plugins, ["C:\\Tools\\existing", "C:\\Users\\Ada\\bridge"]);
});

test("OpenCode plugin installation refuses to replace a non-array plugin setting", () => {
  assert.throws(() => withPluginPath({ plugins: "C:\\Tools\\existing" }, "C:\\bridge"), /plugin.*array/iu);
  assert.throws(() => withPluginPath([], "C:\\bridge"), /config.*object/iu);
});

test("OpenCode plugin installation preserves CRLF and can add a missing plugin key", async () => {
  const original = "{\r\n  // Windows config\r\n  \"theme\": \"dark\",\r\n}\r\n";
  let written = null;
  await installOpenCodePlugin({
    configPath: "C:\\Users\\Ada\\.config\\opencode\\opencode.jsonc",
    configDirectory: "C:\\Users\\Ada\\.config\\opencode",
    pluginPath: "C:\\bridge",
    readFile: async () => original,
    writeFile: async (_path, contents) => { written = contents; },
    mkdir: async () => {}
  });

  assert.equal(written.replaceAll("\r\n", "").includes("\n"), false, "installer must not introduce mixed line endings");
  assert.match(written, /Windows config/u);
  assert.deepEqual(parseJsonc(written).plugins, ["C:\\bridge"]);
});

test("OpenCode plugin installation rejects duplicate plugin keys instead of editing the wrong one", async () => {
  const original = `{
    "plugins": "C:\\\\first",
    "plugins": ["C:\\\\second"]
  }`;
  let wrote = false;

  await assert.rejects(installOpenCodePlugin({
    configPath: "C:\\config.jsonc",
    configDirectory: "C:\\",
    pluginPath: "C:\\bridge",
    readFile: async () => original,
    writeFile: async () => { wrote = true; },
    mkdir: async () => {}
  }), /duplicate plugins keys/iu);
  assert.equal(wrote, false);
});

test("Windows requirements accept a supported Node release, npm, OpenCode, and per-user Chrome", async () => {
  const env = {
    LOCALAPPDATA: "C:\\Users\\Ada Example\\AppData\\Local",
    PROGRAMFILES: "C:\\Program Files",
    "PROGRAMFILES(X86)": "C:\\Program Files (x86)"
  };
  const [perUserChrome] = windowsChromeCandidates(env);
  const probes = [];
  const result = await checkWindowsRequirements({
    platform: "win32",
    nodeVersion: "v22.22.2",
    env,
    commandAvailable: async (name, args) => {
      probes.push([name, ...args]);
      return ["npm", "opencode"].includes(name) && args[0] === "--version";
    },
    fileExists: async (candidate) => candidate === perUserChrome
  });

  assert.equal(result.chromePath, perUserChrome);
  assert.deepEqual(probes, [["npm", "--version"], ["opencode", "--version"]]);
});

test("Windows requirements report every missing prerequisite before setup", async () => {
  await assert.rejects(
    checkWindowsRequirements({
      platform: "win32",
      nodeVersion: "v20.19.1",
      env: {},
      commandAvailable: async () => false,
      fileExists: async () => false
    }),
    (error) => {
      assert.match(error.message, /Node\.js 22\.22\.2/u);
      assert.match(error.message, /npm/u);
      assert.match(error.message, /OpenCode/u);
      assert.match(error.message, /Google Chrome stable/u);
      assert.match(error.message, /does not install prerequisites/iu);
      return true;
    }
  );
});

test("Windows requirements reject Node releases outside the declared engine range", async () => {
  for (const nodeVersion of ["v22.22.1", "v23.11.0", "v24.14.9", "v25.1.0"]) {
    await assert.rejects(checkWindowsRequirements({
      platform: "win32",
      nodeVersion,
      env: { LOCALAPPDATA: "C:\\Local" },
      commandAvailable: async () => true,
      fileExists: async () => true
    }), /Node\.js 22\.22\.2/u);
  }
});

test("Windows requirements accept every branch of the declared Node engine range", async () => {
  for (const nodeVersion of ["v22.22.2", "v22.23.0", "v24.15.0", "v26.0.0", "v27.1.0", "v28.1.0"]) {
    await assert.doesNotReject(checkWindowsRequirements({
      platform: "win32",
      nodeVersion,
      env: { LOCALAPPDATA: "C:\\Local" },
      commandAvailable: async () => true,
      fileExists: async () => true
    }));
  }
});

test("guided setup executes every mutating stage only after requirements pass", async () => {
  const calls = [];
  const logs = [];
  const result = await runWindowsSetup({
    platform: "win32",
    nodeVersion: "v22.22.2",
    env: { LOCALAPPDATA: "C:\\Users\\Ada\\AppData\\Local" },
    repoRoot: "C:\\Users\\Ada Example\\opencode bridge",
    commandAvailable: async () => true,
    fileExists: async () => true,
    run: async (command, args, options) => calls.push({ command, args, options }),
    open: async (command, args) => calls.push({ command, args }),
    log: (line) => logs.push(line)
  });

  assert.deepEqual(calls.slice(0, 4).map(({ command, args }) => [command, ...args]), [
    ["npm", "ci"],
    ["npm", "run", "install:native"],
    ["npm", "run", "install:opencode"],
    ["npm", "run", "verify"]
  ]);
  assert.deepEqual(calls.at(-2).args, ["chrome://extensions"]);
  assert.deepEqual(calls.at(-1), {
    command: "explorer.exe",
    args: ["C:\\Users\\Ada Example\\opencode bridge\\extension"]
  });
  assert.deepEqual(result.completedStages, [
    "requirements", "dependencies", "native-host", "opencode-plugin", "verification", "chrome"
  ]);
  assert.match(logs.join("\n"), /Load unpacked/u);
});

test("guided setup stops immediately and names a failed stage", async () => {
  const calls = [];
  await assert.rejects(
    runWindowsSetup({
      platform: "win32",
      nodeVersion: "v22.22.2",
      env: { LOCALAPPDATA: "C:\\Local" },
      repoRoot: "C:\\bridge",
      commandAvailable: async () => true,
      fileExists: async () => true,
      run: async (_command, args) => {
        calls.push(args);
        if (args.join(" ") === "run install:native") throw new Error("registry denied");
      },
      open: async () => assert.fail("applications must not open after failure"),
      log: () => {}
    }),
    /Registering the Chrome bridge.*registry denied/is
  );
  assert.deepEqual(calls, [["ci"], ["run", "install:native"]]);
});

test("Windows batch setup checks Node, anchors paths, and preserves exit status", async () => {
  const source = await readFile(path.join(repoRoot, "setup-windows.cmd"), "utf8");
  assert.match(source, /where node/u);
  assert.match(source, /cd \/d "%~dp0"/u);
  assert.match(source, /scripts\\setup-windows\.mjs/u);
  assert.match(source, /--no-pause/u);
  assert.match(source, /:parse_args/u);
  assert.match(source, /shift/u, "flags must be parsed one token at a time");
  assert.doesNotMatch(source, /for %%[A-Za-z] in \(%\*\)/u);
  assert.doesNotMatch(source, /scripts\\setup-windows\.mjs" %\*/u, "raw arguments must not be re-expanded into the Node command");
  assert.match(source, /if not defined NO_PAUSE pause/u);
  assert.match(source, /exit \/b/u);
});

test("package exposes the Windows guided setup", async () => {
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
  assert.equal(packageJson.scripts["setup:windows"], "node scripts/setup-windows.mjs");
});

test("production dependency is pinned and installs are reproducible", async () => {
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
  const packageLock = JSON.parse(await readFile(path.join(repoRoot, "package-lock.json"), "utf8"));
  const declared = packageJson.dependencies?.["@opencode-ai/plugin"];
  const locked = packageLock.packages?.[""]?.dependencies?.["@opencode-ai/plugin"];
  assert.ok(
    typeof declared === "string" && /^\d+\.\d+\.\d+$/u.test(declared),
    `@opencode-ai/plugin must be pinned to an exact version, got ${declared}`
  );
  assert.equal(declared, locked, "package.json and package-lock.json must agree on @opencode-ai/plugin");
});

test("Windows setup does not pass arguments through shell true", async () => {
  const source = await readFile(path.join(repoRoot, "scripts", "setup-windows.mjs"), "utf8");
  assert.doesNotMatch(source, /shell:\s*true/u);
  assert.match(source, /ComSpec|cmd\.exe/u);
  assert.match(source, /windowsVerbatimArguments:\s*true/u, "cmd.exe must receive verbatim arguments so inner quotes survive");
  assert.match(source, /`"\$\{createCmdInvocation\(command, commandArgs\)\}"`/u, "cmd /s only strips one outer quote pair");
});
