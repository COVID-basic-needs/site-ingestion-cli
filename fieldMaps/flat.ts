import convertSheetToJSON from "../convertSheetToJSON";

export const map = {
  siteName: "Organization Name",
  siteStreetAddress: "Street Address",
  siteCity: "City",
  siteState: "State",
  siteZip: "Zip",
  contactPhone: "General Phone",
  contactEmail: "Organization Email",
  siteType: () => [],
  siteCountry: () => "USA",
  siteSubType: () => [],
  "Site Needs/Updates Forms": () => [],
  Claims: () => [],
  url: "Website",
  "Notes (possibly Pre-COVID)": (fields) =>
    `${fields["General Services Details"]}\n${fields["Notes"]}`,
};

export const TYPE = "flat";

export const sheetIsType = (sheets) => {
  return sheets.length === 1;
};

export const getData = (fileName) => {
  return convertSheetToJSON(fileName);
};

export const isValidRow = (row) => !!row["Organization Name"];
