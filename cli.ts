import xlsx from "node-xlsx";
import { parse } from 'yaml';
import pushToAirtable from './pushToAirtable';
const { promises: fs } = require('fs');
const parseCSV = require('csv-parse/lib/sync');

const missingFieldMap = 'Please specify an existing .yaml fieldMap file, or a directory of them';
const wrongFileType = 'Files listed in fieldMap.yaml must be .xlsx or .csv (for now)';

type Fields = {
    [key: string]: any;
};

(async () => {
    try {
        let allData;
        let data;
        const map: { [key: string]: unknown; values?: any; } = {};
        const path = process.argv[2];
        const pathType = await fs.stat(path);

        if (pathType.isFile() && (path.endsWith('.yaml') || path.endsWith('.yml'))) {
            console.log(`Parsing file '${path}'...`);

            const fieldMap = await parse(await fs.readFile(path, 'utf8'));

            /*  TODO break checks into separate file */
            // BEGIN CHECKS...
            if (fieldMap.files.length === 0) throw new Error('fieldMap.yaml must reference at least 1 file');

            ['siteName', 'siteStreetAddress', 'siteCity', 'siteCountry'].forEach(required => {
                if (!fieldMap.fields[required]) throw new Error(`missing ${required}`);
            });
            if (!fieldMap.fields.siteState && !fieldMap.fields.siteZip) throw new Error('must include siteState or siteZip');

            // clear nulls from fieldMap.fields
            for (const [key, value] of Object.entries(fieldMap.fields)) {
                if (value) map[key] = value;
            }

            fieldMap.files.forEach(file => {
                if (!(file.endsWith('.xlsx') || file.endsWith('.csv'))) throw new Error(wrongFileType);
            });
            // ...CHECKS COMPLETE

            /*  TODO break to separate file */
            allData = fieldMap.files.map(async file => {

                if (file.endsWith('.csv')) {
                    data = await parseCSV(file, {
                        columns: false,
                        skip_empty_lines: true
                    });
                } else {
                    let sheets = await xlsx.parse(file);
                    if (sheets.length > 1) throw new Error(`${file} has multiple sheets, can't parse yet.
    TODO parse fieldMaps which describe .xlsx files w/ multiple sheets`);
                    data = sheets[0].data;
                }

                let columns = data.shift();

                /* TODO break to separate file */

                // map matched fields to their column index while separating unmatched fields
                // fields.matched[airtable field] = index of corresponding spreadsheet column
                // fields.indexes = list of indexes of necessary spreadsheet columns
                // fields.unmatched[airtable field] = value to hard code
                // CHEATCODE = a fieldmap value which forces a required field to be blank
                const fields = await Object.keys(map).reduce((out: Fields, field) => {
                    const value = map[field];
                    if (value === 'CHEATCODE') return out;
                    const i = columns.findIndex(header => header === value);
                    if (i > -1) {
                        out.matched[field] = i;
                        out.indexes.push(i);
                    } else if (['siteName', 'siteStreetAddress', 'siteZip'].includes(field)) {
                        throw new Error(`can't hard-code ${field}`);
                    } else {
                        out.unmatched[field] = value;
                    }
                    out.total += 1;
                    return out;
                }, { matched: {}, indexes: [], unmatched: {}, total: 0 });

                // filter out rows where too many listed fields are empty
                // and turn the array of arrays into an array of objects
                data = await data.filter(row => {
                    return row.filter(row => {
                        return fields.indexes.map((i: any) => row[i]);
                    }).filter(Boolean).length > 2;
                }).map(row => {
                    // keep only cells from matching mapped columns & give airtable field names
                    let rowObject = Object.keys(fields.matched).reduce((out, field) => {
                        // key: airtable field, value: spreadsheet cell value at row index
                        const cell = row[fields.matched[field]];
                        if (cell) out[field] = cell;
                        return out;
                    }, {});
                    // add hard-coded fields (i.e. siteCountry: 'USA')
                    Object.keys(fields.unmatched).forEach(field => {
                        rowObject[field] = fields.unmatched[field];
                    });
                    return rowObject;
                });
                console.log('fields.unmatched = ', fields.unmatched);
                const temp = data.length - 1;
                console.log(`data[${temp}] = `, data[temp]);
                console.log(`Converted ${data.length} rows into objects with ${fields.total} fields (max) from ${file}`);

                throw new Error('testing, ending here on purpose');

                return data;
            });

        } else if (pathType.isDirectory()) {
            console.log(`Parsing directory '${path}'...`);
            const dirContents = await fs.readdir(path)
                .filter((file: string) => (file.endsWith('.yml') || file.endsWith('.yaml')));

            if (!dirContents.length) throw new Error(missingFieldMap);

            for (const file in dirContents) {
                const filePath = `${path}/${dirContents[file]}`;

                /* TODO same as above */

                // data = await convert(filePath);
                allData.push(data);

                console.log(`Converted ${data.length} rows from ${filePath}`);
            }
        } else {
            throw new Error(missingFieldMap);
        }

        console.log('Done converting, beginning push to Airtable...');

        const numPushed = await pushToAirtable(allData);

        console.log(`Pushed ${numPushed} rows to Airtable table ${process.env.AIRTABLE_SITE_TABLE}`);
    } catch (err) { console.error(err); }
})();
