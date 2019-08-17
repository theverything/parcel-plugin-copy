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

    await Promise.all(
      files.map(f => {
        return fs.copy(f.absolute, path.join(distDir, f.relative));
      })
    );

  }

  getSize() {
    return 0;
  }

  end() {}
}

module.exports = StaticPackager;
