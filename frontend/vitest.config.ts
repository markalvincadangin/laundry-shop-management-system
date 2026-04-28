import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.tsx"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: [
      { find: /^@\/features\/(.*)$/, replacement: path.resolve(__dirname, "src/components/features/$1") },
      { find: /^@\/services\/(.*)$/, replacement: path.resolve(__dirname, "src/services/$1") },
      { find: /^@\/hooks\/(.*)$/, replacement: path.resolve(__dirname, "src/hooks/$1") },
      { find: /^@\/constants\/(.*)$/, replacement: path.resolve(__dirname, "src/constants/$1") },
      { find: /^@\/types\/(.*)$/, replacement: path.resolve(__dirname, "src/types/$1") },
      { find: /^@\/lib\/(.*)$/, replacement: path.resolve(__dirname, "src/lib/$1") },
      { find: /^@\/contexts\/(.*)$/, replacement: path.resolve(__dirname, "src/contexts/$1") },
      { find: "@", replacement: path.resolve(__dirname, "src") },
    ],
  },
});
