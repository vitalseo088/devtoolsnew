import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Clock, Award, Check, AlertCircle } from 'lucide-react';

interface Props {
  mode: 'typing-speed' | 'wpm-test';
}

export const TypingTests: React.FC<Props> = ({ mode }) => {
  const passages = {
    beginner: `The quick brown fox jumps over the lazy dog. Programming is the art of telling another human being what one wants the computer to do. Simplicity is prerequisite for reliability.`,
    intermediate: `Modern web architecture emphasizes client-side state management, asynchronous data hydration, and edge execution. Writing clean code requires discipline, continuous testing, and empathetic collaboration.`,
    advanced: `Algorithmic optimization frequently balances computational time complexity against memory space overhead. In deterministic finite automata, transitions depend strictly on current input symbols and discrete internal states without ambiguous backtracking.`,
  };

  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [duration, setDuration] = useState<number>(30); // 30 seconds
  const [customText, setCustomText] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);

  const targetText = useCustom && customText.trim() ? customText.trim() : passages[difficulty];

  const [userInput, setUserInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleInputChange = (val: string) => {
    if (isFinished) return;
    if (!isActive && val.length > 0) {
      setIsActive(true);
      setStartTime(Date.now());
    }
    setUserInput(val);
    if (val.length >= targetText.length) {
      setIsActive(false);
      setIsFinished(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      setBackspaceCount((b) => b + 1);
    }
  };

  const resetTest = () => {
    setUserInput('');
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setBackspaceCount(0);
    setStartTime(null);
    if (inputRef.current) inputRef.current.focus();
  };

  // Calculations
  const elapsedMinutes = (duration - timeLeft) / 60 || 0.001;
  const typedChars = userInput.length;
  let correctChars = 0;
  for (let i = 0; i < typedChars; i++) {
    if (userInput[i] === targetText[i]) correctChars++;
  }
  const errorChars = typedChars - correctChars;
  // Standard WPM: 1 word = 5 characters
  const grossWpm = Math.round((typedChars / 5) / elapsedMinutes) || 0;
  const netWpm = Math.max(0, Math.round(((typedChars / 5) - (errorChars / 5)) / elapsedMinutes)) || 0;
  const accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 100;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">Difficulty:</span>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value as any);
                  resetTest();
                }}
                disabled={isActive}
                className="border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
              >
                <option value="beginner">Beginner (Common Words)</option>
                <option value="intermediate">Intermediate (Tech Prose)</option>
                <option value="advanced">Advanced (Complex Vocab)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">Duration:</span>
              <select
                value={duration}
                onChange={(e) => {
                  const d = Number(e.target.value);
                  setDuration(d);
                  setTimeLeft(d);
                  resetTest();
                }}
                disabled={isActive}
                className="border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
              >
                <option value={15}>15 Seconds</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds (1 Min)</option>
                <option value={120}>120 Seconds (2 Min)</option>
              </select>
            </div>

            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="rounded-[2px] text-[#8A244B]"
              />
              <span>Paste Custom Text</span>
            </label>
          </div>

          <button
            onClick={resetTest}
            className="px-3 py-1.5 text-xs font-semibold bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart Test
          </button>
        </div>

        {useCustom && (
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste your custom passage to practice..."
            rows={3}
            className="w-full text-xs font-mono p-2 border border-slate-300 rounded-[4px] bg-slate-50 focus:outline-none"
          />
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white card-dev27 text-xs">
          <span className="text-slate-500 block mb-0.5">Net WPM (Words/Min)</span>
          <span className="font-mono text-xl font-bold text-[#8A244B]">
            {netWpm} WPM
          </span>
        </div>
        <div className="p-3 bg-white card-dev27 text-xs">
          <span className="text-slate-500 block mb-0.5">Typing Accuracy</span>
          <span className="font-mono text-xl font-bold text-[#2E7D32]">
            {accuracy}%
          </span>
        </div>
        <div className="p-3 bg-white card-dev27 text-xs">
          <span className="text-slate-500 block mb-0.5">Time Remaining</span>
          <span className="font-mono text-xl font-bold text-slate-800">
            {timeLeft}s
          </span>
        </div>
        <div className="p-3 bg-white card-dev27 text-xs">
          <span className="text-slate-500 block mb-0.5">Errors / Backspaces</span>
          <span className="font-mono text-xl font-bold text-[#D84315]">
            {errorChars} / {backspaceCount}
          </span>
        </div>
      </div>

      {/* Target Passage Highlighting */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] font-mono text-xs sm:text-sm leading-relaxed tracking-wide select-none">
          {targetText.split('').map((char, idx) => {
            let colorClass = 'text-slate-400';
            if (idx < userInput.length) {
              colorClass = userInput[idx] === char ? 'text-green-700 font-bold bg-green-50' : 'text-red-700 bg-red-100 font-bold underline';
            } else if (idx === userInput.length) {
              colorClass = 'border-b-2 border-[#8A244B] text-slate-900 bg-amber-100';
            }
            return (
              <span key={idx} className={colorClass}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Input Textarea */}
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isFinished}
          placeholder={isFinished ? 'Test completed! View results above.' : 'Start typing here... Timer will start on first keystroke!'}
          rows={4}
          className="w-full font-mono text-xs sm:text-sm p-3 bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:border-[#8A244B] text-slate-900 resize-none"
        />

        {isFinished && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-[4px] text-xs text-green-900 flex items-center justify-between">
            <div>
              <span className="font-bold">Test Completed! </span>
              Your net score is <strong>{netWpm} WPM</strong> with <strong>{accuracy}% accuracy</strong>.
            </div>
            <button
              onClick={resetTest}
              className="px-3 py-1 font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px]"
            >
              Test Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
