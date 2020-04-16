import getFieldMapForFile from "./fieldMaps/getFieldMapForFile";

// @todo write better definition
type FieldMap = {
  [key: string]: any;
};

export default (fileName) => {
  const fieldMap = getFieldMapForFile(fileName);

  const data = fieldMap.getData(fileName);

  return data.map((row) => {
    return Object.entries(fieldMap.map as FieldMap).reduce(
      (out, [field, map]) => {
        out[field] = typeof map === "function" ? map(row) : row[map];
        return out;
      },
      {}
    );
  });
};
