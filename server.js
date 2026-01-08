const express = require("express");
const app = express();

app.use(express.json());

let list = [];

// 엑셀 → 서버
app.post("/update", (req, res) => {
  const raw = (req.body.list || "").trim();

  // 빈 값이면 리스트 정지
  if (raw === "") {
    list = [];
    return res.sendStatus(200);
  }

  const names = raw.split("|").map(v => v.trim()).filter(Boolean);

  for (const name of names) {
    list.push(name);
    if (list.length > 20) list.shift(); // 20명 초과 시 앞에서 제거
  }

  res.sendStatus(200);
});

// 봇 → 서버
app.get("/list", (req, res) => {
  res.json({
    list: list.join(" → ")
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
