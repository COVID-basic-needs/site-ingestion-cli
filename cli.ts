/**
 * Program entry point. Takes a .yaml file or directory of .yaml files as a command line argument.
 */

import convert from './convert';
const validate = require('./site-ingestion-schema/validator');
const got = require('got');
const { promises: fs } = require('fs');

const missingFieldMap = 'Please specify an existing .yaml fieldMap file, or a directory of them';

(async () => {

    let data = [];
    const path = process.argv[2];
    const email = process.argv[3];
    const password = process.argv[4];
    const pathType = await fs.stat(path);

    if (!email) {
        console.error(`You must include your email. format:

    yarn start <yamlFieldMapPath> <email> <password>

If password is blank, will push to TEST Airtable base instead of Main.`);
        return false;
    }

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

    // check if sites conform to schema
    let [isValid, errorMsg] = validate(data);
    if (!isValid) {
        console.error(errorMsg);
        return;
    }

    console.log(`Done converting, beginning push of ${data.length} records to site ingestion API... (lets see if your password worked ;P)`);

    // push to site-ingestion-api in batches of 100
    for (var i = 0; i < data.length; i += 100) {
        var endIndex = Math.min(i + 100, data.length);
        var subArr = data.slice(i, endIndex);
        await uploadToLambda(subArr, email, password);
    }
})();


async function uploadToLambda(data, email, password) {
    try {
        const { body } = await got.post('https://i3tmnkgp2i.execute-api.us-west-2.amazonaws.com/upload-site', {
            json: { data, email, password },
            responseType: 'json',
        });
        console.log(body);
        return true;
    }
    catch (error) {
        console.error("Server returned: " + error.response.statusCode + "\n" + JSON.stringify(error.response.body));
        return false;
    }
}
