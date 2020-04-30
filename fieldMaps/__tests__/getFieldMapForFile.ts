import getFieldMapForFile from "../../utils/getFieldMapForFile";

describe("convert-food-panty-data/fieldMaps/getFieldMapForFile", () => {
  it("identifies a flat file", async () => {
    const map = await getFieldMapForFile(
      `${__dirname}/../../testData/Arizona_Data_Flat.xlsx`
    );

    expect(map.TYPE).toEqual("flat");
  });

  it("identifies a three sheet file", async () => {
    const map = await getFieldMapForFile(
      `${__dirname}/../../testData/Colorado_Data_3_Sheet.xlsx`
    );

    expect(map.TYPE).toEqual("three_sheet");
  });
});
