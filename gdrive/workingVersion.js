function parseGoogleMapsBusinessData(dataString) {
    try {
        // First, try to parse as JSON
        const data = JSON.parse(dataString);
        
        // Initialize result object
        const businessInfo = {
            name: null,
            address: null,
            websiteUrl: null,
            domain: null,
            rating: null,
            reviewCount: null,
            phone: null
        };
        
        // Extract business name (usually at index 4)
        if (data[4]) {
            businessInfo.name = data[4];
        }
        
        // Extract domain (usually at index 1)
        if (data[1]) {
            businessInfo.domain = data[1];
            businessInfo.websiteUrl = `https://${data[1]}`;
        }
        
        // Extract address (usually at index 14)
        if (data[14]) {
            businessInfo.address = data[14];
        }
        
        // Extract phone number - search through the data recursively
        function findPhoneInData(obj) {
            if (typeof obj === 'string') {
                const phoneMatch = obj.match(/\(\d{3}\)\s\d{3}-\d{4}/);
                if (phoneMatch) return phoneMatch[0];
            }
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    const result = findPhoneInData(item);
                    if (result) return result;
                }
            }
            return null;
        }
        
        businessInfo.phone = findPhoneInData(data);
        
        // Extract rating and review count - look for decimal numbers between 1-5 and nearby integers
        function findRatingAndReviews(obj, parentArray = null, index = -1) {
            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; i++) {
                    const item = obj[i];
                    // Look for rating (decimal between 1-5)
                    if (typeof item === 'number' && item >= 1 && item <= 5 && item % 1 !== 0) {
                        if (!businessInfo.rating) businessInfo.rating = item;
                        
                        // Look for review count nearby (integer > 5)
                        for (let j = Math.max(0, i-3); j <= Math.min(obj.length-1, i+3); j++) {
                            if (typeof obj[j] === 'number' && obj[j] > 5 && Number.isInteger(obj[j])) {
                                if (!businessInfo.reviewCount) businessInfo.reviewCount = obj[j];
                            }
                        }
                    }
                    findRatingAndReviews(item, obj, i);
                }
            }
        }
        
        findRatingAndReviews(data);
        
        return businessInfo;
        
    } catch (error) {
        // If JSON parsing fails, try regex extraction
        return extractWithRegex(dataString);
    }
}

function extractWithRegex(dataString) {
    const businessInfo = {
        name: null,
        address: null,
        websiteUrl: null,
        domain: null,
        rating: null,
        reviewCount: null,
        phone: null
    };
    
    // Extract business name
    const nameMatch = dataString.match(/"([^"]*\b(?:Authority|Restaurant|Store|Shop|Service|LLC|L\.L\.C\.|Limited Liability Company|Inc\.|Corp\.|Co\.|Ltd\.|PLLC|P\.C\.|PC|& Sons|& Associates|Group|Company)\b[^"]*)"/i);

    if (nameMatch) {
        businessInfo.name = nameMatch[1];
    }

  
    
    // Extract domain
    const domainMatch = dataString.match(/https?:\/\/(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);


    if (domainMatch) {
        businessInfo.domain = domainMatch[1];
        businessInfo.websiteUrl = `https://${domainMatch[1]}`;
    }
    
    // Extract address (look for address with street and zip)
   const addressMatch = dataString.match(/([A-Za-z0-9.,&'\-\s]+?,\s*\d{1,6}\s+[A-Za-z0-9\s.]+?\s(?:St|Ave|Rd|Ln|Dr|Blvd|Way|Ct|Pl|Cir|Pkwy|Terrace|Loop|Square|Trl|Ste|Suite)[^,]*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5})/);




    if (addressMatch) {
        businessInfo.address = addressMatch[1];
    }
    
    // Extract phone number
    const phoneMatch = dataString.match(/\((\d{3})\)\s(\d{3})-(\d{4})/);
    if (phoneMatch) {
        businessInfo.phone = phoneMatch[0];
    }
    
    // Extract rating (decimal between 1-5)
    const ratingMatch = dataString.match(/([1-4]\.\d)/);
    if (ratingMatch) {
        businessInfo.rating = parseFloat(ratingMatch[1]);
    }
    
    return businessInfo;
}


// This function safely accesses nested array values
function get(arr, ...indices) {
    let val = arr;
    for (let i of indices) {
        if (val && Array.isArray(val) && val[i] !== undefined) {
            val = val[i];
        } else {
            return null;
        }
    }
    return val;
}

// Main processing function
async function processData(items) {
    const results = [];
    console.log("items size ", items.length)
  
    // for (const item of items) {
      // console.log("items size ", item.length)
        try {
            // Assume rawData is passed as a string from previous node
            // const rawData = item;

            // Clean up escape characters
            // let cleanedData = rawData.replace(/\\+/g, '\\').replace(/\\"/g, '"');

            // Try to extract all likely business blocks using a generic pattern
            // const blockRegex = /$$1,(?=$$[^$]{2,40})/g;
            // const matches = cleanedData.match(blockRegex) || [];

            // console.log(`Found ${matches.length} potential business blocks.`);

            for (const match of items) {
                try {
                  
                    console.log("----".repeat(10))
                    console.log("Match ", match)
                    // Wrap in array to safely parse
                    
                    // const wrapped = `[${match.trim().replace(/,$/, '')}]`;
                    // const parsed = JSON.parse(wrapped);

                    // if (!Array.isArray(parsed) || parsed.length < 8) continue;

                    // const name = get(parsed, 7);
                    // const addressParts = get(parsed, 2) || [];
                    // const address = Array.isArray(addressParts)
                    //     ? addressParts.filter(Boolean).join(', ')
                    //     : "N/A";

                    // const websiteBlock = get(parsed, 10, 0);
                    // const websiteUrl = Array.isArray(websiteBlock)
                    //     ? websiteBlock[0]?.split('?q=')[1]?.split('&')[0]
                    //     : "N/A";
                    // const domain = Array.isArray(websiteBlock) ? websiteBlock[1] : "N/A";

                    // const rating = get(parsed, 4, 6);
                    // const reviewCount = get(parsed, 4, 4, 1);
                    // const phone = get(parsed, parsed.length - 1, 0, 0);

                    results.push(extractWithRegex(match))
                    // results.push({
                    //     json: {
                    //         name,
                    //         address,
                    //         websiteUrl,
                    //         domain,
                    //         rating,
                    //         reviewCount,
                    //         phone
                    //     }
                    // });
                  
                    console.log("----".repeat(10))
                } catch (e) {
                    // Skip invalid blocks silently
                }
            }

        } catch (error) {
            console.error("Error processing item:", error.message);
        }
    // }

    return results;
}

const items  = $input.first().json.data.match(/\[\\"\/url\?q\\\\u003d.*?\]\]\]\]\]\],5/g)
// Run the async function and return output
return await processData(items);