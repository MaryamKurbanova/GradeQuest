import { readJson, removeValue, writeJson } from "../storage";

const TEST_KEY = "gradequest.test.storage";

describe("storage utils", () => {
  afterEach(async () => {
    await removeValue(TEST_KEY);
  });

  it("writes and reads JSON values", async () => {
    await writeJson(TEST_KEY, { hello: "world", count: 2 });
    const value = await readJson(TEST_KEY, { hello: "fallback", count: 0 });
    expect(value).toEqual({ hello: "world", count: 2 });
  });

  it("returns fallback when key does not exist", async () => {
    const value = await readJson(TEST_KEY, { enabled: false });
    expect(value).toEqual({ enabled: false });
  });
});
