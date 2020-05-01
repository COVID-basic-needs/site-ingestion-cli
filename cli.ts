import xlsx from "node-xlsx";
import { parse } from 'yaml';
import pushToAirtable from './pushToAirtable';
const { promises: fs } = require('fs');
const parseCSV = require('csv-parse/lib/sync');

const missingFieldMap = 'Please specify an existing .yaml fieldMap file, or a directory of them';
const wrongFileType = 'Files listed in fieldMap.yaml must be .xlsx or .csv (for now)';

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
                    data = parseCSV(file, {
                        columns: false,
                        skip_empty_lines: true
                    });
                } else {
                    let sheets = xlsx.parse(file);
                    if (sheets.length > 1) throw new Error(`${file} has multiple sheets, can't parse yet.
    TODO parse fieldMaps which describe .xlsx files w/ multiple sheets`);
                    data = sheets[0].data;
                }

                let columnHeaders = data.shift();
                console.log('map =', map);
                console.log('columnHeaders =', columnHeaders);

                /* TODO break to separate file */
                // separate mapped values which don't correspond to column headers
                //   (for later hard-coding the values as fields)
                // simultaneously, map the matched fields to their column index
                //   (for skipping over columns to be excluded from the file)
                const matchedFields = {}; // k: airtable field, v: index of corresponding spreadsheet column
                const unmatchedFields = []; // airtable fields to hard-code
                const numColumns = columnHeaders.length;
                Object.keys(map).forEach(mapKey => {
                    let i = 0;
                    while (i < numColumns) {
                        const header = columnHeaders[i];
                        if (header === map[mapKey]) {
                            matchedFields[mapKey] = i;
                            break;
                        }
                        i++;
                    }
                    if (i === numColumns) unmatchedFields.push(map[mapKey]);
                });

                // turn the array of arrays into an array of objects
                data = data.map(row => {
                    // keep only cells from mapped columns & give new field names
                    let object = Object.keys(matchedFields).reduce((out, field) => {
                        // keys: airtable fields, values: spreadsheet index
                        out[field] = row[matchedFields[field]];
                        return out;
                    }, {});
                    // TODO test this

                    // let object = columnHeaders.reduce((out, header, i) => {
                    //     if (Object.keys(matchedFields).includes(header)) {
                    //         out[Object.keys(map).find(key => map[key] === header)] = row[i];
                    //     }
                    //     return out;
                    // }, {});

                    // TODO add hard-coded fields (i.e. siteCountry: 'USA')

                    return object;
                });

                console.log(`Converted ${data.length} rows from ${file}`);

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
