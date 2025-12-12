import { google } from "googleapis";

const CLIENT_ID = "1024951505912-gg4elh7t61chm1d0kd2s6rupl4m81gao.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:5000/auth/google/gmail/callback";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const url = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  response_type: "code",
  scope: [
    "https://www.googleapis.com/auth/gmail.send"
  ],
});

console.log("Authorize this app by visiting this URL:");
console.log(url);
