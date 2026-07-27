// Metro config — extends Expo defaults and:
//  1. Watches ../../packages/ui-tokens so changes hot-reload across the monorepo.
//  2. Adds nodeModulesPaths so RN can resolve from both apps/mobile and repo root.
//  3. Wraps in withNativeWind for v4 Tailwind support.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.resolve(monorepoRoot, 'packages/ui-tokens')];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = false;

module.exports = withNativeWind(config, { input: './src/global.css' });
