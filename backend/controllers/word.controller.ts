import type { Request, Response } from "express";
import {
  getWords,
  getWordsByLevel,
  getWordsByLevelRange,
} from "../services/word.service.js";

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
const VALID_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function parseLevel(level: unknown): CEFRLevel | null {
  if (typeof level !== "string") return null;
  const normalized = level.toUpperCase();
  return VALID_LEVELS.includes(normalized as CEFRLevel)
    ? (normalized as CEFRLevel)
    : null;
}

export const getRandomWordsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { level, fromLevel, toLevel } = req.query;
    const parsedLevel = parseLevel(level);
    const parsedFromLevel = parseLevel(fromLevel);
    const parsedToLevel = parseLevel(toLevel);

    if (parsedFromLevel || parsedToLevel) {
      if (!parsedFromLevel || !parsedToLevel) {
        res.status(400).json({
          message: "Both fromLevel and toLevel are required for range filter.",
        });
        return;
      }

      const words = await getWordsByLevelRange(parsedFromLevel, parsedToLevel);
      res.status(200).json(words);
      return;
    }

    if (parsedLevel) {
      const words = await getWordsByLevel(parsedLevel);
      res.status(200).json(words);
      return;
    }

    if (level || fromLevel || toLevel) {
      res.status(400).json({
        message:
          "Invalid CEFR level. Use one of: A1, A2, B1, B2, C1, C2.",
      });
      return;
    }

    const words = await getWords();
    res.status(200).json(words);
  } catch (error) {
    console.error("Failed to fetch words:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
