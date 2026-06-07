// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support for .env files
config.resolver.assetExts = [...config.resolver.assetExts, 'env'];

module.exports = config;