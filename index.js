const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const glob = require('glob');

const { executeApp } = require('scaffold-kit/app');
const { setExecutorOption, resetExecutor } = require('scaffold-kit/executor');

const runningTests = {};

const setupTest = (groupName, app, templateDir) => {
  const tmpDir = path.join(
    os.tmpdir(),
    crypto.randomBytes(16).toString('hex')
  );
  runningTests[groupName] = {
    app,
    templateDir,
    tmpDir,
    commands: {}
  };
  return () => {
    mkdirp.sync(tmpDir);
  };
};

const cleanUpTest = (groupName) => {
  return () => {
    fs.removeSync(runningTests[groupName].tmpDir);
    delete runningTests[groupName];
  };
};

const runTest = ({ group, template, command }) => {
  runningTests[group].commands[template] = command;
  return async () => {
    const dest = path.join(runningTests[group].tmpDir, template);
    mkdirp.sync(dest);
    process.chdir(dest);
    setExecutorOption('silent', true);
    setExecutorOption('mock', true);
    await executeApp(runningTests[group].app, command.split(' '));
    resetExecutor();
  };
};

const iterateFiles = (group, template, func) => {
  const temp = path.join(runningTests[group].templateDir, template);
  const files = glob.sync(
    path.join(temp, '**/*')).filter((f) => fs.lstatSync(f).isFile()
  ).map((f) => path.relative(temp, f));
  files.forEach((filename) => {
    const tmp = path.join(runningTests[group].tmpDir, template);
    const expected = (filename) => fs.readFileSync(path.join(temp, filename)).toString();
    const generated = (filename) => fs.readFileSync(path.join(tmp, filename)).toString();
    func({ filename, generated, expected });
  });
};

const getDirectory = (group, template) => {
  return path.join(runningTests[group].tmpDir, template);
};

module.exports = {
  setupTest,
  cleanUpTest,
  runTest,
  iterateFiles,
  getDirectory
};
