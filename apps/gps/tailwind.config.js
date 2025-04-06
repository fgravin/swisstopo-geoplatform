import { createGlobPatternsForDependencies } from '@nx/angular/tailwind'
import { join } from 'path'
import baseConfig from 'geonetwork-ui/tailwind.base.config.js'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [baseConfig],
  content: [
    './node_modules/geonetwork-ui/**/*.mjs',
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
