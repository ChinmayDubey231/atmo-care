import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./test/globalSetup.ts"],
    // All files share one test database
    fileParallelism: false,
  },
});
