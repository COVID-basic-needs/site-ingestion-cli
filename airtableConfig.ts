/**
 * Reads Airtable configs from environment vars and creates an Airtable connection
 */

require('dotenv').config();
const Airtable = require('airtable');
const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

const sitesTable = base(process.env.NODE_ENV === 'test' ? 'TEST_SITES_TABLE' : process.env.AIRTABLE_SITES_TABLE);

const detailsTable = base(process.env.NODE_ENV === 'test' ? 'TEST_SITE_DETAILS' : process.env.AIRTABLE_SITE_DETAILS);

const fromEmail = process.env.FROM_EMAIL;

export { sitesTable, detailsTable, fromEmail };
