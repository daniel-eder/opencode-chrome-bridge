#!/usr/bin/env node
import { execFile, spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { runWindowsSetup } from "./lib/windows-setup.mjs";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const resolvedCommands = new Map();

const run = async (command, commandArgs, options) => executeWindowsCommand(
  await resolveCommand(command),
  commandArgs,
  { ...options, stdio: "inherit", windowsHide: false }
);

const commandAvailable = async (command, commandArgs) => {
  try {
    const resolved = await resolveCommand(command);
    await executeWindowsCommand(resolved, commandArgs, {
      stdio: "ignore",
      windowsHide: true
    });
    return true;
  } catch {
    return false;
  }
};

const fileExists = async (candidate) => {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
};

const open = async (command, commandArgs) => {
  const child = spawn(command, commandArgs, {
    detached: true,
    stdio: "ignore",
    windowsHide: false
  });
  child.unref();
};

try {
  await runWindowsSetup({
    platform: process.platform,
    nodeVersion: process.version,
    env: process.env,
    repoRoot,
    commandAvailable,
    fileExists,
    run,
    open: args.has("--no-open") ? async () => {} : open,
    log: console.log
  });
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
}

function spawnAndWait(command, commandArgs, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, options);
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function resolveCommand(command) {
  if (resolvedCommands.has(command)) return resolvedCommands.get(command);
  const { stdout } = await execFileAsync("where.exe", [command], { windowsHide: true });
  const candidates = stdout.split(/\r?\n/u).map((value) => value.trim()).filter(Boolean);
  const resolved = candidates.find((value) => /\.(?:exe|com|cmd|bat)$/iu.test(value));
  if (!resolved) throw new Error(`${command} was not found through PATH`);
  resolvedCommands.set(command, resolved);
  return resolved;
}

function executeWindowsCommand(command, commandArgs, options) {
  if (!/\.(?:cmd|bat)$/iu.test(command)) {
    return spawnAndWait(command, commandArgs, options);
  }
  const commandProcessor = process.env.ComSpec || "cmd.exe";
  // Node escapes embedded quotes with backslashes, but cmd.exe has no such
  // escape, so it would see a literal \" and fail to find the command. Pass the
  // arguments verbatim and wrap the invocation in the extra quote pair that
  // cmd /s strips before parsing.
  return spawnAndWait(
    commandProcessor,
    ["/d", "/s", "/c", `"${createCmdInvocation(command, commandArgs)}"`],
    { ...options, windowsVerbatimArguments: true }
  );
}

function createCmdInvocation(command, commandArgs) {
  return [command, ...commandArgs].map(quoteCmdToken).join(" ");
}

function quoteCmdToken(value) {
  const token = String(value);
  // %% only un-escapes inside batch files, not on cmd /c command lines, and cmd
  // offers no reliable escape for % there — reject rather than corrupt the path.
  if (/[\r\n"%]/u.test(token)) {
    throw new Error("Windows command paths and arguments cannot contain quotes, percent signs, or line breaks");
  }
  return `"${token}"`;
}
