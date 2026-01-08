const { google } = require("googleapis");
const readline = require("readline");
const path = require("path");

// ↓↓↓ 방금 받은 JSON 파일명 그대로 맞춰줘
const KEYFILE = path.join(__dirname, "client_secret_2_140481409396-a0k1i4gn6akffjkkr42tlpsv3leei0b4.apps.googleusercontent.com.json");

const oauth2Client = new google.auth.OAuth2(
  require(KEYFILE).installed.client_id,
  require(KEYFILE).installed.client_secret,
  "http://localhost"
);

const scopes = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent",
});

console.log("아래 주소를 브라우저에 복사해서 열어:");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\n로그인 후 받은 code를 여기에 붙여넣어: ", async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log("\n🔥 REFRESH_TOKEN 🔥");
  console.log(tokens.refresh_token);
  rl.close();
});
