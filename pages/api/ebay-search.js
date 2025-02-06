import axios from "axios";
import { getEbayAccessToken } from "./ebay-auth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { query, colors } = req.body;
    if (!query || !colors || colors.length === 0) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    const accessToken = await getEbayAccessToken();
    if (!accessToken) {
        return res.status(500).json({ error: "Failed to authenticate with eBay API" });
    }

    try {
        // 🔹 Step 1: Modify Search Query to Prioritize Colors
        const searchQuery = `${colors.join(" OR ")} ${query}`;

        const response = await axios.get("https://api.ebay.com/buy/browse/v1/item_summary/search", {
            params: {
                q: searchQuery,
                limit: 20, // Increase limit to get more results
            },
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        const items = response.data.itemSummaries || [];

        // 🔹 Step 2: Filter Items to Ensure They Have a Thumbnail Image
        let formattedItems = items
            .filter(item => item.image && item.image.imageUrl) // Ensure items have images
            .map(item => ({
                title: item.title,
                image: item.image.imageUrl,
                link: item.itemWebUrl
            }));

        // 🔹 Step 3: Post-Filter to Prioritize Matching Colors in Image URL
        formattedItems = formattedItems.filter(item => 
            colors.some(color => item.image.toLowerCase().includes(color.toLowerCase()))
        );

        // 🔹 Step 4: If No Items Match the Image Color, Return the Original List
        if (formattedItems.length === 0) {
            formattedItems = items
                .filter(item => item.image && item.image.imageUrl) // Ensure they have images
                .map(item => ({
                    title: item.title,
                    image: item.image.imageUrl,
                    link: item.itemWebUrl
                }));
        }

        res.status(200).json(formattedItems);
    } catch (error) {
        console.error("eBay API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch product data from eBay" });
    }
}
