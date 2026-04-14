import { Router } from "express";
import { getRandomWordsController } from "../controllers/word.controller.js";

export const wordRoutes = Router();

wordRoutes.get("/", getRandomWordsController);

/*
GET /words -> random 10 from all levels
GET /words?level=B1 -> random 10 from B1
GET /words?fromLevel=A2&toLevel=C1 -> random 10 from A2..C1
*/
