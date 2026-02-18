
const DB_NAME = 'FinanceAppDB';
const STORE_NAME = 'local_data';

class StorageService {
    private dbPromise: Promise<IDBDatabase> | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.dbPromise = this.initDB();
        }
    }

    private initDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event);
                reject("IndexedDB failed to open");
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    // LocalStorage Wrapper
    setItem(key: string, value: any): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("Error saving to localStorage", e);
        }
    }

    getItem<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error("Error reading from localStorage", e);
            return null;
        }
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    // IndexedDB Operations
    async saveToIndexedDB(data: any): Promise<void> {
        if (!this.dbPromise) return;
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getAllFromIndexedDB(): Promise<any[]> {
        if (!this.dbPromise) return [];
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // JSON Export/Import
    exportDataToJSON(data: any, filename: string = 'data.json') {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(data)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = filename;
        link.click();
    }

    async importDataFromJSON(file: File): Promise<any> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    resolve(json);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
}

export const storageService = new StorageService();
