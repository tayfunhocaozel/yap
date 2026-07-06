// Proje-özel sabit namespace UUID (rastgele üretilip buraya gömülmüştür).
// Değiştirilmemeli — değiştirilirse tüm mevcut deterministik id'ler kayar.
const NAMESPACE_HEX = '6f6d0a4e6e1a5f1a9d1b8f3c2a7b9e10';

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * RFC 4122 UUID v5 (SHA-1 tabanlı, deterministik): aynı `name` girdisi her
 * zaman aynı id'yi üretir. Birden fazla istemcinin/sunucunun aynı referans
 * veri (ör. müfredat Subject/Topic/CurriculumOutcome) için bağımsız olarak
 * aynı id'yi üretmesi gerektiğinde `crypto.randomUUID()` yerine kullanılır.
 */
export async function deterministicUuid(name: string): Promise<string> {
  const namespaceBytes = hexToBytes(NAMESPACE_HEX);
  const nameBytes = new TextEncoder().encode(name);
  const data = new Uint8Array(namespaceBytes.length + nameBytes.length);
  data.set(namespaceBytes, 0);
  data.set(nameBytes, namespaceBytes.length);

  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashBytes = new Uint8Array(hashBuffer).slice(0, 16);
  hashBytes[6] = (hashBytes[6] & 0x0f) | 0x50; // version 5
  hashBytes[8] = (hashBytes[8] & 0x3f) | 0x80; // variant RFC 4122

  return bytesToUuid(hashBytes);
}
