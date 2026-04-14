import "dotenv/config";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
// import { PrismaClient } from "../generated/prisma/client.js";
import { prisma } from "./prisma.js";

// const prisma = new PrismaClient();
const CSV_PATH = resolve(process.cwd(), "..", "enriched_words.csv");
const VALID_CEFR = new Set(["A1", "A2", "B1", "B2", "C1", "C2"] as const);
const BATCH_SIZE = 1000;

type WordInsert = {
  word: string;
  Frequency: number;
  Postgres: string;
  Definition: string;
  CEFR: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  FrequencySource: string;
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

async function flushBatch(batch: WordInsert[]): Promise<number> {
  if (batch.length === 0) return 0;
  await prisma.word.createMany({ data: batch });
  return batch.length;
}

async function main(): Promise<void> {
  const input = createReadStream(CSV_PATH);
  const reader = createInterface({ input, crlfDelay: Infinity });
  const batch: WordInsert[] = [];
  let inserted = 0;
  let skipped = 0;

  await prisma.word.deleteMany({});

  for await (const rawLine of reader) {
    const line = rawLine.trim();
    if (!line) continue;

    const columns = parseCsvLine(line);
    if (columns.length < 7) {
      skipped += 1;
      continue;
    }

    const word = columns[1]?.trim();
    const frequency = Number(columns[2]);
    const partOfSpeech = columns[3]?.trim();
    const definition = columns[4]?.trim();
    const cefr = columns[5]?.trim();
    const source = columns[6]?.trim();

    if (!word || !partOfSpeech || !definition || !source || !VALID_CEFR.has(cefr as WordInsert["CEFR"])) {
      skipped += 1;
      continue;
    }

    if (!Number.isFinite(frequency)) {
      skipped += 1;
      continue;
    }

    batch.push({
      word,
      Frequency: Math.trunc(frequency),
      Postgres: partOfSpeech,
      Definition: definition,
      CEFR: cefr as WordInsert["CEFR"],
      FrequencySource: source,
    });

    if (batch.length >= BATCH_SIZE) {
      inserted += await flushBatch(batch);
      batch.length = 0;
    }
  }

  inserted += await flushBatch(batch);
  console.log(`Seed complete. Inserted: ${inserted}, skipped: ${skipped}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
