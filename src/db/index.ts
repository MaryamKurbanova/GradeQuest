export const DB_NAME = "gradequest.db";
export const DB_SCHEMA_VERSION = 1;

export type MigrationDefinition = {
  version: number;
  name: string;
  filePath: string;
};

export const MIGRATIONS: MigrationDefinition[] = [
  {
    version: 1,
    name: "init",
    filePath: "src/db/migrations/001_init.sql",
  },
];

export type DatabaseRuntimeStatus = {
  isInitialized: boolean;
  schemaVersion: number;
  lastInitializedAt: string | null;
};

export const DEFAULT_DATABASE_RUNTIME_STATUS: DatabaseRuntimeStatus = {
  isInitialized: false,
  schemaVersion: 0,
  lastInitializedAt: null,
};
