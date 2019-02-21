const fs = require('fs-extra');

const tearDownTest = ({ temp }) => {
  return () => {
    fs.removeSync(temp);
  };
};

module.exports = tearDownTest;
