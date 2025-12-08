import express from "express";
import path from "path";


const app = express();
const PORT = 3000;

app.use(express.static(path.join(process.cwd(), "client")));

app.get("/api/test", (req, res) => {
  res.json({ message: "API OK" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "client/index.html"));
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
