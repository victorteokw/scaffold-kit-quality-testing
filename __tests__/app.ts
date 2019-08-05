import { applyMiddleware, Executable } from 'scaffold-kit';
import { executeInstructions } from 'scaffold-kit/lib/middlewares';
import * as fs from 'fs';
import * as path from 'path';

const app: Executable = async (ctx, next) => {
  if (fs.existsSync(path.join(ctx.wd, '2.txt'))) {
    ctx.createFile({
      at: '2-exist.txt',
      content: '2 is exist.\n'
    });
  }
  ctx.createFile({
    at: '3.txt',
    content: '3 is exist.\n'
  });
  ctx.deleteFile({
    at: '1.txt',
    content: '1 is exist.\n'
  });
  ctx.updateFile({
    at: '4.txt',
    updator: (s) => {
      return '5 is exist.\n';
    },
    rollbacker: (s) => {
      return '4 is exist.\n';
    }
  });
  await next(ctx);
};

export default applyMiddleware(app, executeInstructions);
