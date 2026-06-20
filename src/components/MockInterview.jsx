import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getMockQuestions } from '../data/mockQuestions';
import { generateAIQuestions } from '../services/openai';
import { 
  FiClock, FiMic, FiMicOff, FiAlertCircle, FiArrowRight, 
  FiArrowLeft, FiCheckSquare, FiAward, FiFileText, FiRefreshCw 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  "Frontend Developer",
  "React Developer",
  "Java Developer",
  "Python Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Cyber Security Analyst",
  "Software Engineer"
];

const TIMERS = [
  { label: '15 Minutes', value: 15 * 60 },
  { label: '30 Minutes', value: 30 * 60 },
  { label: '45 Minutes', value: 45 * 60 }
];

export default function MockInterview() {
  const { apiKey, theme, updateQuestionStatus } = useApp();

  // Setup / Config state
  const [role, setRole] = useState(ROLES[0]);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [duration, setDuration] = useState(TIMERS[0].value);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active interview state
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: "User written answer" }
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setAnswers(prev => ({
          ...prev,
          [questions[currentIndex].id]: (prev[questions[currentIndex].id] || '') + ' ' + transcript
        }));
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [questions, currentIndex]);

  // Handle countdown
  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinish();
            toast.error("Time is up! Mock interview completed.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isFinished]);

  const handleStart = async () => {
    setIsGenerating(true);
    try {
      let qList = [];
      if (apiKey) {
        // Generate technical mock set of 5 questions
        qList = await generateAIQuestions(role, difficulty, 'Mixed', 5, apiKey);
      } else {
        // Fallback local questions
        qList = getMockQuestions(role, difficulty, 'Mixed', 5);
      }
      
      setQuestions(qList);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(duration);
      setIsStarted(true);
      setIsFinished(false);
      toast.success("Mock session started! Keep an eye on the clock.");
    } catch (err) {
      console.error(err);
      toast.error("AI Generation failed. Starting offline session.");
      // Fallback
      const qList = getMockQuestions(role, difficulty, 'Mixed', 5);
      setQuestions(qList);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(duration);
      setIsStarted(true);
      setIsFinished(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    // Automatically mark all questions attempted as 'completed' or 'practicing'
    questions.forEach(q => {
      if (answers[q.id]?.trim()) {
        updateQuestionStatus(q.id, 'completed');
      }
    });

    setIsFinished(true);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech-to-text is not supported in this browser. Please type your answer.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast("Microphone off", { icon: '🎤' });
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success("Listening... Speak clearly.", { icon: '🎤' });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsStarted(false);
    setIsFinished(false);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
  };

  // Calculate stats
  const totalQuestions = questions.length;
  const attemptedCount = Object.values(answers).filter(ans => ans.trim().length > 5).length;
  const attemptedPercent = totalQuestions > 0 ? Math.round((attemptedCount / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* 1. CONFIGURATION SCREEN */}
      {!isStarted && !isFinished && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6"
        >
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="w-12 h-12 bg-primary-500/10 text-primary-600 rounded-2xl flex items-center justify-center text-xl mx-auto font-bold dark:bg-primary-950/20 dark:text-primary-400">
              🎙
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Mock Interview Simulator</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Simulate a real coding or behavioral placement interview. Type your answers or use voice dictation under a simulated countdown.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Job Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-300 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-300 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Timer Limit */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Timer Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-300 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20"
              >
                {TIMERS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-darkBorder flex justify-end">
            <motion.button
              whileHover={{ scale: isGenerating ? 1 : 1.02 }}
              whileTap={{ scale: isGenerating ? 1 : 0.98 }}
              onClick={handleStart}
              disabled={isGenerating}
              className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center space-x-2 text-base transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing simulator...</span>
                </>
              ) : (
                <>
                  <span>Begin Mock Session</span>
                  <FiArrowRight />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 2. ACTIVE SIMULATION SCREEN */}
      {isStarted && !isFinished && questions.length > 0 && (
        <div className="space-y-6">
          {/* Header Dashboard Timer panel */}
          <div className="flex items-center justify-between bg-white dark:bg-darkCard p-5 rounded-2xl border border-slate-100 dark:border-darkBorder shadow-premium">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center">
                <FiClock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Remaining Time</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-white font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Question Progress</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">Q{currentIndex + 1} of {totalQuestions}</span>
            </div>
          </div>

          {/* Question Display Card */}
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6"
          >
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase border border-primary-100 dark:border-primary-900/30">
                {questions[currentIndex].type || 'Technical'} • {questions[currentIndex].difficultyLevel || questions[currentIndex].difficulty}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                {questions[currentIndex].question}
              </h3>
            </div>

            <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

            {/* User Input Text Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Your Answer</label>
                
                {/* Speech Dictation Button */}
                <button
                  onClick={toggleListening}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isListening
                      ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/30 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-darkBg dark:border-slate-800 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                  title="Toggle Microphone"
                >
                  {isListening ? (
                    <>
                      <FiMicOff className="w-3.5 h-3.5 text-rose-500" />
                      <span>Stop Dictating</span>
                    </>
                  ) : (
                    <>
                      <FiMic className="w-3.5 h-3.5 text-primary-500" />
                      <span>Speak Answer</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={answers[questions[currentIndex].id] || ''}
                onChange={(e) => setAnswers({
                  ...answers,
                  [questions[currentIndex].id]: e.target.value
                })}
                rows={6}
                placeholder="Type your answer here, or click the mic button to speak. Explain your reasoning and architecture cleanly..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 focus:bg-white dark:focus:bg-darkCard focus:border-primary-500 transition-all font-medium text-sm leading-relaxed"
              />
            </div>

            {/* Navigation Button Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-darkBorder">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiArrowLeft />
                <span>Previous</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={handleFinish}
                  className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950/20 dark:text-rose-450 dark:hover:bg-rose-950/10 text-xs font-bold transition-all"
                >
                  End & Evaluate
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Next</span>
                    <FiArrowRight />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-primary-500/10 transition-colors"
                  >
                    <FiCheckSquare className="w-3.5 h-3.5" />
                    <span>Submit & Finish</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. EVALUATION / REVIEW SCREEN */}
      {isFinished && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-[#131a2a] to-slate-900 text-white border border-slate-800 shadow-premium text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto">
              🏆
            </div>
            <div>
              <h2 className="text-2xl font-bold">Session Completed!</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Excellent work completing your simulated "{role}" interview. Review your performance details below.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto pt-4 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Questions Pool</span>
                <span className="text-xl font-bold font-mono">{totalQuestions}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Attempted</span>
                <span className="text-xl font-bold font-mono text-primary-400">{attemptedCount}</span>
              </div>
              <div className="col-span-2 md:col-span-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Completeness</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{attemptedPercent}%</span>
              </div>
            </div>
          </div>

          {/* Transcript / Answers review accordion */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center space-x-1.5">
              <FiFileText className="text-primary-500" />
              <span>Session Transcript Review</span>
            </h3>

            {questions.map((q, idx) => {
              const userAns = answers[q.id]?.trim() || "No answer provided.";
              
              return (
                <div 
                  key={q.id}
                  className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg border border-slate-100 dark:border-darkBorder bg-slate-50 dark:bg-darkBg text-slate-500 dark:text-slate-400">
                      {q.difficultyLevel || q.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 dark:text-white text-base">
                    {q.question}
                  </h4>

                  {/* Two columns: Your answer & Model answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* User Ans */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg border border-slate-100 dark:border-darkBorder text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
                      <strong className="text-slate-500 uppercase tracking-wider block mb-1">Your Submission:</strong>
                      <p className="whitespace-pre-line font-medium italic">"{userAns}"</p>
                    </div>

                    {/* Model Ans */}
                    <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-primary-500 uppercase tracking-wider block mb-1">Model Reference:</strong>
                      <p className="font-semibold">{q.modelAnswer || q.expectedAnswer}</p>
                    </div>
                  </div>
                  
                  {/* Tips */}
                  {q.tips && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                      💡 <strong>Prep Tip:</strong> {q.tips}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-darkBorder">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center space-x-1.5 transition-all"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Retry / New Session</span>
            </button>

            <div className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
              Attempted answers synced to dashboard logs.
            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
}
