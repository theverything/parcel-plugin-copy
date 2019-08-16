const { Packager } = require('parcel-bundler');
const fs = require('fs-extra');
const path = require('path');

class StaticPackager extends Packager {
  static shouldAddAsset() {
    return false;
  }

  setup() {}

  async addAsset(asset) {
    const files = asset.generated.staticmanifest;
    const distDir = path.dirname(this.bundle.name);
    let mainAsset =
      this.bundler.mainAsset || // parcel < 1.8
      this.bundler.mainBundle.entryAsset || // parcel >= 1.8 single entry point
      this.bundler.mainBundle.childBundles.values().next().value.entryAsset; // parcel >= 1.8 multiple entry points

    await Promise.all(
      files.map(f => {
        return fs.copy(f.absolute, path.join(distDir, f.relative));
      })
    );

    files.forEach(f => {
      if (this.bundler.watch) {
        this.bundler.watch(f.absolute, mainAsset);
      }
    });
  }

  getSize() {
    return 0;
  }

  end() {}
}

module.exports = StaticPackager;
