import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiArrowRight,
  FiMessageSquare,
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiTrash2,
  FiAlertTriangle,
  FiClock,
  FiActivity
} from "react-icons/fi";

export default function InterviewSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { questions, role, difficulty } = location.state || {};

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [transcripts, setTranscripts] = useState({});
  const [loading, setLoading] = useState(false);

  // Device states
  const [cameraStatus, setCameraStatus] = useState("Camera Disabled");
  const [micPermission, setMicPermission] = useState("prompt"); // prompt, granted, denied
  const [isMicSupported] = useState(() => {
    const SpeechRecognition = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    return !!SpeechRecognition;
  });
  const [isRecording, setIsRecording] = useState(false);

  // Integrity warning log
  const [warningLog, setWarningLog] = useState([]);
  const [warningCount, setWarningCount] = useState(0);

  // Timer: 150 seconds per question
  const [timeLeft, setTimeLeft] = useState(150);

  // Refs for media streams and speech recognition
  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);
  const audioStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentIdxRef = useRef(currentIdx);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  // Clean up streams helper
  const stopAllStreams = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      stopAllStreams();

      const questionsList = questions.map((q) => q.questionText || q);
      const answersList = questions.map((_, idx) => answers[idx] || "");
      const transcriptsList = questions.map((_, idx) => transcripts[idx] || "");
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

      const payload = {
        role,
        difficulty,
        questions: questionsList,
        answers: answersList,
        transcript: transcriptsList,
        warningCount,
        timeSpent: duration
      };

      const res = await API.post("/interviews/submit", payload);

      toast.success("AI interview assessment completed!");
      navigate(`/interviews/result/${res.data._id}`);
    } catch (error) {
      toast.error("Failed to compile evaluation review. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeExpired = () => {
    toast.error("Time expired for this question!");
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };


  // Keep track of index in ref to avoid stale closure in SpeechRecognition
  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      toast.error("Invalid interview session. Please set up a panel first.");
      navigate("/interviews");
    }
  }, [questions, navigate]);

  // Handle integrity warnings
  const addWarning = (message) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setWarningLog((prev) => [{ time, message }, ...prev]);
    setWarningCount((c) => c + 1);
    toast.error(message, { id: message }); // Unique ID to prevent duplicated toasts
  };

  // Initialize camera and verify microphone permissions
  useEffect(() => {
    if (!questions || questions.length === 0) return;

    const startDevices = async () => {
      // 1. Setup Camera
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoStreamRef.current = videoStream;
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
        setCameraStatus("Camera Connected");
      } catch (err) {
        setCameraStatus("Camera Disabled");
        addWarning("Camera disconnected.");
      }

      // 2. Setup Microphone Check
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = audioStream;
        setMicPermission("granted");
        // Release the initial probe stream immediately (we will use WebSpeech API for transcription)
        audioStream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        setMicPermission("denied");
        addWarning("Microphone disconnected.");
      }
    };

    startDevices();

    // 3. Setup Web Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          const idx = currentIdxRef.current;
          setAnswers((prev) => {
            const currentAns = prev[idx] || "";
            return {
              ...prev,
              [idx]: currentAns ? `${currentAns.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()
            };
          });
          setTranscripts((prev) => {
            const currentTrans = prev[idx] || "";
            return {
              ...prev,
              [idx]: currentTrans ? `${currentTrans.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()
            };
          });
        }
      };

      rec.onerror = (event) => {
        if (event.error === "not-allowed") {
          setMicPermission("denied");
          addWarning("Microphone disconnected.");
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    // 4. Setup Event Listeners for Integrity Monitoring
    const handleBlur = () => {
      addWarning("Interview window lost focus.");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning("Interview window lost focus.");
      }
    };

    const handleDeviceChange = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some((d) => d.kind === "videoinput");
        const hasMic = devices.some((d) => d.kind === "audioinput");

        if (!hasCamera && videoStreamRef.current) {
          videoStreamRef.current.getTracks().forEach((track) => track.stop());
          videoStreamRef.current = null;
          setCameraStatus("Camera Disabled");
          addWarning("Camera disconnected.");
        }

        if (!hasMic && micPermission === "granted") {
          setMicPermission("denied");
          addWarning("Microphone disconnected.");
        }
      } catch (err) {
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    // Cleanup tracks & listeners on unmount
    return () => {
      stopAllStreams();
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [questions]);



  // Timer effect: counts down 150s per question
  useEffect(() => {
    if (!questions || questions.length === 0) return;

    setTimeout(() => {
      setTimeLeft(150);
    }, 0);

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleTimeExpired();
          return 150;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [currentIdx, questions]);

  // Stop recording when shifting questions
  useEffect(() => {
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
      setIsRecording(false);
    }
  }, [currentIdx]);



  const handleTextChange = (e) => {
    setAnswers({ ...answers, [currentIdx]: e.target.value });
  };

  const startRecording = () => {
    if (!isMicSupported) {
      toast.error("Speech Recognition is not supported by your browser. Please type your response.");
      return;
    }
    if (micPermission === "denied") {
      toast.error("Microphone access is denied. Check browser permission settings.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (err) {
    }
  };

  const stopRecording = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    } catch (err) {
    }
  };

  const clearResponse = () => {
    setAnswers({ ...answers, [currentIdx]: "" });
    setTranscripts({ ...transcripts, [currentIdx]: "" });
  };

  const handleNext = () => {
    const currentAnswer = answers[currentIdx] || "";
    if (currentAnswer.trim().length < 10) {
      return toast.error("Please write or speak a detailed response (minimum 10 characters).");
    }
    setCurrentIdx((prev) => prev + 1);
  };



  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIdx];
  const currentAnswer = answers[currentIdx] || "";

  // Helper to format remaining time
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Compute mic status message
  let displayMicStatus = "Mic Disabled";
  if (isMicSupported && micPermission === "granted") {
    displayMicStatus = isRecording ? "Mic Connected" : "Mic Muted";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Session progress brief */}
      <div className="p-5 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-premium flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-white">
            {role} Professional Interview Simulation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold capitalize mt-0.5">
            Difficulty: {difficulty} • Integrity Drills Enabled
          </p>
        </div>

        <div className="px-4 py-2 bg-primary-500/10 text-primary-500 border border-primary-500/10 rounded-2xl text-xs font-bold">
          Question {currentIdx + 1} of {questions.length}
        </div>
      </div>

      {/* Split Layout: Left Panel & Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Question Card, Text Area, Mic Controls (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
            
            {/* Question Card */}
            <div className="p-5 rounded-2xl bg-primary-500/5 dark:bg-primary-950/10 border border-primary-500/10 space-y-3">
              <div className="flex items-center space-x-2 text-primary-500 text-xs font-bold uppercase tracking-wider">
                <FiMessageSquare className="w-4 h-4" />
                <span>Interviewer Prompt ({currentQuestion.type || "Technical"})</span>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </div>

            {/* Answer Text Area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Your Response (Dual mode: Type or Speak)</span>
                <span className={currentAnswer.length >= 10 ? "text-emerald-500" : "text-rose-500"}>
                  {currentAnswer.length} characters (min 10)
                </span>
              </div>

              <textarea
                value={currentAnswer}
                onChange={handleTextChange}
                placeholder="Write your answer here or click 'Start Recording' to speak. Feel free to edit the transcript directly..."
                className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 resize-none transition-all leading-relaxed"
              />
            </div>

            {/* Speech to Text Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center space-x-2.5">
                {isRecording ? (
                  <span className="flex items-center space-x-1.5 text-rose-500 font-bold animate-pulse text-sm">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block" />
                    <span>🎤 Listening...</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center space-x-1.5">
                    {displayMicStatus === "Mic Connected" && <FiMic className="text-emerald-500 w-4 h-4" />}
                    {displayMicStatus === "Mic Muted" && <FiMicOff className="text-yellow-500 w-4 h-4" />}
                    {displayMicStatus === "Mic Disabled" && <FiMicOff className="text-rose-500 w-4 h-4" />}
                    <span>Status: {displayMicStatus}</span>
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearResponse}
                  title="Clear Response"
                  className="p-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-350 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl transition-all"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-4 py-2 bg-yellow-550 hover:bg-yellow-600 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all"
                  >
                    <FiMicOff className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-primary-500/10"
                  >
                    <FiMic className="w-4 h-4" />
                    <span>Start Recording</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation and Action Area */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-slate-900 dark:bg-slate-200 hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold text-sm flex items-center space-x-1.5 shadow-md transition-all active:scale-98"
                >
                  <span>Next Question</span>
                  <FiArrowRight />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold text-sm flex items-center space-x-1.5 shadow-lg shadow-primary-500/20 transition-all active:scale-98"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheck />
                      <span>Submit Interview</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Webcam Feed, Timer, Integrity Monitor, Progress (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Camera Feed */}
          <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-premium space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <FiVideo className="text-primary-500 w-4 h-4" />
              <span>Live Video Stream</span>
            </h4>
            
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-inner border border-slate-200 dark:border-darkBorder">
              {cameraStatus === "Camera Connected" ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-slate-500 p-4 text-center space-y-3 bg-slate-100 dark:bg-slate-800/80">
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-full shadow-md">
                    <FiVideoOff className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-300 text-sm">Camera Disabled</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">Camera stream not found or permission denied.</p>
                  </div>
                </div>
              )}
              {/* Overlaid Camera Status Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white flex items-center space-x-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${cameraStatus === "Camera Connected" ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span>{cameraStatus}</span>
              </div>
            </div>
          </div>

          {/* Timer & Question Progress Tracker */}
          <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-premium grid grid-cols-2 gap-4">
            
            {/* Visual Timer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-darkBorder flex flex-col justify-center items-center text-center space-y-1">
              <FiClock className="w-5 h-5 text-indigo-500" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Question Timer</span>
              <span className={`text-2xl font-black font-mono tracking-tight mt-0.5 ${timeLeft <= 30 ? "text-rose-500 animate-pulse" : "text-slate-800 dark:text-white"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Progress */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-darkBorder flex flex-col justify-center items-center text-center space-y-1">
              <FiActivity className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Progress</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                {currentIdx + 1} / {questions.length}
              </span>
            </div>
          </div>

          {/* Warning / Integrity Monitor Log */}
          <div className="p-6 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-premium space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <FiAlertTriangle className="text-amber-500 w-4 h-4" />
                <span>Integrity Warning Log</span>
              </h4>
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold">
                Warnings: {warningCount}
              </span>
            </div>

            <div className="h-44 overflow-y-auto border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3 scrollbar-thin">
              {warningLog.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                  No active logs. Focus is maintained.
                </div>
              ) : (
                warningLog.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs">
                    <span className="text-slate-400 font-mono shrink-0">[{log.time}]</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
