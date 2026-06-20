import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import HeroSection from '../components/HeroSection';
import { 
  FiCpu, FiCheckCircle, FiTrendingUp, FiBookmark, 
  FiFileText, FiAward, FiBookOpen, FiArrowRight 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useApp();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleGenerateQuestions = () => {
    if (user) {
      navigate('/exams');
    } else {
      navigate('/login');
    }
  };
  const features = [
    {
      icon: <FiCpu className="w-6 h-6" />,
      title: "AI Question Generation",
      desc: "Instant dynamic questions based on specific tech stack, difficulty tiers, and behavioral/HR parameters.",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/15"
    },
    {
      icon: <FiBookOpen className="w-6 h-6" />,
      title: "Mock Interview simulator",
      desc: "Simulate pressure under a strict timer, input answers using voice dictation, and review post-mock transcripts.",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/15"
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: "Progress Tracking",
      desc: "Mark question completion statuses (Not Started, Practicing, Done) to measure coverage and prepare.",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/15"
    },
    {
      icon: <FiBookmark className="w-6 h-6" />,
      title: "Knowledge Bookmarks",
      desc: "Save highly technical or complex questions to a personalized revision board with reference responses.",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/15"
    },
    {
      icon: <FiFileText className="w-6 h-6" />,
      title: "PDF Report Exports",
      desc: "Download styled interview cheat-sheets and custom summaries, ready for revision or offline studying.",
      color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/15"
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Placement Analytics",
      desc: "Review difficulty distributions, completion charts, and unlock badges for placement readiness milestones.",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/15"
    }
  ];

  const benefits = [
    {
      title: "Accelerate Placement Readiness",
      desc: "Practice with highly realistic questions commonly asked in engineering college campus drives and MNC coding interviews."
    },
    {
      title: "Track & Log Preparation",
      desc: "Avoid repetition. Store your history in LocalStorage and build an organized preparation journal."
    },
    {
      title: "Master Technical Core",
      desc: "Verify architectural depth in React, Java, Python, and system design, along with reference answers."
    },
    {
      title: "Refine HR & Behavioral Skills",
      desc: "Utilize structured tips to confidently answer behavioral, leadership, conflict resolution, and soft skill prompts."
    }
  ];

  return (
    <div className="space-y-24 pb-16">
      <HeroSection />

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Features Tailored for <span className="gradient-text">Top-Tier Placements</span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
            Everything you need to review technical concepts, structure response answers, and benchmark placement readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium hover:shadow-lg hover:border-primary-500/20 dark:hover:border-primary-900/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-2xl border w-fit ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-slate-100 dark:bg-darkCard/50 py-20 border-y border-slate-200/40 dark:border-darkBorder/40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left title */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                Designed to transition you from <span className="gradient-text">Student to Professional</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Placement drives require speed, precision, and confidence. InterviewAce simulates target environments to prepare you for actual technical tests and panels.
              </p>
              <div className="pt-2">
                <motion.button
                  onClick={handleGetStarted}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm flex items-center space-x-2 shadow-md transition-colors cursor-pointer"
                >
                  <span>Get Started Offline/Online</span>
                  <FiArrowRight />
                </motion.button>
              </div>
            </div>

            {/* Right benefits list */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((b, idx) => (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-glass"
                >
                  <div className="flex items-center space-x-2 text-emerald-500 dark:text-emerald-400">
                    <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{b.title}</h3>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          {/* subtle design circles */}
          <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] rounded-full bg-white/10 blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl font-extrabold max-w-2xl mx-auto">
            Ready to test your skills? Let's compile a preparation list.
          </h2>
          <p className="text-primary-100 max-w-md mx-auto text-sm md:text-base font-semibold">
            Input target parameters, generate detailed mock cards, and refine answers with model keys.
          </p>
          <div className="pt-2">
            <motion.button
              onClick={handleGenerateQuestions}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-primary-600 font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2 text-sm cursor-pointer"
            >
              <span>Generate Questions</span>
              <FiArrowRight />
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
}
