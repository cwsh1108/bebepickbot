import express from "express";
import { google } from "googleapis";

const app = express();
const PORT = process.env.PORT || 10000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

let liveChatId = null;

async function getLiveChatId() {
  const res = await youtube.liveBroadcasts.list({
    part: "snippet",
    broadcastStatus: "active",
    broadcastType: "all",
  });

  if (!res.data.items || res.data.items.length === 0) {
    console.log("라이브 없음");
    return null;
  }

  return res.data.items[0].snippet.liveChatId;
}

async function sendChat() {
  if (!liveChatId) return;

  await youtube.liveChatMessages.insert({
    part: "snippet",
    requestBody: {
      snippet: {
        liveChatId,
        type: "textMessageEvent",
        textMessageDetails: {
          messageText: "베베픽봇: 테스트 중",
        },
      },
    },
  });

  console.log("채팅 전송됨");
}

(async () => {
  liveChatId = await getLiveChatId();
  if (liveChatId) {
    setInterval(sendChat, 5000); // ✅ 5초
  }
})();

app.get("/", (req, res) => {
  res.send("bebepickbot running");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
