import Papa from "papaparse";
import csvText from "./quizData.csv?raw";
import { z } from "zod";

const dollarLatexRegex = /^\$.*\$$/s;

const QuizItemSchema = z.object({
  latex: z.string().regex(dollarLatexRegex, {
    message: "latex must be enclosed in $...$",
  }),
  answers: z.string().transform((str) => str.split(",").map((s) => s.trim())),
  level: z.union([z.literal("easy"), z.literal("medium"), z.literal("hard")]),
});

export const QuizItemArraySchema = z.array(QuizItemSchema);

export type QuizItem = z.infer<typeof QuizItemSchema>;

export function loadQuizData(): QuizItem[] {
  console.log(csvText);
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error("CSV parse error(s):", parsed.errors);
    throw new Error("Failed to parse quizData.csv");
  }

  const validated = QuizItemArraySchema.safeParse(parsed.data);
  if (!validated.success) {
    console.error("Validation error:", validated.error.format());
    throw new Error("CSV schema validation failed.");
  }

  return validated.data.map((row) => ({
    ...row,
    latex: row.latex.replace(/^\$\s*(.*?)\s*\$$/, "$1").trim(),
  }));
}
