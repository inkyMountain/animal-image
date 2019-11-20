import * as fs from "fs";

const readDir = (path: string) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      error && reject(error);
      resolve(files as string[]);
    });
  });
};

export { readDir };
