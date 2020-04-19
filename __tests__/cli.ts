const ncp = require("ncp").ncp;
const rimraf = require("rimraf");

import testCLI, { ITestCLIReturn } from "@node-cli-toolkit/test-cli";

const TEST_DATA = `${__dirname}/../testData`;
const CONVERT_FOLDER = `${__dirname}/../convertDataTest`;

describe("convert-food-panty-data/cli", () => {
  jest.setTimeout(20000);
  beforeEach((done) => {
    ncp(TEST_DATA, CONVERT_FOLDER, done);
  });

  afterEach((done) => {
    rimraf(CONVERT_FOLDER, done);
  });

  it("converts a directory of xlsx files", async () => {
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
  });
});
