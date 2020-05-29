/**
 * Validates fieldMap file and throws if invalid.
 */

export default (fieldMap) => {
    if (!fieldMap.files.length) {
        throw new Error("'files:' must list at least 1 file");
    }

    ['siteName', 'siteStreetAddress', 'siteCity', 'siteCountry']
        .forEach(required => {
            if (!fieldMap.fields[required]) {
                throw new Error(`missing ${required} (required)`);
            }
        });

    if (!fieldMap.fields.siteState && !fieldMap.fields.siteZip) {
        throw new Error('must include either siteState or siteZip');
    }

    fieldMap.files.forEach(file => {
        if (!(file.endsWith('.xlsx') || file.endsWith('.csv'))) {
            throw new Error("'files:' listed must be .xlsx or .csv (for now)");
        }
    });
};
