// OpenCode plugin entrypoint.
//
// OpenCode's plugin loader validates this module's default export against its
// `{ id, setup }` plugin schema. The implementation lives in ./plugin.js,
// which also exports helpers for tests; keep those out of this module's
// namespace.
export { default } from "./plugin.js";
