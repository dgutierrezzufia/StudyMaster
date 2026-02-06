
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const port = 8088;
app.listen(port, () => {
  console.log("API running on port " + port);
});
