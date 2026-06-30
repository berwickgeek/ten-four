import {
  List,
  ActionPanel,
  Action,
  Icon,
  Color,
  confirmAlert,
  Alert,
  showToast,
  Toast,
  getPreferenceValues,
} from "@raycast/api";
import { useEffect, useRef, useState } from "react";

type Item = {
  id: string;
  label: string;
  text: string;
  ts: number;
  pinned?: boolean;
};

const { shelfUrl } = getPreferenceValues<{ shelfUrl: string }>();
const BASE = shelfUrl.replace(/\/$/, "");
const POLL_MS = 1000;

function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return b.ts - a.ts;
  });
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function preview(text: string): string {
  const line = text.split("\n").find((l) => l.trim()) ?? text;
  return line.trim();
}

function asMarkdown(item: Item): string {
  // Fence the snippet so multiline/whitespace renders verbatim.
  const fence = item.text.includes("```") ? "~~~" : "```";
  return `### ${item.label}\n\n${fence}\n${item.text}\n${fence}`;
}

async function shelfFetch(suffix = "", init?: RequestInit): Promise<Response> {
  const res = await fetch(BASE + suffix, init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res;
}

export default function Command() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(true);
  const lastGood = useRef<Item[]>([]);
  const reachable = useRef(true);

  async function refresh() {
    try {
      const data = (await (await shelfFetch()).json()) as Item[];
      lastGood.current = data;
      setItems(data);
      reachable.current = true;
    } catch (error) {
      // Keep showing the last-known list instead of blanking, and only toast
      // on the transition from reachable -> unreachable.
      if (reachable.current) {
        showToast({
          style: Toast.Style.Failure,
          title: "Can't reach shelf",
          message: error instanceof Error ? error.message : String(error),
        });
      }
      reachable.current = false;
      setItems(lastGood.current);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, POLL_MS);
    return () => clearInterval(iv);
  }, []);

  function toastError(error: unknown) {
    showToast({
      style: Toast.Style.Failure,
      title: "Shelf action failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  async function togglePin(item: Item) {
    try {
      await shelfFetch(`/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !item.pinned }),
      });
      await refresh();
    } catch (error) {
      toastError(error);
    }
  }

  async function remove(item: Item) {
    try {
      await shelfFetch(`/${item.id}`, { method: "DELETE" });
      await refresh();
      showToast({ style: Toast.Style.Success, title: "Removed" });
    } catch (error) {
      toastError(error);
    }
  }

  async function clearAll() {
    const ok = await confirmAlert({
      title: "Clear the whole shelf?",
      message: "This removes every snippet, including pinned ones.",
      primaryAction: {
        title: "Clear All",
        style: Alert.ActionStyle.Destructive,
      },
    });
    if (!ok) return;
    try {
      await shelfFetch("", { method: "DELETE" });
      await refresh();
      showToast({ style: Toast.Style.Success, title: "Shelf cleared" });
    } catch (error) {
      toastError(error);
    }
  }

  const sorted = sortItems(items);

  return (
    <List
      isLoading={isLoading}
      isShowingDetail={showDetail && sorted.length > 0}
      searchBarPlaceholder="Search snippets…"
    >
      <List.EmptyView
        icon={Icon.Tray}
        title="Shelf is empty"
        description={`Push a snippet from your terminal:  tenfour "your text"`}
      />
      {sorted.map((item) => (
        <List.Item
          key={item.id}
          icon={
            item.pinned
              ? { source: Icon.Tack, tintColor: Color.Yellow }
              : Icon.Clipboard
          }
          title={item.label}
          subtitle={showDetail ? undefined : preview(item.text)}
          accessories={[{ text: timeAgo(item.ts) }]}
          detail={<List.Item.Detail markdown={asMarkdown(item)} />}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action.CopyToClipboard
                  title="Copy Snippet"
                  content={item.text}
                />
                <Action.Paste title="Paste to Active App" content={item.text} />
                <Action.CopyToClipboard
                  title="Copy Label"
                  content={item.label}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action
                  title={item.pinned ? "Unpin" : "Pin"}
                  icon={Icon.Tack}
                  shortcut={{ modifiers: ["cmd"], key: "p" }}
                  onAction={() => togglePin(item)}
                />
                <Action
                  title="Toggle Detail"
                  icon={Icon.Eye}
                  shortcut={{ modifiers: ["cmd"], key: "y" }}
                  onAction={() => setShowDetail((v) => !v)}
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action
                  title="Remove Snippet"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["ctrl"], key: "x" }}
                  onAction={() => remove(item)}
                />
                <Action
                  title="Clear Shelf"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "x" }}
                  onAction={clearAll}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
