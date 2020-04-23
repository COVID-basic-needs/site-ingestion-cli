import convertSheetToJSON from "../convertSheetToJSON";

export const map = {
    ERFOID: "id",
    siteName: "Name",
    siteStreetAddress: "Address",
    siteCity: () => {return "New York City";},
    siteState: () => {return "NY";},
    siteZip: "Zipcode",
    contactPhone: "Phone",
    contactEmail: () => {return "";},
    siteType: () => "Food Pantry",
    siteCountry: () => "USA",
    //  siteSubType: () => "Food Pantry",
    //  "Site Needs/Updates Forms": () => [],
    //  Claims: () => [],
    url: "Website",
    /*
       // extra info that would go into a tooltip on the map
       "Notes (possibly Pre-COVID)": (fields) =>
       `${fields["General Services Details"]}\n${fields["Notes"]}`,
     */
    lat: "lat",
    lng: "lng"
};

export const TYPE = "FPC";

export const sheetIsType = (sheets) => {
  return sheets.length === 1;
};

export const getData = (fileName) => {
  return convertSheetToJSON(fileName);
};

export const isValidRow = (row) => !!row["id"];
