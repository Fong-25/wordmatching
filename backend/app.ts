import express from "express";
import cors from "cors";
import { wordRoutes } from "./routes/word.route.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/words", wordRoutes);


app.get("/_health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

