/**
 * Parses data input file
 */

import xlsx from 'node-xlsx';
import parseCSV = require('csv-parse/lib/sync');

export default (file) => {

    if (file.endsWith('.csv')) {
        return parseCSV(file, {
            columns: false,
            skip_empty_lines: true
        });
    } else {
        let sheets = xlsx.parse(file);
        if (sheets.length > 1) {
            throw new Error(`${file} has multiple sheets, can't parse yet.
    TODO parse fieldMaps which describe .xlsx files w/ multiple sheets`);
        }
        return sheets[0].data;
    }

};
