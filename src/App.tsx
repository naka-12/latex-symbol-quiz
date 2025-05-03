import { useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./App.css";
import { quizData } from "./quizData.ts";

export type QuizData = {
  latex: string;
  correctAnswers: string[];
  level: "easy" | "medium" | "hard";
};

const translations = {
  en: {
    title: "LaTeX Symbol Quiz",
    selectDifficulty: "Select difficulty to begin:",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    submit: "Submit",
    correct: "Correct!",
    incorrect: "Incorrect.",
    correctAnswer: "Correct answer",
    score: "Your score",
    back: "Back to Start",
    placeholder: "Enter LaTeX command",
  },
  ja: {
    title: "LaTeX 記号クイズ",
    selectDifficulty: "難易度を選んで開始",
    easy: "初級",
    medium: "中級",
    hard: "上級",
    submit: "送信",
    correct: "正解！",
    incorrect: "不正解",
    correctAnswer: "正しい答え",
    score: "あなたの得点",
    back: "トップに戻る",
    placeholder: "LaTeX コマンドを入力",
  },
};

const getRandomSubset = (arr: typeof quizData, n: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

export default function App() {
  const [language, setLanguage] = useState<"ja" | "en">("ja");
  const t = translations[language];

  const [difficulty, setDifficulty] = useState<QuizData["level"] | null>(null);
  const [questions, setQuestions] = useState<typeof quizData>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const startQuiz = (level: QuizData["level"]) => {
    setDifficulty(level);
    const filtered = quizData.filter((q) => q.level === level);
    setQuestions(getRandomSubset(filtered, Math.min(10, filtered.length)));
  };

  const restart = () => {
    setDifficulty(null);
    setQuestions([]);
    setCurrentIndex(0);
    setInput("");
    setScore(0);
    setShowResult("");
    setIsFinished(false);
    setCorrectAnswer("");
  };

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (currentQuestion.correctAnswers.includes(trimmed)) {
      setScore(score + 1);
      setShowResult("correct");
      setCorrectAnswer("");
    } else {
      setShowResult("incorrect");
      setCorrectAnswer(currentQuestion.correctAnswers[0]);
    }
    setTimeout(() => {
      setInput("");
      setShowResult("");
      setCorrectAnswer("");
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsFinished(true);
      }
    }, 2000);
  };

  const renderLatex = () => {
    try {
      return katex.renderToString(currentQuestion.latex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (e) {
      console.error("Error rendering LaTeX:", e);
      return "Invalid LaTeX";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\\/g, "");
    setInput(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 text-sm">
        <button className="mr-2" onClick={() => setLanguage("en")}>
          English
        </button>
        <button onClick={() => setLanguage("ja")}>日本語</button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-xl font-bold mb-4">{t.title}</h1>

        {!difficulty ? (
          <>
            <p className="mb-4">{t.selectDifficulty}</p>
            <div className="flex flex-col gap-2">
              <button
                className="bg-green-500 text-white rounded p-2"
                onClick={() => startQuiz("easy")}
              >
                {t.easy}
              </button>
              <button
                className="bg-yellow-500 text-white rounded p-2"
                onClick={() => startQuiz("medium")}
              >
                {t.medium}
              </button>
              <button
                className="bg-red-500 text-white rounded p-2"
                onClick={() => startQuiz("hard")}
              >
                {t.hard}
              </button>
            </div>
          </>
        ) : !isFinished ? (
          <>
            <p className="text-sm text-gray-500 mb-2">
              {currentIndex + 1} / {questions.length}
            </p>
            {showResult === "correct" && (
              <p className="mt-4 text-green-600 font-semibold">{t.correct}</p>
            )}
            {showResult === "incorrect" && (
              <div className="mt-4">
                <p className="text-red-600 font-semibold">{t.incorrect}</p>
                <p className="text-sm text-gray-700 mt-1">
                  {t.correctAnswer}: <code>\{correctAnswer}</code>
                </p>
              </div>
            )}
            <div className="text-2xl mb-4" dangerouslySetInnerHTML={{ __html: renderLatex() }} />
            <div className="flex items-center border mt-2 p-2 rounded w-full">
              <span className="text-gray-500 px-2">\</span>
              <input
                className="flex-1 outline-none text-center"
                type="text"
                placeholder={t.placeholder}
                value={input}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleSubmit}
            >
              {t.submit}
            </button>
          </>
        ) : (
          <div>
            <p className="text-2xl font-semibold">
              {t.score}: {score} / {questions.length}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={restart}
            >
              {t.back}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
