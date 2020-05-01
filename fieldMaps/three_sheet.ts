import convertSheetToJSON from "../convertSheetToJSON";

export const map = {
    siteName: "Organization.Organization Name*",
    siteStreetAddress: "Organization.Street Address*",
    siteCity: "Organization.City*",
    siteState: "Organization.State",
    siteZip: "Organization.Zip*",
    contactPhone: "Organization.General Phone*",
    contactEmail: "Organization.Organization Email",
    siteType: () => [],
    siteCountry: () => "USA",
    siteSubType: () => [],
    "Site Needs/Updates Forms": () => [],
    Claims: () => [],
    url: "Organization.Website",
    "Notes (possibly Pre-COVID)": "Organization.Notes",
};

export const TYPE = "three_sheet";

export const sheetIsType = (sheets) => {
    return (
        sheets[0].name === "Organization" &&
        (sheets[1].name === "Program" || sheets[1].name === "Service")
    );
};

export const getData = (fileName) => {
    const sheets = convertSheetToJSON(fileName);

    const firstSheet = sheets.Organization;

    // go through first sheet (organization)
    // label all keys as Program.key
    return firstSheet.map((row) => {
        const secondSheet = sheets.Program || sheets.Service;
        // join with Program on key "ID" = "Organization ID *"
        const programRow = secondSheet.find((programRow) => {
            return (
                programRow["Organization ID*"] === row.ID ||
                programRow["Organization Name*"] === row["Organization Name*"]
            );
        });

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

export const isValidRow = (row) => !!row["Organization.Organization Name*"];
