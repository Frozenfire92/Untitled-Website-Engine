import { promisify } from 'util'
import { promises as fsPromises, exists as _exists } from 'fs';
const { readdir, rmdir, lstat, unlink, mkdir, copyFile } = fsPromises;
const exists = promisify(_exists);

export async function listFiles(path: string): Promise<Array<string>> {
  let list: Array<string> = [];
  if (await exists(path)) {
    for (let entry of await readdir(path)) {
      const curPath = `${path}/${entry}`;
      if ((await lstat(curPath)).isDirectory()) list.push(...await listFiles(curPath));
      else list.push(curPath);
    }
  }
  return list;
}

export async function rmDirRecursive(path: string) {
  if (await exists(path)) {
    for (let entry of await readdir(path)) {
      const curPath = `${path}/${entry}`;
      if ((await lstat(curPath)).isDirectory()) await rmDirRecursive(curPath);
      else await unlink(curPath);
    }
    await rmdir(path);
  }
}

export async function copyFolder(from: string, to: string) {
  if (await exists(from)) {
    if (!await exists(to)) {
      await mkdir(to);
    }
    for (let entry of await readdir(from)) {
      const curPath = `${from}/${entry}`;
      const nextPath = `${to}/${entry}`;
      if ((await lstat(curPath)).isDirectory()) await copyFolder(curPath, nextPath);
      else await copyFile(curPath, nextPath);
    }
  }
}
