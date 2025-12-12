import { google } from "googleapis";

const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const CLIENT_SECRET = "YOUR_GOOGLE_CLIENT_SECRET";
const REDIRECT_URI = "http://localhost:8000/auth/google/gmail/callback";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const url = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: [
    "https://www.googleapis.com/auth/gmail.send",
  ],
});

console.log("Authorize this app by visiting this URL:");
console.log(url);
