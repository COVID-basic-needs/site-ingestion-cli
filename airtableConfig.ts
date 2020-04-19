require('dotenv').config();
const Airtable = require('airtable');

export default () => {
    const base = new Airtable({
        apiKey: process.env.AIRTABLE_API_KEY
    }).base(process.env.AIRTABLE_BASE_ID);
    return base(process.env.NODE_ENV === 'test' ? 'TEST_SITE_TABLE' : process.env.AIRTABLE_SITE_TABLE);
};
