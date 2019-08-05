import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as crypto from 'crypto';
import * as mkdirp from 'mkdirp';
import * as glob from 'glob';
import { uniq, concat } from 'lodash';
import { Context, Executable } from 'scaffold-kit';
import nullExecutable from 'scaffold-kit/lib/nullExecutable';
import { silentReporter } from 'scaffold-kit/lib/reporters';
import splitCommand from './splitCommand';

interface IterateFileParameter {
  message: string,
  expected: string | null,
  generated: () => string | null
}

type IterateFileCallback = (param: IterateFileParameter) => void;

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

    const context = new Context({ wd: process.cwd(), args: this.command, options: {}});
    context.mockInstall = true;
    context.reporter = silentReporter;
    await this.executable(context, nullExecutable);

    process.chdir(savedCwd);

    this.executed = true;
  }

  public iterateFiles = (callback: IterateFileCallback) => {
    const expectedFiles = glob.sync(path.join(this.expectedDirectory, '**/*'), { dot: true })
      .filter((f) => fs.lstatSync(f).isFile())
      .map((f) => path.relative(this.expectedDirectory, f));
    const fixtureFiles = !this.fixtureDirectory ? [] :
      glob.sync(path.join(this.fixtureDirectory, '**/*'), { dot: true })
        .filter((f) => fs.lstatSync(f).isFile())
        .map((f) => path.relative(this.fixtureDirectory as string, f));
    const fileList = uniq(concat(expectedFiles, fixtureFiles));
    fileList.forEach((filename: string) => {
      const expected = path.join(this.expectedDirectory, filename);
      const fixture = !this.fixtureDirectory ? undefined :
        path.join(this.fixtureDirectory, filename);
      const generated = path.join(this.tempDirectory, filename);
      const generatedContent = () =>
        fs.existsSync(generated) ? fs.readFileSync(generated).toString() : null;
      if (!fs.existsSync(expected)) {
        callback({
          message: `deletes file '${filename}'.`,
          expected: null,
          generated: generatedContent
        });
      } else {
        const expectedContent = fs.readFileSync(expected).toString();
        if (!fs.existsSync(fixture as fs.PathLike)) {
          callback({
            message: `creates file '${filename}'.`,
            expected: expectedContent,
            generated: generatedContent
          });
        } else {
          const fixtureContent = fs.readFileSync(fixture as fs.PathLike).toString();
          if (fixtureContent === expectedContent) {
            callback({
              message: `keeps file '${filename}'.`,
              expected: expectedContent,
              generated: generatedContent
            });
          } else {
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

}

export default TestHandler;
