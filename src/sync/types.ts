// Senkron altyapısına özel tipler (iş domain'i entity'lerinden ayrı tutulur).

export type SyncedTableName = 'teachers' | 'classes';

export interface OutboxEntry {
  localId?: number;
  tableName: SyncedTableName;
  entityId: string;
  operation: 'upsert';
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export interface SyncMetaEntry {
  tableName: SyncedTableName;
  lastPulledAt: string;
}
