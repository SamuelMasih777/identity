import express from "express";
import "dotenv/config";
import identifyRouter from "./routers/identify";
import pool from "./db/connection";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Guys!");
});

app.use("/api/v1", identifyRouter);

async function startServer() {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database connected successfully!");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
