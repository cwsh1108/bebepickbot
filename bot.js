const { google } = require("googleapis");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "http://localhost"
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

// 예시: 라이브 채팅에 메시지 보내는 함수
async function sendChat(liveChatId, text) {
  await youtube.liveChatMessages.insert({
    part: "snippet",
    requestBody: {
      snippet: {
        liveChatId,
        type: "textMessageEvent",
        textMessageDetails: { messageText: text }
      }
    }
  });
}

// 서버가 살아있다는 표시용 (Render health)
setInterval(() => {
  console.log("bebepickbot alive");
}, 30000);

// TODO: 엑셀→서버 전달 값 받아서 메시지 구성 후 sendChat 호출
