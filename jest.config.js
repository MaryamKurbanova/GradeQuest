/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx",
    "**/?(*.)+(spec|test).ts",
    "**/?(*.)+(spec|test).tsx"
  ],
  testPathIgnorePatterns: ["/node_modules/"],
};
