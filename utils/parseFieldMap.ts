
type Fields = {
    [key: string]: any;
};

export default (map, columns) => {

    // map matched fields to their column index while separating unmatched fields
    // out.matched[airtable field] = index of corresponding spreadsheet column
    // out.indexes = list of indexes of necessary spreadsheet columns
    // out.unmatched[airtable field] = value to hard-code
    // out.total = max number of fields per object
    // CHEATCODE = a fieldmap value which forces a required field to be blank
    return Object.keys(map).reduce((out: Fields, field) => {

        const value = map[field];

        if (value === 'CHEATCODE')
            return out;

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

};
