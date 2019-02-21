const fs = require('fs-extra');

const tearDownTest = (handle) => {
  return () => {
    fs.removeSync(handle.temp);
  };
};

module.exports = tearDownTest;
