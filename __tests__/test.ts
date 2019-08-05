import * as path from 'path';
import TestHandler from '../src/TestHandler';
import app from './app';

describe('TestHandler', () => {

  const filesPath = path.join(__dirname, 'files');
  const fixturesPath = path.join(filesPath, 'fixtures');
  const expectsPath = path.join(filesPath, 'expects');
  const handler = new TestHandler(app, '', expectsPath, fixturesPath);
  const retval: any[] = [];

  beforeAll(async () => {
    await handler.execute();
    handler.iterateFiles(({ message, expected, generated }) => {
      retval.push({
        message,
        expected,
        generated: generated()
      });
    });
  });

  afterAll(async () => {
    await handler.destroy();
  });

  it('gives create message if not exist before', () => {
    expect(retval[0]).toEqual({
      message: "creates file '2-exist.txt'.",
      expected: '2 is exist.\n',
      generated: '2 is exist.\n'
    });
  });

  it('gives delete message if exist before but deleted in the process', () => {
    expect(retval[4]).toEqual({
      message: "deletes file '1.txt'.",
      expected: null,
      generated: null
    });
  });

  it('gives update message if file has updates', () => {
    expect(retval[3]).toEqual({
      message: "updates file '4.txt'.",
      expected: '5 is exist.\n',
      generated: '5 is exist.\n'
    });
  });

  it('gives keep message if file is unchanged', () => {
    expect(retval[1]).toEqual({
      message: "keeps file '2.txt'.",
      expected: '2 is exist.\n',
      generated: '2 is exist.\n'
    });
  });

});
