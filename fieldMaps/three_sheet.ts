import convertSheetToJSON from "../convertSheetToJSON";

export const map = {
  test: "a",
};

export const TYPE = "three_sheet";

export const sheetIsType = (sheets) => {
  return sheets.length === 3;
};

export const getData = (fileName) => {
  const sheets = convertSheetToJSON(fileName);

  const firstSheet = sheets.Organization;

  // go through first sheet (organization)
  // label all keys as Program.key
  return firstSheet.map((row) => {
    // join with Program on key "ID" = "Organization ID *"
    const programRow = sheets.Program.find(
      (programRow) => programRow["Organization ID*"] === row.ID
    );

    const orgRowMapped = Object.entries(row).reduce((out, [key, value]) => {
      // relabel all keys as Organization.key
      out[`Organization.${key}`] = value;

      return out;
    }, {});

    if (!programRow) return orgRowMapped;

    // relabel all Program keys as Program.key
    const programRowMapped = Object.entries(programRow).reduce(
      (out, [key, value]) => {
        // relabel all keys as Organization.key
        out[`Program.${key}`] = value;
        return out;
      },
      {}
    );

    return { ...orgRowMapped, ...programRowMapped };
  }, []);
};
