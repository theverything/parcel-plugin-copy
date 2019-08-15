const fs = require('fs-extra');
const path = require('path');

module.exports = function copyFiles(bundler) {
  bundler.on('bundled', async bundle => {
    // main asset and package dir, depending on version of parcel-bundler
    let mainAsset =
      bundler.mainAsset || // parcel < 1.8
      bundler.mainBundle.entryAsset || // parcel >= 1.8 single entry point
      bundler.mainBundle.childBundles.values().next().value.entryAsset; // parcel >= 1.8 multiple entry points
    let pkg;
    if (typeof mainAsset.getPackage === 'function') {
      // parcel > 1.8
      pkg = await mainAsset.getPackage();
    } else {
      // parcel <= 1.8
      pkg = mainAsset.package;
    }

    if (!pkg) {
      console.error(`No package.json file found.`);
      return;
    }

    const copyFiles = pkg.copyFiles;
    const bundleDir = path.dirname(bundle.name);

    copyFiles.forEach(f => {
      let from;
      let to;

      if (typeof f === 'object') {
        ({ from, to } = f);
        to = path.join(bundleDir, to);
      } else {
        from = f;
        to = path.join(bundleDir, path.basename(f));
      }

      try {
        fs.copySync(from, to, { overwrite: true });

        if (bundler.watch) {
          bundler.watch(from, mainAsset);
        }
      } catch (error) {
        console.error(error);
      }
    });
  });
};
