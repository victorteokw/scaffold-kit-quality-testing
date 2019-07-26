import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as crypto from 'crypto';
import * as mkdirp from 'mkdirp';
import * as glob from 'glob';
import { execute, Executable } from 'scaffold-kit';
import splitCommand from './splitCommand';

class TestHandler {

  private executable: Executable; // The executable to be tested
  private command: string[]; // The command that is tested against
  private fixtureDirectory?: string; // The directory where original files are located.
  private expectedDirectory: string; // The directory where expected files are located.
  private tempDirectory: string; // The temporary directory where generated files are located.
  private destroyed: boolean;
  private executed: boolean;

  constructor(executable: Executable, command: string, expectedDirectory: string, fixtureDirectory?: string) {
    this.destroyed = false;
    this.executed = false;
    this.executable = executable;
    this.command = splitCommand(command);
    this.expectedDirectory = expectedDirectory;
    if (fixtureDirectory) this.fixtureDirectory = fixtureDirectory;
    this.tempDirectory = path.join(os.tmpdir(), crypto.randomBytes(16).toString('hex'));
  }

  public destroy() {
    if (this.destroyed) return;
    fs.removeSync(this.tempDirectory);
  }

  public async execute() {

    if (this.executed) return;

    const savedCwd = process.cwd();

    mkdirp.sync(this.tempDirectory);
    process.chdir(this.tempDirectory);

    if (this.fixtureDirectory) {
      await fs.copy(this.fixtureDirectory, this.tempDirectory);
    }

    // set mock
    // set silent
    await execute(this.executable, { wd: process.cwd(), args: this.command, options: {}});

    process.chdir(savedCwd);

    this.executed = true;
  }



}
