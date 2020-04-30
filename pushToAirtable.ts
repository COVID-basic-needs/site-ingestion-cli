const util = require('util');
import { sitesTable, detailsTable, fromEmail } from "./airtableConfig";

const createDetails = util.promisify(detailsTable.create);

export default async (siteList: any[]) => {
  const total = siteList.length;
  let promises = [];
  // Airtable's create API only allows 10 at a time, so we batch.
  // (there is a rate limit, but this Javascript SDK has builtin retry logic so we should be safe)
  for (let i = 0; i < total; i += 10) {
    // The API expects a 'fields:' key listing each entry's attributes.
    const tenSites = siteList.slice(i, i + 10 < total ? i + 10 : total);

    const tenSiteLocations = tenSites.map(site => {
      return {
        fields: {
          uploadedBy: { email: fromEmail },
          siteName: site.siteName,
          EFROID: site.EFROID,
          siteStreetAddress: site.siteStreetAddress,
          siteCity: site.siteCity,
          siteState: site.siteState,
          siteZip: site.siteZip,
          siteCountry: site.siteCountry,
          siteCounty: site.siteCounty,
          siteNeighborhood: site.siteNeighborhood,
          siteType: site.siteType,
          siteSubType: site.siteSubType,
          lat: site.lat,
          lng: site.lng,
          createdMethod: "https://github.com/COVID-basic-needs/convert-food-pantry-data"
        }
      };
    });

    promises.push(sitesTable.create(tenSiteLocations, { typecast: true }, (err, records) => {
      if (err) {
        console.error(err);
        return;
      }
      const tenSiteDetails = [];
      for (let i = 0; i < records.length; i++) {
        const site = tenSites[i];
        tenSiteDetails.push({
          fields: {
            Site: [records[i].getId()],
            uploadedBy: { email: fromEmail },
            status: site.status,
            contactName: site.contactName,
            contactPhone: site.contactPhone,
            contactEmail: site.contactEmail,
            publicOpenness: site.publicOpenness,
            deliveryEligibility: site.deliveryEligibility,
            eligibilityRequirements: site.eligibilityRequirements,
            hoursEligibility1: site.hoursEligibility1,
            hours1: site.hours1,
            hoursEligibility2: site.hoursEligibility2,
            hours2: site.hours2,
            hoursEligibility3: site.hoursEligibility3,
            hours3: site.hours3,
            validUntil: site.validUntil,
            acceptsFoodDonations: site.acceptsFoodDonations,
            hasEnoughFood: site.hasEnoughFood,
            canReceiveBulk: site.canReceiveBulk,
            foodNeeds: site.foodNeeds,
            hasBabyFormula: site.hasBabyFormula,
            staffVolunteerNeeds: site.staffVolunteerNeeds,
            recruitingAssistance: site.recruitingAssistance,
            otherNeeds: site.otherNeeds,
            publicContactMethod: site.publicContactMethod,
            publicPhone: site.publicPhone,
            publicEmail: site.publicEmail,
            website: site.website,
            socialMedia: site.socialMedia,
            covidChanges: site.covidChanges,
            increasedDemandCauses: site.increasedDemandCauses,
            totalFoodCommunityNeeds: site.totalFoodCommunityNeeds,
            currentCapacity: site.currentCapacity,
            staffVolunteerReduction: site.staffVolunteerReduction,
            safetyPrecautions: site.safetyPrecautions,
            languages: site.languages,
            nearbyFoodPrograms: site.nearbyFoodPrograms,
            notesGovRequests: site.notesGovRequests,
            notesAnythingElse: site.notesAnythingElse,
            createdMethod: "https://github.com/COVID-basic-needs/convert-food-pantry-data"
          }
        });
      };

      createDetails(tenSiteDetails, { typecast: true });
    }));
  };
  await Promise.all(promises);
  return total;
};
