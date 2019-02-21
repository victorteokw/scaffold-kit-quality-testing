const path = require('path');
const os = require('os');
const crypto = require('crypto');
const splitCommand = require('./splitCommand');

const setupTestCase = ({ app, expects, fixtures, command }) => {
  return {
    app,
    fixtures,
    expects,
    command: splitCommand(command),
    temp: path.join(os.tmpdir(), crypto.randomBytes(16).toString('hex'))
  };
};

module.exports = setupTestCase;
