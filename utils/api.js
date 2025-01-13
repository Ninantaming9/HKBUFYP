import axios from "axios";

export const apiToken = "w2eAYek93d3PB9pOHoDFLRAsWoZj";
export const apiBaseUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers";

const clientID = "R4pQV8o6v3Ii2z59GdcpvkrAZH7PvGNk";
const clientSecret = "KSSZqs7sEKAef19G";

let newApiToken = "";

// const getNewAccessToken = async () => {
//     try {
//         const response = await axios.post("https://test.api.amadeus.com/v1/security/oauth2/token", {
//             client_id: clientID,
//             client_secret: clientSecret,
//             grant_type: "client_credentials"
//         }, {
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded"
//             }
//         });

//         newApiToken = response.data.access_token;
//         console.log("newApiToken", newApiToken);
//     } catch (error) {
//         console.error("Error fetching access token:", error);
//     }
// };

// getNewAccessToken();