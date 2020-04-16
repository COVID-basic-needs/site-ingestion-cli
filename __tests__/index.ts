import convert from "../";

describe("convert-food-panty-data", () => {
  it("parses a flat file", async () => {
    const converted = await convert(
      `${__dirname}/../data/Arizona_Data_Flat.xlsx`
    );

    const firstRow = converted[0];

    expect(firstRow).toEqual({
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

    expect(converted[2].contactEmail).toEqual("srmoffice@srm-hc.org");
  });
});
