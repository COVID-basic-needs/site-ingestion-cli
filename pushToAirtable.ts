/**
 * Pushes data to Airtable SITES table, then push associated details to SITE_DETAILS
 */

import { detailsTable, fromEmail, sitesTable } from "./airtableConfig";

const updateMethod : string  = "Upload V2: github.com/COVID-basic-needs/food-site-updates";

export default async function(siteList: any[]){
    const total = siteList.length;

    const originalSites: Map<string, string> = await fetchSiteTable();
    // filter out the site details corresponding to existing sites to be uploaded separately
    const dupedSiteDetails: any[] = [];
    const newSites: any[] = [];

    siteList.map(site => { 
        const siteID: string = getSiteID(site);
        if (originalSites.has(siteID)) {
            // on duplicate, add site details (with row id) to separate list
            const details = populateDetailsFields(site, originalSites.get(siteID), fromEmail, updateMethod);
            dupedSiteDetails.push(details);
        } else {
            newSites.push(site);
        }
    }); 

    // Airtable's create API only allows 10 at a time, so we batch.
    // (there is a rate limit, but their SDK has builtin retry logic so we should be safe)
    for (let i = 0; i < newSites.length; i += 10) {
        const tenSites = newSites.slice(i, i + 10 < total ? i + 10 : total);
        
        // create a list of 10 site objects to be pushed to the table
        const tenSiteLocations = tenSites.map(site => populateSiteFields(site, fromEmail, updateMethod));

        sitesTable.create(tenSiteLocations, { typecast: true }, async (err, records) => {
            if (err) {
                console.error(err);
                return;
            }
            
            // create a list of the 10 site details objects
            const tenSiteDetails = [];
            for (let i = 0; i < records.length; i++) {
                // create details field with corresponding site object and row id
                tenSiteDetails.push(populateDetailsFields(tenSites[i], records[i].getId(), fromEmail, updateMethod));
            };
            
            // push details objects to Airtable
            detailsTable.create(tenSiteDetails, { typecast: true }).catch(err => console.error(err));
        });
    };

    // push duped details
    for (let j = 0; j < dupedSiteDetails.length; j++){
        const tenDupedSiteDetails = dupedSiteDetails.slice(j, j + 10 < total ? j + 10 : total);
        detailsTable.create(tenDupedSiteDetails, { typecast: true }).catch(err => console.error(err));
    }

    console.log(`Pushed ${newSites.length} rows to Airtable ${sitesTable.name} table and ${dupedSiteDetails.length + newSites.length} rows to the ${detailsTable.name} table.`);
};

// fetches the siteIDs from the sites table with pagination
function fetchSiteTable(): Promise<Map<string, string>> {
    // map of siteID to ID
    const sites: Map<string, string> = new Map();

    return new Promise(function (resolve, reject) {
        // this is inefficient, but the rate limiting makes checking for individual/batch conflicts unfeasible
        sitesTable.select({
            fields: ["siteID"],
            maxRecords: 100,
        }).eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.
            records.forEach(function (record) {
                sites.set(record.get("siteID"), record.getId());
            });

            fetchNextPage();
        }, function done(err) {
            if (err) {
                console.error(err);
                reject(err);
            }

            resolve(sites);
        });
    });
}

// same formula as the one in AirTable to generate the "unique" site identifier
function getSiteID(site: any) {
    const joined: string = `${site.siteName} - ${site.siteStreetAddress}, ${site.siteCity} ${site.siteState} ${site.siteZip + ""}`;
    return joined.replace('\n', ' ');
}

function populateSiteFields(site: any, fromEmail: string, updateMethod: string) {
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
}

function populateDetailsFields(site: any, id: string, fromEmail: string, updateMethod: string) {
    return {
        fields: {
            Site: [id],
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
    };
}