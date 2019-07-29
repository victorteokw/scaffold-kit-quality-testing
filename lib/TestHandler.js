"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const crypto = require("crypto");
const mkdirp = require("mkdirp");
const glob = require("glob");
const lodash_1 = require("lodash");
const scaffold_kit_1 = require("scaffold-kit");
const reporters_1 = require("scaffold-kit/lib/reporters");
const splitCommand_1 = require("./splitCommand");
class TestHandler {
    constructor(executable, command, expectedDirectory, fixtureDirectory) {
        this.iterateFiles = (callback) => {
            const expectedFiles = glob.sync(path.join(this.expectedDirectory, '**/*'), { dot: true })
                .filter((f) => fs.lstatSync(f).isFile())
                .map((f) => path.relative(this.expectedDirectory, f));
            const fixtureFiles = !this.fixtureDirectory ? [] :
                glob.sync(path.join(this.fixtureDirectory, '**/*'), { dot: true })
                    .filter((f) => fs.lstatSync(f).isFile())
                    .map((f) => path.relative(this.fixtureDirectory, f));
            const fileList = lodash_1.uniq(lodash_1.concat(expectedFiles, fixtureFiles));
            fileList.forEach((filename) => {
                const expected = path.join(this.expectedDirectory, filename);
                const fixture = !this.fixtureDirectory ? undefined :
                    path.join(this.fixtureDirectory, filename);
                const generated = path.join(this.tempDirectory, filename);
                const generatedContent = () => fs.existsSync(generated) ? fs.readFileSync(generated).toString() : null;
                if (!fs.existsSync(expected)) {
                    callback({
                        message: `deletes file '${filename}'.`,
                        expected: null,
                        generated: generatedContent
                    });
                }
                else {
                    const expectedContent = fs.readFileSync(expected).toString();
                    if (!fs.existsSync(fixture)) {
                        callback({
                            message: `creates file '${filename}'.`,
                            expected: expectedContent,
                            generated: generatedContent
                        });
                    }
                    else {
                        const fixtureContent = fs.readFileSync(fixture).toString();
                        if (fixtureContent === expectedContent) {
                            callback({
                                message: `keeps file '${filename}'.`,
                                expected: expectedContent,
                                generated: generatedContent
                            });
                        }
                        else {
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
        this.destroyed = false;
        this.executed = false;
        this.executable = executable;
        this.command = splitCommand_1.default(command);
        this.expectedDirectory = expectedDirectory;
        if (fixtureDirectory)
            this.fixtureDirectory = fixtureDirectory;
        this.tempDirectory = path.join(os.tmpdir(), crypto.randomBytes(16).toString('hex'));
    }
    destroy() {
        if (this.destroyed)
            return;
        fs.removeSync(this.tempDirectory);
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.executed)
                return;
            const savedCwd = process.cwd();
            mkdirp.sync(this.tempDirectory);
            process.chdir(this.tempDirectory);
            if (this.fixtureDirectory) {
                yield fs.copy(this.fixtureDirectory, this.tempDirectory);
            }
            const context = new scaffold_kit_1.Context({ wd: process.cwd(), args: this.command, options: {} });
            context.mockInstall = true;
            context.reporter = reporters_1.silentReporter;
            yield scaffold_kit_1.execute(this.executable, context);
            process.chdir(savedCwd);
            this.executed = true;
        });
    }
}
exports.default = TestHandler;
