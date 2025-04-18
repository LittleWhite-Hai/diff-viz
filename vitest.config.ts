import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/diff-algorithm.ts'],
    },
    environment: 'node',
    globals: true,
    include: ['test/unit/alignByLCS.test.ts', 'test/unit/calcDiffWithArrayAlign.test.ts'],
  },
});