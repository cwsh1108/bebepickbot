import express from "express";
import fetch from "node-fetch";
import { google } from "googleapis";

const app = express();
app.use(express.json());

let LIST = "";

// 엑셀 → 서버
app.post("/updateList", (req, res) => {
  const incoming = (req.body.list || "").trim();
  if (!incoming) {
    LIST = "";
    return res.json({ ok: true });
  }

  const arr = incoming.split("|").map(v => v.trim()).filter(Boolean);
  const sliced = arr.slice(-20);
  LIST = sliced.join(" → ");
  res.json({ ok: true });
});

// 확인용
app.get("/list", (req, res) => {
  res.json({ list: LIST });
});

// ===== 유튜브 봇 =====
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

async function getLiveChatId() {
  const res = await youtube.liveBroadcasts.list({
    part: ["snippet"],
    broadcastStatus: "active",
    mine: true
  });

  if (!res.data.items?.length) return null;
  return res.data.items[0].snippet.liveChatId;
}

async function sendChat(liveChatId, text) {
  await youtube.liveChatMessages.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        liveChatId,
        type: "textMessageEvent",
        textMessageDetails: { messageText: text }
      }
    }
  });
}

// 3분마다 채팅
setInterval(async () => {
  if (!LIST) return;

  try {
    const liveChatId = await getLiveChatId();
    if (!liveChatId) return;

    await sendChat(liveChatId, `베베픽봇: ${LIST}`);
  } catch (e) {
    console.error(e.message);
  }
}, 180000);

app.listen(3000, () => {
  console.log("bebepick bot running");
});
