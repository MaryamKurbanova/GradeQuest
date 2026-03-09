export const STORAGE_KEYS = {
  appSettings: "gradequest.app_settings.v1",
  theme: "gradequest.theme.v1",
  subscription: "gradequest.subscription.v1",
  billingState: "gradequest.billing_state.v1",
  notifications: "gradequest.notifications.v1",
  reminderSchedule: "gradequest.reminder_schedule.v1",
  studyData: "gradequest.study_data.v1",
  calculator: "gradequest.calculator.v1",
  gamification: "gradequest.gamification.v1",
  widgets: "gradequest.widgets.v1",
} as const;

type StorageEngine = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStore = new Map<string, string>();

const createMemoryEngine = (): StorageEngine => ({
  getItem: async (key) => memoryStore.get(key) ?? null,
  setItem: async (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: async (key) => {
    memoryStore.delete(key);
  },
});

const createLocalStorageEngine = (): StorageEngine | null => {
  const local = (globalThis as { localStorage?: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void; } }).localStorage;
  if (!local) {
    return null;
  }

  return {
    getItem: async (key) => local.getItem(key),
    setItem: async (key, value) => {
      local.setItem(key, value);
    },
    removeItem: async (key) => {
      local.removeItem(key);
    },
  };
};

const createAsyncStorageEngine = (): StorageEngine | null => {
  const maybeRequire = (globalThis as { require?: (name: string) => unknown }).require;
  if (!maybeRequire) {
    return null;
  }

  try {
    const module = maybeRequire("@react-native-async-storage/async-storage") as {
      default?: StorageEngine;
    };
    const asyncStorage = module?.default;
    if (!asyncStorage) {
      return null;
    }

    return {
      getItem: asyncStorage.getItem.bind(asyncStorage),
      setItem: asyncStorage.setItem.bind(asyncStorage),
      removeItem: asyncStorage.removeItem.bind(asyncStorage),
    };
  } catch {
    return null;
  }
};

const storageEngine: StorageEngine =
  createAsyncStorageEngine() ?? createLocalStorageEngine() ?? createMemoryEngine();

export const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const rawValue = await storageEngine.getItem(key);
    if (!rawValue) {
      return fallback;
    }
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
};

export const writeJson = async <T>(key: string, value: T): Promise<void> => {
  try {
    await storageEngine.setItem(key, JSON.stringify(value));
  } catch {
    // Intentionally ignored for MVP; errors can be surfaced in telemetry later.
  }
};

export const removeValue = async (key: string): Promise<void> => {
  try {
    await storageEngine.removeItem(key);
  } catch {
    // Intentionally ignored for MVP; errors can be surfaced in telemetry later.
  }
};
