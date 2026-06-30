# Ten Four Changelog

## [Initial Release] - {PR_MERGE_DATE}

- Ten Four Shelf command: searchable list of snippets with copy, paste, pin, remove, and clear actions, plus a live-updating detail view.
- Install Ten Four CLI command: installs the bundled `tenfour` CLI into your PATH so your terminal and Claude Code can push snippets to the shelf service.
- The CLI pushes to a shelf HTTP service via `TENFOUR_URL`; the extension reads it via the **Shelf URL** preference. The service (see `server/`) owns the store.
