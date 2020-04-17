require('dotenv').config()
const ncp = require("ncp").ncp;
const rimraf = require("rimraf");
const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

// TODO:
// - expand preexisting test to pushToAirtable('../data/Arizona_Data_Flat.xlsx') to TEST_SITE_TABLE
// - ensure the data made it to TEST_SITE_TABLE by:
//     1) counting entries
//     2) comparing values of 1st row
//     3) searching for a field with a value that was blank in the first row <-- what does this do?
//        (just the simple 'email' check you did already)
//   (at this point the test should fail as there is no pushToAirtable function)
// - push the same first half of temp data to ensure duplicates are found & pushed to TEST_SITE_DUPLICATES
//   (duplicates are identified by matching siteName and siteStreetAddress)
// - ensure the data made it to TEST_SITE_DUPLICATES by:
//     1) counting entries on TEST_SITE_TABLE seeing that they didn't get added to
//     2) counting entries on TEST_SITE_DUPLICATES seeing that they all got added there
//     3) comparing values of 1st row
// - ensure the second half of the test data can be pushed without issue & without duplicates
// - erase all the test data in airtable

import testCLI, { ITestCLIReturn } from "@node-cli-toolkit/test-cli";

const TEST_DATA = `${__dirname}/../data`;
const CONVERT_FOLDER = `${__dirname}/../convertDataTest`;

describe("convert-food-panty-data/airtable", () => {
  beforeEach((done) => {
    ncp(TEST_DATA, CONVERT_FOLDER, done);
  });

  afterEach((done) => {
    rimraf(CONVERT_FOLDER, done);
  });

  it("converts a directory of xlsx files & pushes half to Airtable", async () => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `yarn start --dir ${CONVERT_FOLDER}`,
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    expect(output).toBeCalledWith(
      expect.stringContaining("Converted Arizona_Data_Flat.xlsx successfully")
    );

    expect(output).toBeCalledWith(
      expect.stringContaining(
        "Converted Colorado_Data_3_Sheet.xlsx successfully"
      )
    );

    expect(output).toBeCalledWith(expect.stringContaining("Done converting"));

    expect(pushToAirtable())
  });
});
