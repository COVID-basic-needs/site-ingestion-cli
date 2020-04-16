import xlsx from "node-xlsx";
import fieldMaps from "./";

export default (fileName) => {
  const sheets = xlsx.parse(fileName);

  return fieldMaps.reduce((out, fieldMap) => {
    if (out) return out;

    if (fieldMap.sheetIsType(sheets)) {
      return fieldMap;
    }
  }, null);
};
