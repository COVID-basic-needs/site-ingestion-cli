const util = require('util');
const table = require("./airtableConfig").default();

export default async (siteList) => {
  const total = siteList.length;
  let promises = [];
  // Airtable's create API only allows 10 at a time, so we batch.
  // (there is a rate limit, but this Javascript SDK has builtin retry logic so we should be safe)
  for (let i = 0; i < total; i += 10) {
    // The API expects a 'fields:' key listing each entries' attributes.
    const tenSites = siteList.slice(i, i + 10 < total ? i + 10 : total).map(site => {
      return { "fields": site };
    });

    const create = util.promisify(table.create);
    promises.push(create(tenSites, { typecast: true }));
  };
  await Promise.all(promises);
  return total;
};
