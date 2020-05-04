import convert from './convert';
import pushToAirtable from './pushToAirtable';
const { promises: fs } = require('fs');

const missingFieldMap = 'Please specify an existing .yaml fieldMap file, or a directory of them';

(async () => {

    let data = [];
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

        for await (const yamlFile of yamlFieldMaps) {
            for await (const object of await convert(`${path}/${yamlFile}`)) {
                data.push(object);
            }
        }

    } else {
        throw new Error(missingFieldMap);
    }

    console.log('Done converting, beginning push to Airtable...');

    await pushToAirtable(data);

})();
