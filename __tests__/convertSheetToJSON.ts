import convertSheetToJSON from "../convertSheetToJSON";

describe("convert-food-panty-data/convertSheetToJSON", () => {
  it("converts a flat file", async () => {
    const converted = convertSheetToJSON(
      `${__dirname}/../data/Arizona_Data_Flat.xlsx`
    );

    // integer
    expect(converted[0].ID).toEqual("1");
    // undefined
    expect(converted[0].County).toEqual("");

    // with spaces
    expect(converted[0]["Street Address"]).toEqual("2561 W Ruthrauff Rd");

    // 4th row
    expect(converted[3].ID).toEqual("4");
  });

  it("converts a multi sheet file", async () => {
    const converted = convertSheetToJSON(
      `${__dirname}/../data/Colorado_Data_3_Sheet.xlsx`
    );

    // first sheet
    expect(converted.Organization[0].ID).toEqual("1");

    // second sheet 3rd row
    expect(converted.Program[2].County).toEqual("Weld");
  });
});
