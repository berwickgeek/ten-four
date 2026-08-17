# Ten Four Changelog

## [Local shelf by default, remote shelf optional] - {PR_MERGE_DATE}

- The **Shelf URL** preference is now optional. Leave it blank and the shelf is a
  local file (`~/.ten-four.json`) on your Mac, which needs no setup at all.
- Set **Shelf URL** to a shelf service endpoint to read snippets pushed from
  another machine (a dev box, a container, Claude Code on a server). Browsing,
  pinning, removing, and clearing all work the same in either mode.
- The bundled `tenfour` CLI picks the same two modes automatically: it pushes to
  `TENFOUR_URL` when that is set, and writes the local file when it is not.
- The CLI gained `--source` / `-s` for optional provenance on a snippet.

## [Initial Release] - 2026-08-10

- Ten Four Shelf command: searchable list of snippets with copy, paste, pin, remove, and clear actions, plus a live-updating detail view.
- Install Ten Four CLI command: installs the bundled `tenfour` CLI into your PATH so your terminal and Claude Code can push snippets to the shelf service.
- The CLI pushes to a shelf HTTP service via `TENFOUR_URL`; the extension reads it via the **Shelf URL** preference. The service (see `server/`) owns the store.
