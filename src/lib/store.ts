import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { DEFAULT_WATCHED } from "./currencies";
import type { Store, Trade } from "./types";

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const emptyStore = (): Store => ({
  watched: [...DEFAULT_WATCHED],
  trades: [],
});

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    return {
      watched:
        Array.isArray(parsed.watched) && parsed.watched.length > 0
          ? parsed.watched
          : [...DEFAULT_WATCHED],
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
    };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: Store) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function getStore() {
  return withLock(readStore);
}

export function addTrade(input: Omit<Trade, "id" | "createdAt">) {
  return withLock(async () => {
    const store = await readStore();
    const trade: Trade = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    store.trades.push(trade);
    if (!store.watched.includes(trade.currency)) {
      store.watched.push(trade.currency);
    }
    await writeStore(store);
    return trade;
  });
}

export function deleteTrade(id: string) {
  return withLock(async () => {
    const store = await readStore();
    store.trades = store.trades.filter((trade) => trade.id !== id);
    await writeStore(store);
  });
}

export function setWatched(codes: string[]) {
  return withLock(async () => {
    const store = await readStore();
    const unique = [...new Set(codes.map((code) => code.toUpperCase()))];
    store.watched = unique.length > 0 ? unique : [...DEFAULT_WATCHED];
    await writeStore(store);
    return store.watched;
  });
}
