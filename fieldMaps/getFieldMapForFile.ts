import xlsx from "node-xlsx";
import fieldMaps from "./";
const parse = require('csv-parse/lib/sync');

export default (fileName) => {
  let sheets;

  switch (true) {
    case fileName.endsWith('.csv'):
      sheets = parse(fileName, {
        columns: false,
        skip_empty_lines: true
      });
      break;
    case fileName.endsWith('.xlsx'):
      sheets = xlsx.parse(fileName);
      break;
    default:
      break;
  }

  return fieldMaps.reduce((out, fieldMap) => {
    if (out) return out;

    if (fieldMap.sheetIsType(sheets)) {
      return fieldMap;
    }
  }, null);
};
