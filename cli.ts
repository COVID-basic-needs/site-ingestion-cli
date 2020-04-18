const { promises: fs } = require("fs");
const { dir } = require("yargs").argv;

import convert from ".";
import pushToAirtable from "./pushToAirtable";

(async () => {
  if (!dir) {
    new Error("--dir required");
  }

  const files = await fs.readdir(dir);
  const allData = [];

  for (const i in files) {
    const file = files[i];
    const json = await convert(`${dir}/${file}`);
    json.forEach(site => { allData.push(site); });
    console.log(`Converted ${file} successfully (${json.length} rows)`);
  }

  console.log("Done converting, beginning push to Airtable...");

  const numPushed = await pushToAirtable(allData);

  console.log(`Pushed ${numPushed} rows to Airtable table ${process.env.AIRTABLE_SITE_TABLE}`);
})();
