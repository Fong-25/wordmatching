import express from "express";
import cors from "cors";
import { wordRoutes } from "./routes/word.route.js";
import path from "path";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/words", wordRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

app.get("/_health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

