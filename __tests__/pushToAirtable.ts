const fs = require("fs");
const rimraf = require("rimraf");
const util = require('util');
const table = require("../airtableConfig").default();

// TODO:
// [*] expand preexisting test to pushToAirtable('../testData/Arizona_Data_Flat.xlsx') to TEST_SITE_TABLE
// [*] ensure the data made it to TEST_SITE_TABLE by:
// [*]   1) counting entries
// [*]   2) comparing values of 1st row
// [] push the same first half of temp data to ensure duplicates are found & pushed to TEST_SITE_DUPLICATES
//   (duplicates are identified by matching siteName and siteStreetAddress)
// [] ensure the data made it to TEST_SITE_DUPLICATES by:
// []   1) counting entries on TEST_SITE_TABLE seeing that they didn't get added to
// []   2) counting entries on TEST_SITE_DUPLICATES seeing that they all got added there
// []   3) comparing values of 1st row
// [] ensure the second half of the test data can be pushed without issue & without duplicates
// [*] erase all the test data in airtable

import testCLI, { ITestCLIReturn } from "@node-cli-toolkit/test-cli";

const TEST_DATA_AZ = `${__dirname}/../testData/Arizona_Data_Flat.xlsx`;
const TEST_DATA_CO = `${__dirname}/../testData/Colorado_Data_3_Sheet.xlsx`;
const CONVERT_FOLDER = `${__dirname}/../convertDataTest`;

async function clearAirtable() {
  const records = await table.select().all();
  const ids = records.map(record => record.id);
  const total = ids.length;
  const destroy = util.promisify(table.destroy);
  let promises = [];
  // Airtable's destroy API only allows 10 at a time, so we batch.
  for (let i = 0; i < total; i += 10) {
    promises.push(destroy(ids.slice(i, i + 10 < total ? i + 10 : total)));
  }
  await Promise.all(promises);
}

describe("convert-food-panty-data/airtable", () => {
  jest.setTimeout(20000);
  beforeEach(async (done) => {
    await clearAirtable();
    fs.mkdirSync(CONVERT_FOLDER);
    fs.copyFileSync(TEST_DATA_AZ, `${CONVERT_FOLDER}/AZ`);
    fs.copyFileSync(TEST_DATA_CO, `${CONVERT_FOLDER}/CO`);
    done();
  });

  afterEach(async (done) => {
    await clearAirtable();
    rimraf(CONVERT_FOLDER, done);
  });

  it("converts a directory of xlsx files & pushes half to Airtable", async (done) => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `yarn start --dir ${CONVERT_FOLDER}`,
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    table.select().all((err, records) => {
      expect(err).toBeFalsy();

      expect(records.length).toEqual(122);

      // lookup phone number instead of siteName due to issue with newlines and m-dashes in names
      //  additionally records in airtable are randomly ordered and we want to test existance
      //  without using the random UUIDs airtable gives entries.
      const testRecord = records.find(record => record.fields.contactPhone === "520-293-6386");
      expect(testRecord.fields).toEqual(
        expect.objectContaining({
          siteName: "Victory Worship Center — Bethlehem House Pantry* ",
          siteStreetAddress: "2561 W Ruthrauff Rd",
          siteCity: "Tucson",
          siteState: "AZ",
          siteZip: "85705",
          contactPhone: "520-293-6386",
          siteCountry: "USA",
          url: "www.vwcaz.org",
          "Notes (possibly Pre-COVID)":
            "Food service -— Sat 6-7:30 AM\n\nLocated in the Fellowship Hall (building)\nof the Ruthrauff Campus.\nLanguages: English, Spanish",
        })
      );

      done();
    });
  });
});
