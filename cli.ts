import { parse } from 'yaml';
import convert from '.';
import pushToAirtable from './pushToAirtable';
const { promises: fs } = require('fs');

const missingFieldMap = 'Please specify an existing .yaml fieldMap file, or a directory of them';
const wrongFileType = 'Files listed in fieldMap.yaml must be .xlsx or .csv (for now)';

(async () => {
    try {
        let allData: any[][];
        let data = [];
        const path = process.argv[2];
        const pathType = await fs.stat(path);

        if (pathType.isFile() && (path.endsWith('.yaml') || path.endsWith('.yml'))) {
            console.log(`Parsing file '${path}'...`);

            const fieldMap = await parse(await fs.readFile(path, 'utf8'));

            // BEGIN CHECKS...
            if (fieldMap.files.length === 0) throw new Error('fieldMap.yaml must reference at least 1 file');

            ['siteName', 'siteStreetAddress', 'siteCity', 'siteCountry'].forEach(required => {
                if (!fieldMap.fields[required]) throw new Error(`missing ${required}`);
            });
            if (!fieldMap.fields.siteState && !fieldMap.fields.siteZip) throw new Error('must include siteState or siteZip');

            fieldMap.files.forEach(file => {
                if (!(file.endsWith('.xlsx') || file.endsWith('.csv'))) throw new Error(wrongFileType);
            });
            // ...CHECKS COMPLETE

            // TODO modify convert(file) to also take the fieldMap specified in the yaml

            allData = fieldMap.files.map(file => {

                data = convert(file);
                console.log(`Converted ${data.length} rows from ${file}`);
                return data;
            });


        } else if (pathType.isDirectory()) {
            console.log(`Parsing directory '${path}'...`);
            const dirContents = await fs.readdir(path)
                .filter((file: string) => (file.endsWith('.yml') || file.endsWith('.yaml')));

            if (!dirContents.length) throw new Error(missingFieldMap);

            for (const file in dirContents) {
                const filePath = `${path}/${dirContents[file]}`;

                // same todo as above

                data = await convert(filePath);
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
