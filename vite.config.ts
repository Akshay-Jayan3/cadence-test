import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'

/*
 * The React Compiler runs through a Rolldown plugin, which does not
 * load inside Vitest's worker. It is a build-time optimisation and
 * changes no behaviour under test, so it is skipped there.
 */
const isTest = process.env.VITEST === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isTest
      ? []
      : [babel({ presets: [reactCompilerPreset()] })]),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    /*
     * One worker at a time. A jsdom environment per file in parallel
     * is enough to exhaust memory on smaller machines, and the suite
     * is fast enough that the serial run costs nothing.
     */
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
  },
})
