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

    const contents = await Promise.all(
      files.map(f =>
        fs.readFile(f.absolute).then(c => ({ path: f.relative, contents: c }))
      )
    );

    this.size = contents.reduce((s, c) => s + c.contents.length, 0);

    await Promise.all(
      contents.map(c => fs.outputFile(path.join(distDir, c.path), c.contents))
    );
  }

  getSize() {
    return this.size || 0;
  }

  end() {}
}

module.exports = StaticPackager;
