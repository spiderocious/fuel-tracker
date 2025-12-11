import localforage from 'localforage';

const MILEAGE_LOGS_KEY = 'mileage_logs';

class StorageService {
  private store = localforage.createInstance({
    name: 'miletracker',
    storeName: 'mileage_data',
  });

  async getItem<T>(key: string): Promise<T | null> {
    try {
      return await this.store.getItem<T>(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await this.store.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.store.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.store.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  getMileageLogsKey(): string {
    return MILEAGE_LOGS_KEY;
  }
}

export const storageService = new StorageService();
