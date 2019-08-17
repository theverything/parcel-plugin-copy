const { Asset } = require('parcel-bundler');
const glob = require('glob');
const { promisify } = require('util');
const path = require('path');

const getFiles = promisify(glob);

function flatten(arr) {
  return arr.reduce((a, b) => a.concat(b), []);
}

class StaticManifestAsset extends Asset {
  async generate() {
    const f = this.contents;
    const baseDir = path.dirname(this.name);
    const globs = [];

    f.trim()
      .split('\n')
      .forEach(g => {
        if (g.startsWith('../')) {
          console.error('can not add files outside of cwd %s', g);
          return;
        }

        globs.push(g);
      });

    const files = await Promise.all(
      globs.map(g => getFiles(g, { cwd: baseDir, nodir: true }))
    )
      .then(flatten)
      .then(fls =>
        fls.map(f => ({ absolute: path.join(baseDir, f), relative: f }))
      );

    files.forEach(fl => {
      this.addDependency(fl.absolute, { includedInParent: true });
    });

    return [
      {
        type: 'staticmanifest',
        value: files
      }
    ];
  }
}

module.exports = StaticManifestAsset;
