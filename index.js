const fs = require('fs-extra');
const path = require('path');

module.exports = function copyFiles(bundler) {
  bundler.addPackager('staticmanifest', require.resolve('./StaticPackager.js'));
  bundler.addAssetType(
    'staticmanifest',
    require.resolve('./StaticManifestAsset.js')
  );
};
