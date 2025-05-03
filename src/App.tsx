import { useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./App.css";

const translations = {
  en: {
    title: "LaTeX Symbol Quiz",
    selectDifficulty: "Select difficulty to begin:",
    low: "Low",
    mid: "Mid",
    high: "High",
    submit: "Submit",
    correct: "Correct!",
    incorrect: "Incorrect.",
    correctAnswer: "Correct answer",
    score: "Your score",
    back: "Back to Start",
    question: "Question",
    of: "of",
    placeholder: "Enter LaTeX command"
  },
  ja: {
    title: "LaTeX記号クイズ",
    selectDifficulty: "難易度を選んで開始：",
    low: "初級",
    mid: "中級",
    high: "上級",
    submit: "送信",
    correct: "正解！",
    incorrect: "不正解。",
    correctAnswer: "正しい答え",
    score: "あなたの得点",
    back: "トップに戻る",
    question: "第",
    of: "問 / 全",
    placeholder: "LaTeXコマンドを入力"
  }
};

const quizData = [
  { type: "single", latex: "\\int", correctAnswers: ["int"], level: "low" },
  { type: "single", latex: "\\sum", correctAnswers: ["sum"], level: "low" },
  { type: "single", latex: "\\alpha", correctAnswers: ["alpha"], level: "low" },
  { type: "single", latex: "\\infty", correctAnswers: ["infty"], level: "low" },
  { type: "single", latex: "\\sqrt{x}", correctAnswers: ["sqrt{x}"], level: "mid" },
  { type: "single", latex: "\\frac{a}{b}", correctAnswers: ["frac{a}{b}"], level: "mid" },
  { type: "single", latex: "\\leq", correctAnswers: ["le", "leq"], level: "mid" },
  { type: "single", latex: "\\geq", correctAnswers: ["ge", "geq"], level: "mid" },
  { type: "single", latex: "\\rightarrow", correctAnswers: ["rightarrow", "to"], level: "mid" },
  { type: "single", latex: "\\leftarrow", correctAnswers: ["leftarrow", "gets"], level: "mid" },
  { type: "single", latex: "\\cdot", correctAnswers: ["cdot"], level: "low" },
  { type: "single", latex: "\\times", correctAnswers: ["times"], level: "low" },
  { type: "fill-in", left: "a + \\color{gray}{", right: "} + b", missing: "cdot", correctAnswers: ["cdot"], level: "high" }
];

const getRandomSubset = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

export default function App() {
  const [language, setLanguage] = useState("en");
  const t = translations[language];

  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const startQuiz = (level) => {
    setDifficulty(level);
    const filtered = quizData.filter((q) => q.level === level);
    setQuestions(getRandomSubset(filtered, Math.min(10, filtered.length)));
  };

  const restart = () => {
    setDifficulty("");
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
      if (currentQuestion.type === "fill-in") {
        const full = `${currentQuestion.left}${currentQuestion.right}`;
        return katex.renderToString(full, {
          throwOnError: false,
          displayMode: true
        });
      } else {
        return katex.renderToString(currentQuestion.latex, {
          throwOnError: false,
          displayMode: true
        });
      }
    } catch {
      return "Invalid LaTeX";
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\\/g, "");
    setInput(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 text-sm">
        <button className="mr-2" onClick={() => setLanguage("en")}>EN</button>
        <button onClick={() => setLanguage("ja")}>日本語</button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-xl font-bold mb-4">{t.title}</h1>

        {!difficulty ? (
          <>
            <p className="mb-4">{t.selectDifficulty}</p>
            <div className="flex flex-col gap-2">
              <button className="bg-green-500 text-white rounded p-2" onClick={() => startQuiz("low")}>{t.low}</button>
              <button className="bg-yellow-500 text-white rounded p-2" onClick={() => startQuiz("mid")}>{t.mid}</button>
              <button className="bg-red-500 text-white rounded p-2" onClick={() => startQuiz("high")}>{t.high}</button>
            </div>
          </>
        ) : !isFinished ? (
          <>
            <p className="text-sm text-gray-500 mb-2">
              {t.question} {currentIndex + 1} {t.of} {questions.length}
            </p>
            <div
              className="text-2xl mb-4"
              dangerouslySetInnerHTML={{ __html: renderLatex() }}
            />
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

            {showResult === "correct" && (
              <p className="mt-4 text-green-600 font-semibold">{t.correct}</p>
            )}
            {showResult === "incorrect" && (
              <div className="mt-4">
                <p className="text-red-600 font-semibold">{t.incorrect}</p>
                <p className="text-sm text-gray-700 mt-1">{t.correctAnswer}: <code>\{correctAnswer}</code></p>
              </div>
            )}
          </>
        ) : (
          <div>
            <p className="text-2xl font-semibold">{t.score}: {score} / {questions.length}</p>
            <button className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={restart}>
              {t.back}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
