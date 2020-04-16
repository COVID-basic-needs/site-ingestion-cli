import xlsx from "node-xlsx";
import fieldMaps from "./fieldMaps";

export default (fileName) => {
  const sheets = xlsx.parse(fileName);

  return fieldMaps.reduce((out, { sheetIsType, TYPE }) => {
    if (out) return out;

    if (sheetIsType(sheets)) {
      return TYPE;
    }
  }, null);
};
