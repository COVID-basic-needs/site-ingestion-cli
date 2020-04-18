require('dotenv').config();
const ncp = require("ncp").ncp;
const rimraf = require("rimraf");
const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

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
  jest.setTimeout(20000);
  beforeEach((done) => {
    ncp(TEST_DATA, CONVERT_FOLDER, done);
  });

  afterEach((done) => {
    rimraf(CONVERT_FOLDER, done);
  });

  it("converts a directory of xlsx files & pushes half to Airtable", async (done) => {
    const { code, error, output }: ITestCLIReturn = await testCLI({
      bashCommand: `yarn start --dir ${CONVERT_FOLDER}`,
    });

    expect(error.mock.calls.length).toBe(0);

    expect(code).toBe(0);

    let recordCount = 0;

    const records = base(process.env.AIRTABLE_SITE_TABLE).select({
      maxRecords: 100,
      view: "All"
    }).eachPage(function page(records, fetchNextPage) {
      recordCount += records.length;
      fetchNextPage();
    }, function (err) {
      expect(err).toBeFalsy();
      expect(recordCount).toEqual(38);
      done();
    });

    expect(records[0]).toEqual({
      siteName: "Victory Worship Center —\nBethlehem House Pantry* ",
      siteStreetAddress: "2561 W Ruthrauff Rd",
      siteCity: "Tucson",
      siteState: "AZ",
      siteZip: "85705",
      contactPhone: "520-293-6386",
      contactEmail: "",
      siteType: [],
      siteCountry: "USA",
      siteSubType: [],
      "Site Needs/Updates Forms": [],
      Claims: [],
      url: "www.vwcaz.org",
      "Notes (possibly Pre-COVID)":
        "Food service -— Sat 6-7:30 AM\n\nLocated in the Fellowship Hall (building)\nof the Ruthrauff Campus.\nLanguages: English, Spanish",
    });

    expect(records[2].contactEmail).toEqual("srmoffice@srm-hc.org");
  });
});
