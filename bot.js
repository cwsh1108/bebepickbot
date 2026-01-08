const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client
});

let liveChatId = null;

async function getLiveChatId() {
  const res = await youtube.liveBroadcasts.list({
    part: "snippet",
    mine: true,
    broadcastStatus: "active"
  });
  liveChatId = res.data.items?.[0]?.snippet?.liveChatId || null;
}

async function sendMessage(text) {
  if (!liveChatId) return;
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

async function tick() {
  await getLiveChatId();
  if (!liveChatId) return;

  const res = await fetch("https://bebepickbot.onrender.com/list");
  const data = await res.json();

  if (!data.list) return; // 빈 리스트면 정지

  await sendMessage(`베베픽봇: ${data.list}`);
}

setInterval(tick, 3 * 60 * 1000); // 3분
