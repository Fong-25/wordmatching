import express from "express";
import cors from "cors";
import { wordRoutes } from "./routes/word.route.js";
import path from "path";
import { fileURLToPath } from "url";

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use("/api/words", wordRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../../frontend/dist")))

    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"))
    })
}

app.get("/_health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

