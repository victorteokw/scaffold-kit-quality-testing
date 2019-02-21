const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const uniq = require('lodash/uniq');
const concat = require('lodash/concat');

const iterateExpectedFiles = (handle, callback) => {
  const { fixtures, expects, temp } = handle;
  const expectedFiles = glob.sync(
    path.join(expects, '**/*'), { dot: true }
  ).filter((f) => fs.lstatSync(f).isFile())
    .map((f) => path.relative(expects, f));
  const fixtureFiles = fixtures ? glob.sync(
    path.join(fixtures, '**/*'), { dot: true }
  ).filter((f) => fs.lstatSync(f).isFile())
    .map((f) => path.relative(fixtures, f)) : [];
  const fileList = uniq(concat(expectedFiles, fixtureFiles));
  fileList.forEach((filename) => {
    const expected = path.join(expects, filename);
    const fixture = fixtures ? path.join(fixtures, filename) : undefined;
    const generated = path.join(temp, filename);
    const generatedContent =
      fs.existsSync(generated) ? fs.readFileSync(generated).toString() : null;
    if (!fs.existsSync(expected)) {
      callback({
        message: `deletes file '${filename}'.`,
        expected: null,
        generated: generatedContent
      });
    } else {
      const expectedContent = fs.readFileSync(expected).toString();
      if (!fs.existsSync(fixture)) {
        callback({
          message: `creates file '${filename}'.`,
          expected: expectedContent,
          generated: generatedContent
        });
      } else {
        const fixtureContent = fs.readFileSync(fixture).toString();
        if (fixtureContent === expectedContent) {
          callback({
            message: `keeps file '${filename}'.`,
            expected: expectedContent,
            generated: generatedContent
          });
        } else {
          callback({
            message: `updates file '${filename}'.`,
            expected: expectedContent,
            generated: generatedContent
          });
        }
      }
    }
  });
};

module.exports = iterateExpectedFiles;
