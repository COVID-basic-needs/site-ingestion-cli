import xlsx from "node-xlsx";

import flatMap from "./fieldMaps/flat";

const convertToJson = (data) => {
  const headers = data.shift();

  return data.map((row) => {
    return headers.reduce((out, header, i) => {
      const val = row[i];
      out[header] = val ? "" + val : "";
      return out;
    }, {});
  });
};

// @todo write better definition
type FieldMap = {
  [key: string]: any;
};

export default async (fileName) => {
  const sheet = xlsx.parse(fileName);
  const firstSheet = sheet[0].data;

  const data = convertToJson(firstSheet);

  return data.map((row) => {
    return Object.entries(flatMap as FieldMap).reduce((out, [field, map]) => {
      out[field] = typeof map === "function" ? map(row) : row[map];
      return out;
    }, {});
  });
};
