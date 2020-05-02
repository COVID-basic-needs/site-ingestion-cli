import convert from './convert';
import pushToAirtable from './pushToAirtable';
const { promises: fs } = require('fs');

const missingFieldMap = 'Please specify an existing .yaml fieldMap file, or a directory of them';

(async () => {

    let data;
    const path = process.argv[2];
    const pathType = await fs.stat(path);

    if (pathType.isFile() && (path.endsWith('.yaml') || path.endsWith('.yml'))) {

        console.log(`Parsing file '${path}'...`);

        data = await convert(path);

    } else if (pathType.isDirectory()) {

        console.log(`Parsing directory '${path}'...`);

        const dirContents = await fs.readdir(path);
        const yamlFieldMaps = dirContents
            .filter((file: string) => (file.endsWith('.yml') || file.endsWith('.yaml')));

        if (!yamlFieldMaps.length) throw new Error(missingFieldMap);

        data = await yamlFieldMaps.reduce(async (out, yamlFile) => {
            return [...out, ...await convert(`${path}/${yamlFile}`)];
        }, []);

    } else {
        throw new Error(missingFieldMap);
    }

    console.log('Done converting, beginning push to Airtable...');

    const numPushed = await pushToAirtable(data);

    console.log(`Pushed ${numPushed} rows to Airtable table ${process.env.AIRTABLE_SITE_TABLE}`);

})();
