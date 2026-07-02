/**
 * contractFileStorage — IndexedDB-backed storage for contract PDF files.
 *
 * Only metadata (storageKey, fileSize, etc.) is kept in the React store.
 * The raw bytes live in IndexedDB under the "contractFiles" object store.
 *
 * LIMITATION: Files are stored locally on this device only.
 * Persistent cloud storage must be wired to a real backend endpoint.
 */

const DB_NAME    = "template-a2-contracts";
const DB_VERSION = 1;
const STORE_NAME = "contractFiles";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/**
 * Save a File to IndexedDB.
 * Returns a `storageKey` (UUID) that uniquely identifies the stored blob.
 */
export async function saveContractFile(file: File): Promise<string> {
  const db  = await openDB();
  const key = crypto.randomUUID();
  const buf = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req   = store.put({ buf, mimeType: file.type, fileName: file.name }, key);
    req.onsuccess = () => resolve(key);
    req.onerror   = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

interface StoredFile {
  buf: ArrayBuffer;
  mimeType: string;
  fileName: string;
}

/**
 * Retrieve raw stored file data by storageKey.
 * Returns null if not found.
 */
export async function getContractFile(storageKey: string): Promise<StoredFile | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req   = store.get(storageKey);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as StoredFile) ?? null);
    };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

/**
 * Create a temporary object URL for a stored contract.
 * Caller is responsible for calling URL.revokeObjectURL() when done.
 */
export async function createContractObjectURL(storageKey: string): Promise<string | null> {
  const stored = await getContractFile(storageKey);
  if (!stored) return null;
  const blob = new Blob([stored.buf], { type: stored.mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Trigger a browser download for a stored contract.
 * Uses the original file name.
 */
export async function downloadContractFile(storageKey: string, fileName: string): Promise<void> {
  const stored = await getContractFile(storageKey);
  if (!stored) throw new Error("Archivo no encontrado en el almacenamiento local.");
  const blob = new Blob([stored.buf], { type: stored.mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Delete a stored contract by its storageKey.
 */
export async function deleteContractFile(storageKey: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req   = store.delete(storageKey);
    req.onsuccess = () => { db.close(); resolve(); };
    req.onerror   = () => { db.close(); reject(req.error); };
  });
}

/** Max allowed upload size in bytes (15 MB). */
export const MAX_CONTRACT_FILE_SIZE = 15 * 1024 * 1024;

/** Human-readable formatted file size. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
