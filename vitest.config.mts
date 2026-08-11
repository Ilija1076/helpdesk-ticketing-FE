import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Native tsconfig `paths` resolution, so the `@/` alias works without a plugin.
  resolve: { tsconfigPaths: true },
  test: {
    // Node by default: almost everything worth testing here is pure logic, and jsdom costs
    // roughly two minutes of startup for nothing. The few component tests opt in with a
    // `@vitest-environment jsdom` docblock.
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
