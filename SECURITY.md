# Security policy

## Supported version

Security fixes are applied to the latest commit on `main`. This project has not yet declared additional maintained release branches.

## Reporting a vulnerability

Report suspected vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/pmgallardodev/opencode-chrome-bridge/security/advisories/new). Do not include exploit details, browser data, tokens, or personal information in a public issue.

Include the affected component, reproduction steps, impact, and any proposed mitigation. You should receive an acknowledgement within seven days. A coordinated disclosure date will be agreed after the report is validated and a fix is available.

## Security boundary

This project controls a real Chrome profile. A successful command can inspect or change tabs, history, bookmarks, downloads, page content, and Chrome DevTools Protocol state.

The native host listens on `127.0.0.1` and requires a per-process bearer token stored in the current user's private state directory. This protects against remote network access; it does not protect against malicious software already running as the same operating-system user.

As an additional layer, every browser tool except `chrome_status` requires an OpenCode allow once / allow always / deny decision before execution. The gate fails closed: denying, or running on a host without permission-prompt support, aborts the action before any command reaches the bridge. A user can deliberately persist an allow-always grant. This mitigates prompt injection from untrusted page content, but is not a substitute for loading the extension only in trusted profiles.

The tool context has no `ask()` helper. There the prompt is raised through OpenCode's own permission engine at `POST /api/session/{id}/permission` on the local service, authenticated with HTTP Basic against `127.0.0.1` using the URL and password OpenCode writes to its private state directory. The plugin refuses a registration whose URL is not loopback, and an unreachable or unauthenticated service aborts the action instead of executing it unapproved.

Only install the extension and plugin on trusted machines and Chrome profiles. Never publish bridge state files, screenshots, HAR files, traces, or logs that may contain browser data.

The RSA value in `extension/manifest.json` is a public Chrome extension signing key used only to keep the unpacked extension ID stable. It is not a credential.

## Workflow and schedule boundary

Workflows contain only the versioned, typed allowlist documented in the README. Import and
execution recompute required capabilities and origins from the steps; recursive/meta actions,
sensitive fields, unknown schemas, oversized data, and future schema versions fail closed.
The complete capability and origin union is approved before a run's first side effect.

A scheduled run is unattended browser control. Creation and material updates therefore require
both the ordinary tool decision and a separate explicit approval for
`browser.schedule-unattended`. That exact approval binds the workflow fingerprint, recurrence,
notification policy, required origins, and managed tabs. The extension does not accept a boolean
or client-generated substitute. Any bound change invalidates the approval and requires a new decision.

Schedule state and Chrome alarm changes use durable journals and committed semantics: success
is returned only after the transition is committed. Startup repairs interrupted transitions;
occurrence claims deduplicate alarms, and completed work is not replayed after a crash. Manual
runs remain cancellable and use the same fail-closed preflight. Schedules, history, origins,
steps, timeouts, and serialized storage are all bounded.

## Experimental WebMCP boundary

WebMCP is an experimental Chrome feature and must be enabled explicitly for local development.
Only an origin-isolated, top-level, exact current document may expose tools. Discovery and
invocation run through an extension content script in Chrome's `ISOLATED` world and use the
official `document.modelContext` signatures; no callable registry is installed in page globals.

Descriptors, schemas, inputs, outputs, JSON structure, adapter envelopes, deadlines, token
lifetimes, and concurrency are bounded. Admission prepares a random document-bound token and
performs a final synchronous signal/deadline check before committing the exact descriptor in
that same document. Once committed, invocation is irrevocable: client cancellation or
disconnect cannot abort the page signal or release its navigation barrier early. The barrier
is released only when the page invocation settles or rejects, while capacity remains reserved
for status and ordinary bridge commands.

## Privacy and release artifacts

The bridge has no cloud relay or telemetry. Tokens, workflows, schedules, approval fingerprints,
and sanitized history remain local. Screenshots, page assets, browser traces, downloaded third-
party extensions, credentials, internal audit copies, and private `docs/superpowers` material
must never be committed. Release verification normalizes path separators, case, Unicode, and
spacing before rejecting `.env` variants, credential/token/key files, screenshots and traces,
downloaded extension archives/directories, audit copies, and `docs/superpowers` variants. It
also scans bounded tracked text for private-key blocks, GitHub/OpenAI tokens, AWS access keys,
and obvious password/token assignments. Only the named adversarial scanner fixture is excluded
from content scanning; documentation placeholders such as `YOUR_TOKEN_HERE` are recognized as
non-secret. Sensitive binary/archive names are rejected without attempting to decode them.
