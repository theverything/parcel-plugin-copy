const fs = require('fs-extra');
const path = require('path');
const Bundler = require('parcel-bundler');

const copyFiles = require('./index');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

beforeEach(() => {
  fs.emptydirSync('./dist');
});

afterAll(() => {
  fs.emptyDirSync('./dist');
  fs.rmdirSync('./dist');
});

test('should copy files', () => {
  let bundler = new Bundler('./fixtures/entrypoint.html', {
    outDir: path.join(__dirname, 'dist'),
    watch: false,
    cache: false,
    hmr: false,
    logLevel: 0
  });

  copyFiles(bundler);

  return bundler.bundle().then(() => {
    const files = fs.readdirSync('dist');

    expect(files.includes('test.json')).toBeTruthy();
    expect(files.includes('entrypoint.html')).toBeTruthy();
  });
});

test('should watch files', done => {
  let bundler = new Bundler('./fixtures/entrypoint.html', {
    outDir: path.join(__dirname, 'dist'),
    watch: true,
    cache: false,
    hmr: false,
    logLevel: 0
  });

  copyFiles(bundler);

  return bundler
    .bundle()
    .then(() => wait(1000))
    .then(b => {
      const files = fs.readdirSync('dist');

      expect(files.includes('test.json')).toBeTruthy();
      expect(files.includes('entrypoint.html')).toBeTruthy();
      expect(
        JSON.parse(fs.readFileSync('dist/test.json', 'utf8'))
      ).toStrictEqual({
        test: 'foo'
      });

      fs.writeFileSync('dist/test.json', '{"test":"bar"}');

      return wait(1000);
    })
    .then(() => {
      expect(
        JSON.parse(fs.readFileSync('dist/test.json', 'utf8'))
      ).toStrictEqual({
        test: 'bar'
      });
    })
    .then(done)
    .catch(done)
    .finally(() => bundler.stop());
}, 3000);
