const splitCommand = (command: string[] | string) : string[] => {
  if (Array.isArray(command)) {
    return command;
  } else {
    return command.split(' ');
  }
};

export default splitCommand;
