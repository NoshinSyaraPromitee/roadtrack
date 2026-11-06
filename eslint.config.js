import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const deepFeature = {
  group: ['@/features/*/**'],
  message: 'Import another feature only through its public index, for example @/features/shift.',
}
const leaveFeature = {
  regex: '^\\.\\./\\.\\./',
  message: 'Do not climb out of a feature with ../..; import the other feature through @/features/<name>.',
}
const outer = (layers, why) => ({ group: layers.flatMap((l) => [`@/${l}`, `@/${l}/**`]), message: why })

const layer = (files, ...patterns) => ({
  files,
  rules: { 'no-restricted-imports': ['error', { patterns: [deepFeature, ...patterns] }] },
})

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'max-lines': ['error', { max: 160 }],
      'no-restricted-imports': ['error', { patterns: [deepFeature] }],
    },
  },
  layer(
    ['src/core/**/*.ts'],
    outer(['features', 'pages', 'app', 'data', 'shared'], 'core holds plain business rules and must not depend on any other layer.'),
    { group: ['react', 'react-dom', 'react-router-dom', 'zustand', 'zustand/*', 'lucide-react', 'recharts'], message: 'core must stay free of UI and state libraries.' },
  ),
  layer(['src/data/**/*.ts'], outer(['features', 'pages', 'app', 'shared'], 'data is demo seed data; it may only use core.')),
  layer(['src/shared/**/*.{ts,tsx}'], outer(['features', 'pages', 'app', 'data'], 'shared is reusable building blocks and must not know about features, pages or data.')),
  layer(['src/features/**/*.{ts,tsx}'], leaveFeature, outer(['pages', 'app'], 'features must not depend on pages or the app shell.')),
  layer(['src/pages/**/*.{ts,tsx}'], outer(['app'], 'pages must not depend on the app shell.')),
])
