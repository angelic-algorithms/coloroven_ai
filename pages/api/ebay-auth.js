import axios from "axios";

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;

export async function getEbayAccessToken() {
    const credentials = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64");

    try {
        const response = await axios.post("https://api.ebay.com/identity/v1/oauth2/token", 
            "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${credentials}`
                }
            }
        );
        return response.data.access_token;  // Return the token
    } catch (error) {
        console.error("Failed to get eBay access token:", error.response?.data || error.message);
        return null;
    }
}
