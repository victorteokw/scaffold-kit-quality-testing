const fs = require('fs-extra');
const mkdirp = require('mkdirp');

const { executeApp } = require('scaffold-kit/app');
const { setExecutorOption, resetExecutor } = require('scaffold-kit/executor');

const runTestCase = (handle) => {
  return async () => {

    const { app, fixtures, temp, command } = handle;

    const savedCwd = process.cwd();

    mkdirp.sync(temp);
    process.chdir(temp);
    if (fixtures) {
      await fs.copy(fixtures, temp);
    }
    setExecutorOption('silent', true);
    setExecutorOption('mock', true);
    await executeApp(app, command);
    resetExecutor();

    process.chdir(savedCwd);

  };
};

module.exports = runTestCase;
