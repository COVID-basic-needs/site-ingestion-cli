import { getData } from "../three_sheet";

describe("convert-food-panty-data/fieldMaps/three_sheet/getData", () => {
    it("correctly merges Organization and Program", async () => {
        const data = await getData(
            `${__dirname}/../../testData/Colorado_Data_3_Sheet.xlsx`
        );

        // first sheet
        expect(data[0]["Organization.ID"]).toEqual("1");

        // second sheet 3rd row
        expect(data[2]["Program.County"]).toEqual("Weld");
    });
});
