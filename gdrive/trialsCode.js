

// Load your file content
const rawData = $input.first().json.data
const stru = {
                name: "",
                address: "", 
                websiteUrl: "",
                domain:"",
                rating: "",
                reviewCount: "",
                phone: ""
            }
// Clean up some common escape issues
let cleanedData = rawData.replace(/\\+/g, '\\').replace(/\\"/g, '"');
let businesses = [stru]
// Try to extract all likely business blocks using a generic pattern
const blockRegex = /$$(?:\$$[^[]|$[^\$$]|[^$$$)++$/g;
const matches = cleanedData.match(blockRegex) || [];

console.log(`Found ${matches.length} potential business blocks.\n`);

matches.forEach((match, index) => {
    try {
        // Wrap in array to safely parse
        const wrapped = `[${match.trim().replace(/,$/, '')}]`;
        const parsed = JSON.parse(wrapped);

        if (!Array.isArray(parsed) || parsed.length < 8) return;

        // Helper function to safely access deep values
        const get = (arr, ...indices) => {
            let val = arr;
            for (let i of indices) {
                if (val && Array.isArray(val) && val[i] !== undefined) {
                    val = val[i];
                } else {
                    return null;
                }
            }
            return val;
        };

        const name = get(parsed, 7);
        const addressParts = get(parsed, 2) || [];
        const address = Array.isArray(addressParts)
            ? addressParts.filter(Boolean).join(', ')
            : "N/A";

        const websiteBlock = get(parsed, 10, 0);
        const websiteUrl = Array.isArray(websiteBlock) ? websiteBlock[0]?.split('?q=')[1]?.split('&')[0] : "N/A";
        const domain = Array.isArray(websiteBlock) ? websiteBlock[1] : "N/A";

        const rating = get(parsed, 4, 6);
        const reviewCount = get(parsed, 4, 4, 1);
        const phone = get(parsed, parsed.length - 1, 0, 0);

        businesses.push({
          name, address,websiteUrl, domain, rating, reviewCount, phone
        })
        // console.log(`Business ${index + 1}:`);
        // console.log("Name:", name || "N/A");
        // console.log("Address:", address || "N/A");
        // console.log("Website URL:", websiteUrl || "N/A");
        // console.log("Domain:", domain || "N/A");
        // console.log("Rating:", rating || "N/A");
        // console.log("Review Count:", reviewCount || "N/A");
        // console.log("Phone:", phone || "N/A");
        // console.log("-".repeat(60));
    } catch (e) {
        // console.warn(`Error parsing block ${index + 1}:`, e.message);
    }
});

return businesses;