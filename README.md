# Ten Four

**"10-4, copy that."** A shelf of clean, copyable snippets, pushed from your
terminal or from **Claude Code**, browsed and copied from **Raycast**.

When a tool prints something you want to copy (a URL, an API key, a command, a
code block), copying it straight out of the terminal gives you mangled line
breaks and stray indentation, because you're selecting reflowed text off the
character grid. Ten Four fixes the root cause: snippets travel as **data**, never
as rendered terminal text. You copy them out of Raycast with the exact bytes
intended, with no wrapping and no leading spaces.

<a href="https://www.raycast.com/jaymcc/ten-four">
  <img src="https://www.raycast.com/jaymcc/ten-four/install_button@2x.png" height="64" alt="Add Ten Four to Raycast" />
</a>

> The button above works once the extension is approved on the Raycast Store.
> Until then, install from source (below).

## How it works

```
your terminal / Claude Code  ──tenfour──▶  ~/.ten-four.json  ──▶  Raycast "Ten Four"
        (writer)                            (the shelf)              (reader)
```

- **`tenfour`**: a tiny, dependency-free Node CLI that appends a snippet to the
  shelf file.
- **Ten Four (Raycast extension)**: a searchable list of your snippets. Hit your
  Raycast hotkey, type a letter or two, press <kbd>↵</kbd> to copy (or
  <kbd>⌘</kbd> to paste into the front app).

## Install

### Option A: Raycast Store (one click, once approved)

Click **Add to Raycast** above, or search "Ten Four" in the Raycast Store. Then
run the **Install Ten Four CLI** command to add the `tenfour` writer.

### Option B: From source (works today)

Requires [Node.js](https://nodejs.org) and the [Raycast](https://raycast.com)
app.

```sh
git clone https://github.com/berwickgeek/ten-four.git
cd ten-four
npm ci
npm run dev
```

`npm run dev` builds the extension and registers it in Raycast immediately. It
**stays installed even after you stop the dev server** (Raycast keeps its own
compiled copy), so you only need to run this once. You can then close the
terminal.

Then install the CLI either way:

- In Raycast, open **Install Ten Four CLI** and click **Install CLI**, or
- From the repo: `./install.sh` (symlinks `assets/tenfour` into your `PATH`).

## Usage

```sh
tenfour "https://my-app.up.railway.app"          # label = first line
tenfour --label "API key" "sk-live-…"            # explicit label
printf 'def hi():\n    return 1\n' | tenfour -l "snippet" -   # multiline via stdin
tenfour list                                     # print the shelf
tenfour clear                                    # empty the shelf
```

Then summon Raycast → **Ten Four Shelf** → copy.

## Use with Claude Code

Add this to your `CLAUDE.md` so Claude pushes copyable snippets automatically:

```md
When you output a snippet I'm likely to want to copy (a URL, token, command,
path, or code block), also run:
  tenfour --label "<short label>" "<the exact text>"
so it lands on my Ten Four shelf with clean formatting.
```

## Configuration

- **Shelf location:** `~/.ten-four.json` by default. Override with the
  `TENFOUR_FILE` environment variable (set it for both the CLI and Raycast).
- The shelf keeps the most recent 200 snippets; pinned snippets are never
  trimmed.

## Notes

- The CLI is Node.js (zero dependencies) so it can ship as a single file inside
  the extension. It requires `node` on your `PATH`. A future Go rewrite would
  allow a dependency-free Homebrew bottle.

## License

MIT
