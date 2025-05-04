import { useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./App.css";
import { loadQuizData, QuizItem } from "./loadQuizData";

const quizData: QuizItem[] = loadQuizData();

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

  const [difficulty, setDifficulty] = useState<QuizItem["level"] | null>(null);
  const [questions, setQuestions] = useState<typeof quizData>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  const startQuiz = (level: QuizItem["level"]) => {
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
    setIsCorrect(null);
    setIsFinished(false);
    setCorrectAnswers([]);
  };

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    if (!input) return;
    const trimmed = input.trim();
    let timeOut = 1000;
    if (currentQuestion.answers.includes(trimmed)) {
      setScore(score + 1);
      setIsCorrect(true);
      setCorrectAnswers(currentQuestion.answers);
    } else {
      setIsCorrect(false);
      setCorrectAnswers(currentQuestion.answers);
      timeOut = 2000;
    }
    setTimeout(() => {
      setInput("");
      setIsCorrect(null);
      setCorrectAnswers([]);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsFinished(true);
      }
    }, timeOut);
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
    const value = e.target.value.replace(/[\\\s]/g, "");
    setInput(value);
  };

  return (
    <div className="flex h-dvh items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-4 right-4 text-sm">
        <button
          className={`mr-2 ${language === "en" ? "underline" : ""}`}
          onClick={() => setLanguage("en")}
        >
          English
        </button>
        <button
          className={`${language === "ja" ? "underline" : ""}`}
          onClick={() => setLanguage("ja")}
        >
          日本語
        </button>
      </div>

      <div className="w-full max-w-lg rounded bg-white p-8 text-center shadow-xl">
        <h1 className="mb-4 text-xl font-bold">{t.title}</h1>

        {!difficulty ? (
          <>
            <p className="mb-4">{t.selectDifficulty}</p>
            <div className="flex flex-col gap-2">
              <button
                className="rounded border border-blue-400 bg-blue-500/20 px-4 py-2 shadow-md backdrop-blur-md transition hover:bg-blue-500/30"
                onClick={() => startQuiz("easy")}
              >
                {t.easy}
              </button>
              <button
                className="rounded border border-red-400 bg-red-500/20 px-4 py-2 shadow-md backdrop-blur-md transition hover:bg-red-500/30"
                onClick={() => startQuiz("medium")}
              >
                {t.medium}
              </button>
              <button
                className="rounded border border-purple-400 bg-purple-500/20 px-4 py-2 shadow-md backdrop-blur-md transition hover:bg-purple-500/30"
                onClick={() => startQuiz("hard")}
              >
                {t.hard}
              </button>
            </div>
          </>
        ) : !isFinished ? (
          <div>
            <div className="h-9">
              {isCorrect === null ? (
                <p className="mb-2 text-sm text-gray-500">
                  {currentIndex + 1} / {questions.length}
                </p>
              ) : isCorrect === true ? (
                <div>
                  <p className="text-2xl font-semibold text-green-600">{t.correct}</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {correctAnswers.map((answer, index) => (
                      <span key={index}>
                        {index > 0 && ", "}
                        <code>\{answer}</code>
                      </span>
                    ))}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-semibold text-blue-600">{t.incorrect}</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {correctAnswers.map((answer, index) => (
                      <span key={index}>
                        {index > 0 && ", "}
                        <code>\{answer}</code>
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>
            <div className="mb-4 text-2xl" dangerouslySetInnerHTML={{ __html: renderLatex() }} />
            <div className="flex items-center justify-center gap-1">
              <div className="flex w-full flex-1 items-center rounded border border-gray-400 p-2">
                <span className="pl-2 text-gray-600">\</span>
                <input
                  className="flex-1 text-center placeholder-gray-400 outline-none"
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
                className={`rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 ${input ? "" : "cursor-not-allowed opacity-50"}`}
                onClick={handleSubmit}
              >
                {t.submit}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">{t.score}</p>
            <div className="my-2 text-3xl">
              <span>
                {score === questions.length
                  ? "🏆"
                  : score > (questions.length / 4) * 3
                    ? "✨"
                    : score > questions.length / 2
                      ? "😀"
                      : score > questions.length / 4
                        ? "😐"
                        : "😢"}
              </span>
              <span className="ml-2 font-semibold">
                {score} / {questions.length}
              </span>
            </div>
            <p className="text-gray-600"></p>
            <button
              className="mt-4 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
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
