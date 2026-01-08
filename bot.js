const { google } = require("googleapis");
const axios = require("axios");

const youtube = google.youtube({
  version: "v3",
  auth: new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  )
});

youtube._options.auth.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

const LIVE_CHAT_ID = process.env.LIVE_CHAT_ID;
let lastSent = "";

async function postMessage(text) {
  await youtube.liveChatMessages.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        liveChatId: LIVE_CHAT_ID,
        type: "textMessageEvent",
        textMessageDetails: { messageText: text }
      }
    }
  });
}

async function tick() {
  try {
    const res = await axios.get("https://bebepickbot.onrender.com/list");
    const text = res.data.list;

    if (!text || text === lastSent) return;

    lastSent = text;
    await postMessage(`베베픽봇: ${text}`);
  } catch (e) {
    console.error(e.message);
  }
}

// 3분마다 실행
setInterval(tick, 3 * 60 * 10);
