import { parse } from 'yaml';
import check from './utils/checks';
import parseFieldMap from './utils/parseFieldMap';
import parseFile from './utils/parseFile';
import rowsToObjects from './utils/rowsToObjects';
const { promises: fs } = require('fs');

export default async (yamlFilePath) => {

    const fieldMap = parse(await fs.readFile(yamlFilePath, 'utf8'));

    check(fieldMap);

    // map = fieldMap.fields with nulls cleared
    const map = {};
    for (const [key, value] of Object.entries(fieldMap.fields)) {
        if (value) map[key] = value;
    }

    return fieldMap.files.reduce((out, file) => {

        let data = parseFile(file);

        const columns = data.shift();

        // map matched fields to their column index while separating unmatched fields
        // fields.matched[airtable field] = index of corresponding spreadsheet column
        // fields.indexes = list of indexes of necessary spreadsheet columns
        // fields.unmatched[airtable field] = value to hard-code
        // fields.total = max number of fields per object
        const fields = parseFieldMap(map, columns);

        // filter out rows where too many listed fields are empty
        // and turn the array of arrays into an array of objects
        data = rowsToObjects(data, fields);

        console.log(`Converted ${data.length} rows into objects with ${fields.total} fields (max) from ${file}`);

        return [...out, ...data];

    }, []);

};
