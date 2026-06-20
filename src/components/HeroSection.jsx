import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiPlay, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function HeroSection() {
  const { user } = useApp();
  const navigate = useNavigate();

  const handleStartPracticing = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleExploreFeatures = () => {
    navigate('/features');
  };

  return (
    <section className="relative overflow-hidden pt-4 pb-20 md:pt-6 md:pb-28">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[50%] rounded-full bg-primary-400/20 blur-[120px] dark:bg-primary-900/10" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-secondary-400/20 blur-[100px] dark:bg-secondary-900/10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 dark:bg-primary-950/20 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <FiAward className="w-3.5 h-3.5" />
              <span>Next-Gen Placement Preparation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Ace Your Technical Interviews with <span className="gradient-text">GenAI Intelligence</span>
            </h1>
            
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 font-medium">
              Prepare for elite software engineering, data, and design roles. Generate tailored placement questions, practice with our interactive speech-to-text simulator, track analytics, and export resume-ready reports.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
              <motion.button
                onClick={handleStartPracticing}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-650 text-white font-bold shadow-lg shadow-primary-500/25 flex items-center justify-center space-x-2 text-base cursor-pointer active:scale-98 transition-all"
              >
                <span>Start Practicing</span>
                <FiArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={handleExploreFeatures}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-darkCard dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold border border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-2 text-base cursor-pointer active:scale-98 transition-all"
              >
                <FiPlay className="w-4 h-4 text-primary-500 fill-primary-500" />
                <span>Explore Features</span>
              </motion.button>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-slate-400 dark:text-slate-500">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✔</span>
                <span>100% Free & Open-source</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✔</span>
                <span>LocalStorage Preserved</span>
              </div>
            </div>
          </motion.div>

          {/* SVG Illustration Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Back decoration card */}
              <div className="absolute -top-6 -left-6 w-full h-full rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl pointer-events-none" />
              
              <svg 
                viewBox="0 0 500 500" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto drop-shadow-2xl"
              >
                {/* Background grid box */}
                <rect x="50" y="50" width="400" height="400" rx="32" fill="url(#paint0_linear)" className="dark:fill-[#151b2c] opacity-80" />
                <rect x="50" y="50" width="400" height="400" rx="32" stroke="url(#paint1_linear)" strokeWidth="2" className="dark:stroke-slate-800" />
                
                {/* Inner simulated question cards */}
                <g filter="url(#filter0_d)">
                  <rect x="80" y="100" width="340" height="85" rx="16" fill="white" className="dark:fill-[#1b253b]" />
                  <circle cx="115" cy="142" r="16" fill="#eff6ff" className="dark:fill-[#1e3a8a]/40" />
                  <path d="M110 142h10M115 137v10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                  <rect x="145" y="125" width="160" height="12" rx="6" fill="#e2e8f0" className="dark:fill-slate-800" />
                  <rect x="145" y="145" width="220" height="8" rx="4" fill="#f1f5f9" className="dark:fill-slate-900" />
                  <rect x="145" y="157" width="110" height="8" rx="4" fill="#f1f5f9" className="dark:fill-slate-900" />
                  <rect x="350" y="120" width="50" height="18" rx="9" fill="#dcfce7" />
                  <text x="359" y="132" fill="#15803d" fontSize="8" fontWeight="bold">92% Match</text>
                </g>

                <g filter="url(#filter0_d)">
                  <rect x="80" y="205" width="340" height="85" rx="16" fill="white" className="dark:fill-[#1b253b]" />
                  <circle cx="115" cy="247" r="16" fill="#e0f2fe" className="dark:fill-[#075985]/40" />
                  <path d="M111 247l3 3 5-5" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="145" y="230" width="200" height="12" rx="6" fill="#e2e8f0" className="dark:fill-slate-800" />
                  <rect x="145" y="250" width="150" height="8" rx="4" fill="#f1f5f9" className="dark:fill-slate-900" />
                  <rect x="145" y="262" width="90" height="8" rx="4" fill="#f1f5f9" className="dark:fill-slate-900" />
                  <rect x="350" y="225" width="50" height="18" rx="9" fill="#e0f2fe" />
                  <text x="361" y="237" fill="#0369a1" fontSize="8" fontWeight="bold">Completed</text>
                </g>

                <g filter="url(#filter0_d)">
                  <rect x="80" y="310" width="340" height="85" rx="16" fill="white" className="dark:fill-[#1b253b]" />
                  <circle cx="115" cy="352" r="16" fill="#fef3c7" className="dark:fill-[#78350f]/40" />
                  <path d="M115 344v8l4 4" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                  <rect x="145" y="335" width="140" height="12" rx="6" fill="#e2e8f0" className="dark:fill-slate-800" />
                  <rect x="145" y="355" width="210" height="8" rx="4" fill="#f1f5f9" className="dark:fill-slate-900" />
                  <rect x="350" y="330" width="50" height="18" rx="9" fill="#fef3c7" />
                  <text x="362" y="342" fill="#b45309" fontSize="8" fontWeight="bold">Practicing</text>
                </g>

                {/* Definitions */}
                <defs>
                  <linearGradient id="paint0_linear" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f8fafc" />
                    <stop offset="1" stopColor="#f1f5f9" />
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e2e8f0" />
                    <stop offset="1" stopColor="#cbd5e1" />
                  </linearGradient>
                  <filter id="filter0_d" x="72" y="96" width="356" height="101" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.04" />
                  </filter>
                </defs>
              </svg>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
