
const requiredFields = ['siteName', 'siteStreetAddress', 'siteZip'];

export default (data, fields) => {

    // filter out rows where too many listed fields are empty
    // and turn the array of arrays into an array of objects
    return data.filter(row => {
        return row.filter(row => {
            return fields.indexes.map((i: any) => row[i]);
        }).filter(Boolean).length > 2;
    }).map(row => {
        // keep only cells from matching mapped columns & give airtable field names
        let rowObject = Object.keys(fields.matched).reduce((out, field) => {
            // key: airtable field, value: spreadsheet cell value at row index
            let cell = row[fields.matched[field]];

            // wrangle cell into a string and trim whitespace
            if (cell && typeof cell !== 'undefined') {
                cell = cell.toString().replace(/^\s*/, "").replace(/\s*$/, "");
            }
            
            if (cell && cell.length > 0) {
                out[field] = cell;
            } 
            return out;
        }, {});

        // add hard-coded fields (i.e. siteCountry: 'USA')
        Object.keys(fields.unmatched).forEach(field => {
            rowObject[field] = fields.unmatched[field];
        });

        return rowObject;
    }).filter(rowObj => {
        // filter out rows that are missing required fields
        const hasRequiredFields = requiredFields.every(requiredField => rowObj.hasOwnProperty(requiredField));

        if (!hasRequiredFields) console.error("Row: " + JSON.stringify(rowObj), " missing required fields");
        return hasRequiredFields;
    });

};
