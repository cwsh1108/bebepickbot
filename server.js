const express = require("express");
const app = express();

app.use(express.json());

let queue = []; // 최대 20명

app.post("/update", (req, res) => {
  const incoming = (req.body.list || "").trim();

  // 빈 값이면 초기화
  if (incoming === "") {
    queue = [];
    return res.sendStatus(200);
  }

  const names = incoming.split("→").map(v => v.trim()).filter(v => v);

  for (const name of names) {
    queue.push(name);
    if (queue.length > 20) {
      queue.shift(); // 앞에서 제거
    }
  }

  res.sendStatus(200);
});

app.get("/list", (req, res) => {
  res.json({
    list: queue.join(" → ")
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
