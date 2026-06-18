const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Metro's web dev bundle is loaded as a classic script. Some package ESM
// exports (notably zustand@4.5.x) contain import.meta.env, which is only valid
// in module scripts and crashes the browser before the app boots.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
