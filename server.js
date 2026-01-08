const express = require("express");
const app = express();

app.use(express.json());

let currentList = "";

// 엑셀 → 서버
app.post("/update", (req, res) => {
  currentList = req.body.list || "";
  res.sendStatus(200);
});

// 봇 → 서버
app.get("/list", (req, res) => {
  res.json({ list: currentList });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
