const splitCommand = (command) => {
  if (Array.isArray(command)) {
    return command;
  } else {
    return command.split(' ');
  }
};

module.exports = splitCommand;
