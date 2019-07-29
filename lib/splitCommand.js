"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const splitCommand = (command) => {
    if (Array.isArray(command)) {
        return command;
    }
    else {
        return command.split(' ');
    }
};
exports.default = splitCommand;
