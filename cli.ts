const { promises: fs } = require("fs");
const { dir } = require("yargs").argv;

import convert from ".";

(async () => {
  if (!dir) {
    new Error("--dir required");
  }

  const files = await fs.readdir(dir);

  files.forEach(async (file) => {
    const json = await convert(`${dir}/${file}`);
    console.log(json);
    console.log(`Converted ${file} successfully`);
  });

  console.log("Done converting");
})();
