import { resolve } from 'node:path';

export default {
  test: {
    root: resolve(import.meta.dirname, '../..'),
    include: ['tests/**/*.test.ts'],
    setupFiles: [resolve(import.meta.dirname, 'record-speech.ts')],
  },
};
