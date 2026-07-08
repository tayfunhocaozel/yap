import { isReachable } from './networkStatus';
import { pushOutbox } from './pushOutbox';
import { pullTable } from './pullTable';
import { SYNC_TABLES } from './syncTables';

const DEBOUNCE_MS = 500;
const PERIODIC_INTERVAL_MS = 2 * 60 * 1000;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let syncing = false;
let rerunRequested = false;

async function runSync(): Promise<void> {
  if (syncing) {
    rerunRequested = true;
    return;
  }
  syncing = true;
  try {
    if (await isReachable()) {
      // Sıralı: push önce (yerel değişiklikler buluta gitsin), pull sonra
      // (pull, outbox'ta bekleyen kayıtları atlıyor; push'un outbox'ı
      // boşaltmasından SONRA pull çalışırsa daha güncel bir görüntü alınır).
      await pushOutbox();
      for (const { tableName, table } of SYNC_TABLES) {
        await pullTable(tableName, table);
      }
    }
  } finally {
    syncing = false;
    if (rerunRequested) {
      rerunRequested = false;
      void runSync();
    }
  }
}

/** Debounce'lu senkron tetikleyici; art arda çağrılar tek bir denemeye toplanır. */
export function kickSync(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void runSync();
  }, DEBOUNCE_MS);
}

let periodicStarted = false;

/** Oturum açıldığında bir kez çağrılır: anlık + periyodik + online event'inde senkron. */
export function startPeriodicSync(): void {
  if (periodicStarted) return;
  periodicStarted = true;
  kickSync();
  setInterval(kickSync, PERIODIC_INTERVAL_MS);
  window.addEventListener('online', kickSync);
}
