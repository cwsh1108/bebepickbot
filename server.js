// server.js (이것 하나만 사용 / bot.js 삭제)

import express from "express";
import { google } from "googleapis";

const app = express();
app.use(express.json());

let LIST = "";

/* =====================
   엑셀 → 서버
===================== */
app.post("/updateList", (req, res) => {
  const incoming = (req.body.list || "").trim();
  if (!incoming) {
    LIST = "";
    return res.json({ ok: true });
  }

  const arr = incoming.split("|").map(v => v.trim()).filter(Boolean);
  LIST = arr.slice(-20).join(" → ");
  res.json({ ok: true });
});

/* 확인용 */
app.get("/list", (req, res) => {
  res.json({ list: LIST });
});

/* =====================
   유튜브 봇
===================== */
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

  if (!res.data.items || res.data.items.length === 0) return null;
  return res.data.items[0].snippet.liveChatId;
}

async function sendChat(text) {
  const liveChatId = await getLiveChatId();
  if (!liveChatId) return;

  await youtube.liveChatMessages.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        liveChatId,
        type: "textMessageEvent",
        textMessageDetails: {
          messageText: text
        }
      }
    }
  });
}

/* 5초마다 채팅 */
setInterval(async () => {
  if (!LIST) return;
  try {
    await sendChat(`베베픽봇: ${LIST}`);
  } catch (e) {
    console.error(e.message);
  }
}, 5000);

/* =====================
   Render 포트
===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("bebepick bot running");
});
