// Tool metadata for the OpenCode Chrome Bridge plugin.
//
// These constants live in their own module because OpenCode's plugin loader
// treats every module export as a plugin entrypoint and throws
// "Plugin export is not a function" for non-function exports. The plugin
// entrypoint (src/opencode-plugin.js) therefore imports these values instead
// of exporting them.

const capabilities = (...names) => Object.freeze(["bridge.handshake", ...names].sort());

export const DESTINATION_SCOPED_TOOLS = new Set(["chrome_open", "chrome_open_window"]);
export const TAB_SCOPED_TOOLS = new Set([
  "chrome_accessibility_tree", "chrome_activate_tab", "chrome_back", "chrome_cdp",
  "chrome_click", "chrome_click_element", "chrome_close_tab", "chrome_dom_content",
  "chrome_double_click", "chrome_drag", "chrome_evaluate", "chrome_fill_element",
  "chrome_find", "chrome_forward", "chrome_get_console_logs", "chrome_get_tab",
  "chrome_hover", "chrome_keypress", "chrome_move", "chrome_network_requests",
  "chrome_page_assets",
  "chrome_page_text", "chrome_read_page", "chrome_reload", "chrome_reset_viewport",
  "chrome_screenshot", "chrome_screenshot_region", "chrome_print_pdf", "chrome_zotero_detect", "chrome_zotero_save", "chrome_scroll", "chrome_set_viewport",
  "chrome_subscribe_cdp", "chrome_tab_context", "chrome_type", "chrome_unsubscribe_cdp",
  "chrome_upload_files", "chrome_wait_for", "chrome_wizard_step", "chrome_cursor_state",
  "chrome_favicon_badge", "chrome_webmcp_invoke", "chrome_webmcp_list"
]);
export const PAGE_SCOPED_TOOLS = new Set([
  ...DESTINATION_SCOPED_TOOLS,
  ...TAB_SCOPED_TOOLS,
  "chrome_batch",
  "chrome_cdp_targets",
  "chrome_events",
  "chrome_workflow_run",
  "chrome_tabs"
]);

export const TOOL_CAPABILITY_REQUIREMENTS = Object.freeze({
  chrome_accessibility_tree: capabilities("browser.accessibility", "browser.tabs"),
  chrome_activate_tab: capabilities("browser.tabs", "browser.windows"),
  chrome_back: capabilities("browser.navigation", "browser.tabs"),
  chrome_batch: capabilities("browser.batch"),
  chrome_blocked_urls: capabilities("browser.navigation"),
  chrome_bookmarks: capabilities("browser.bookmarks"),
  chrome_cdp: capabilities("browser.cdp"),
  chrome_cdp_targets: capabilities("browser.cdp"),
  chrome_claim_tab: capabilities("browser.tabs", "session.tab-leases"),
  chrome_click: capabilities("browser.cdp", "browser.tabs"),
  chrome_click_element: capabilities("browser.accessibility", "browser.cdp", "browser.tabs"),
  chrome_close_tab: capabilities("browser.tabs"),
  chrome_cursor_state: capabilities("browser.tabs"),
  chrome_dom_content: capabilities("browser.cdp", "browser.tabs"),
  chrome_double_click: capabilities("browser.cdp", "browser.tabs"),
  chrome_download_cancel: capabilities("browser.downloads"),
  chrome_download_pause: capabilities("browser.downloads"),
  chrome_download_resume: capabilities("browser.downloads"),
  chrome_download_show: capabilities("browser.downloads"),
  chrome_downloads_list: capabilities("browser.downloads"),
  chrome_drag: capabilities("browser.cdp", "browser.tabs"),
  chrome_end_turn: capabilities("browser.cdp", "browser.tabs", "session.tab-leases"),
  chrome_evaluate: capabilities("browser.cdp", "browser.tabs"),
  chrome_events: capabilities("browser.events"),
  chrome_favicon_badge: capabilities("browser.tabs"),
  chrome_fill_element: capabilities("browser.accessibility", "browser.cdp", "browser.tabs"),
  chrome_upload_files: capabilities("browser.accessibility", "browser.file-upload", "browser.tabs"),
  chrome_find: capabilities("browser.find", "browser.tabs"),
  chrome_finalize_tabs: capabilities("browser.cdp", "browser.tabs", "session.tab-leases"),
  chrome_forward: capabilities("browser.navigation", "browser.tabs"),
  chrome_get_console_logs: capabilities("browser.cdp", "browser.console", "browser.tabs"),
  chrome_get_tab: capabilities("browser.tabs"),
  chrome_get_window_state: capabilities("browser.windows"),
  chrome_group_tabs: capabilities("browser.tab-groups", "browser.tabs"),
  chrome_history: capabilities("browser.history"),
  chrome_hover: capabilities("browser.cdp", "browser.tabs"),
  chrome_keypress: capabilities("browser.cdp", "browser.tabs"),
  chrome_move: capabilities("browser.cdp", "browser.tabs"),
  chrome_network_requests: capabilities("browser.cdp", "browser.network", "browser.tabs"),
  chrome_page_assets: capabilities("browser.assets", "browser.cdp", "browser.tabs"),
  chrome_notify: capabilities("browser.notifications"),
  chrome_open: capabilities("browser.navigation", "browser.tabs", "session.tab-leases"),
  chrome_open_window: capabilities("browser.navigation", "browser.tabs", "browser.windows", "session.tab-leases"),
  chrome_page_text: capabilities("browser.cdp", "browser.tabs"),
  chrome_read_page: capabilities("browser.accessibility", "browser.page-context", "browser.screenshots", "browser.tabs", "browser.windows"),
  chrome_resume_session: capabilities("browser.tab-groups", "browser.tabs", "session.resume"),
  chrome_release_debuggers: capabilities("browser.cdp"),
  chrome_reload: capabilities("browser.navigation", "browser.tabs"),
  chrome_reset_viewport: capabilities("browser.cdp", "browser.tabs"),
  chrome_schedule_create: capabilities("browser.schedules", "browser.workflows"),
  chrome_schedule_delete: capabilities("browser.schedules"),
  chrome_schedule_history: capabilities("browser.schedules"),
  chrome_schedule_run_now: capabilities("browser.schedules", "browser.workflows"),
  chrome_schedule_update: capabilities("browser.schedules", "browser.workflows"),
  chrome_schedules: capabilities("browser.schedules"),
  chrome_screenshot: capabilities("browser.screenshots", "browser.tabs", "browser.windows"),
  chrome_screenshot_region: capabilities("browser.cdp", "browser.screenshots", "browser.tabs", "browser.windows"),
  chrome_print_pdf: capabilities("browser.cdp", "browser.screenshots", "browser.tabs"),
  chrome_zotero_detect: capabilities("browser.cdp", "browser.tabs"),
  chrome_zotero_save: capabilities("browser.cdp", "browser.screenshots", "browser.tabs"),
  chrome_scroll: capabilities("browser.cdp", "browser.tabs"),
  chrome_set_viewport: capabilities("browser.cdp", "browser.tabs"),
  chrome_set_window_state: capabilities("browser.windows"),
  chrome_subscribe_cdp: capabilities("browser.cdp", "browser.events", "browser.tabs"),
  chrome_tab_group_create: capabilities("browser.tab-groups", "browser.tabs"),
  chrome_tab_group_update: capabilities("browser.tab-groups", "browser.tabs"),
  chrome_tab_groups: capabilities("browser.tab-groups", "browser.tabs"),
  chrome_tab_context: capabilities("browser.page-context", "browser.tabs"),
  chrome_tabs: capabilities("browser.tabs"),
  chrome_type: capabilities("browser.cdp", "browser.tabs"),
  chrome_ungroup_tabs: capabilities("browser.tab-groups", "browser.tabs"),
  chrome_unsubscribe_cdp: capabilities("browser.cdp", "browser.events", "browser.tabs"),
  chrome_wait_for: capabilities("browser.cdp", "browser.downloads", "browser.tabs", "browser.wait"),
  chrome_webmcp_invoke: capabilities("browser.tabs", "browser.webmcp"),
  chrome_webmcp_list: capabilities("browser.tabs", "browser.webmcp"),
  chrome_workflow_cancel: capabilities("browser.workflows"),
  chrome_workflow_delete: capabilities("browser.workflows"),
  chrome_workflow_get: capabilities("browser.workflows"),
  chrome_workflow_import: capabilities("browser.workflows"),
  chrome_workflow_run: capabilities("browser.workflows"),
  chrome_workflow_start: capabilities("browser.workflows"),
  chrome_workflow_stop: capabilities("browser.workflows"),
  chrome_workflows: capabilities("browser.workflows"),
  chrome_wizard_step: capabilities("browser.cdp", "browser.screenshots", "browser.tabs", "browser.windows")
});

export const ALL_TOOL_REQUIRED_CAPABILITIES = Object.freeze(
  [...new Set(Object.values(TOOL_CAPABILITY_REQUIREMENTS).flat())].sort()
);
export const TOOL_ORIGIN_SCOPE_CLASSIFICATION = Object.freeze(Object.fromEntries(
  Object.keys(TOOL_CAPABILITY_REQUIREMENTS).map((name) => [name, PAGE_SCOPED_TOOLS.has(name) ? "page" : "browser"])
));
