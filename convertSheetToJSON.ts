import xlsx from "node-xlsx";

const convertSheetToJson = (data): SingleSheet => {
    const headers = data.shift();

    return data.map((row) => {
        return headers.reduce((out, header, i) => {
            const val = row[i];
            out[header] = val ? "" + val : "";
            return out;
        }, {});
    });
};

type Row = {
    // column name
    [key: string]: any;
};

type SingleSheet = Row[];

type MultiSheet = {
    // sheet name
    [key: string]: SingleSheet;
};

// @todo fix
type SheetsData = any;

export default (fileName): SheetsData => {
    const sheets = xlsx.parse(fileName);

    // flat file
    if (sheets.length === 1) {
        return convertSheetToJson(sheets[0].data);
    } else {
        return sheets.reduce((out, { data, name }) => {
            // key is sheet name, value is the array of data in the sheet
            out[name] = convertSheetToJson(data);
            return out;
        }, {});
    }
};
