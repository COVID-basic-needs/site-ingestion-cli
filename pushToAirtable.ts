require('dotenv').config();
const Airtable = require('airtable');
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_SITE_TABLE);

export default (siteList) => {

  const total = siteList.length;

  // Airtable's create API only allows 10 at a time, so we batch.
  // (there is a rate limit, but this Javascript SDK has builtin retry logic so we should be safe)
  for (let i = 0; i < total; i += 10) {

    const tenSites = [];
    siteList.slice(i, i + 10 < total ? i + 10 : total).forEach(site => {
      // The API expects a 'fields:' key listing each entries' attributes.
      tenSites.push({ "fields": site });
    });

    table.create(tenSites, { typecast: true }, (err, records) => {
      if (err) {
        console.error(err);
        return;
      }
      return records.length;
    });
  };
  return total;
};
