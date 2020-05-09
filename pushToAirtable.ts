import { detailsTable, fromEmail, sitesTable } from "./airtableConfig";

const updateMethod = "Upload V2: github.com/COVID-basic-needs/food-site-updates";

export default (siteList: any[]) => {
    const total = siteList.length;

    // Airtable's create API only allows 10 at a time, so we batch.
    // (there is a rate limit, but their SDK has builtin retry logic so we should be safe)
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
                    siteZip: site.siteZip ? site.siteZip + "" : null,
                    siteCountry: site.siteCountry,
                    siteCounty: site.siteCounty,
                    siteNeighborhood: site.siteNeighborhood,
                    siteType: site.siteType,
                    siteSubType: site.siteSubType,
                    lat: site.lat,
                    lng: site.lng,
                    createdMethod: updateMethod
                }
            };
        });

        sitesTable.create(tenSiteLocations, { typecast: true }, async (err, records) => {
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
                        contactPhone: site.contactPhone ? site.contactPhone + "" : null,
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
                        publicPhone: site.publicPhone ? site.publicPhone + "" : null,
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
                        notesAnythingElse: site.notesAnythingElse ? site.notesAnythingElse + "" : null,
                        createdMethod: updateMethod
                    }
                });
            };
            await detailsTable.create(tenSiteDetails, { typecast: true }).catch(err => console.error(err));
        });
    };

    console.log(`Pushed ${total} rows to Airtable ${sitesTable.name} table and ${detailsTable.name} table`);

};
