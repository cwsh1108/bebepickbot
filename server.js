import express from "express";
import { google } from "googleapis";

const app = express();
app.use(express.json());

/* =======================
   LIST 관리
======================= */
let LIST = "";

// 엑셀 → 서버
app.post("/updateList", (req, res) => {
  const incoming = (req.body.list || "").trim();
  if (!incoming) {
    LIST = "";
    return res.json({ ok: true });
  }

  const arr = incoming
    .split("|")
    .map(v => v.trim())
    .filter(Boolean);

  const sliced = arr.slice(-20);
  LIST = sliced.join(" → ");
  res.json({ ok: true });
});

// 확인용
app.get("/list", (req, res) => {
  res.json({ list: LIST });
});

/* =======================
   YouTube OAuth
======================= */
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

/* =======================
   Live Chat
======================= */
async function getLiveChatId() {
  const res = await youtube.liveBroadcasts.list({
    part: ["snippet"],
    broadcastStatus: "active",
    mine: true
  });

  if (!res.data.items || !res.data.items.length) return null;
  return res.data.items[0].snippet.liveChatId;
}

async function sendChat(liveChatId, text) {
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

/* =======================
   채팅 전송 루프
======================= */
let LAST_SENT = "";

setInterval(async () => {
  if (!LIST || LIST === LAST_SENT) return;

  try {
    const liveChatId = await getLiveChatId();
    if (!liveChatId) return;

    const msg = `베베픽봇: ${LIST}`;
    await sendChat(liveChatId, msg);
    LAST_SENT = LIST;
  } catch (e) {
    console.error(e.message);
  }
}, 180000); // 3분

/* =======================
   Server
======================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("bebepick bot running on port", PORT);
});
