import React from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiMail, FiGlobe } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 dark:bg-[#0b0f19] border-t border-slate-800/80 dark:border-darkBorder/40 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                PM
              </div>
              <span className="text-lg font-bold tracking-tight text-white dark:text-slate-100">
                PrepMaster AI
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-semibold">
              Empowering students and programming aspirants with mock exams, AI text-based interview simulators, and in-depth code quality reviews.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 dark:text-slate-300">Platform</h3>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/exams" className="text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors">
                  Mock Exams
                </Link>
              </li>
              <li>
                <Link to="/interviews" className="text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors">
                  Mock Interviews
                </Link>
              </li>
              <li>
                <Link to="/coding" className="text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors">
                  Coding Challenges
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Socials */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 dark:text-slate-300">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors"
                aria-label="GitHub Profile"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@prepmaster.ai"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors"
                aria-label="Email Address"
              >
                <FiMail className="w-5 h-5" />
              </a>
              <a
                href="https://prepmaster.ai"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors"
                aria-label="Developer Website"
              >
                <FiGlobe className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Designed & Engineered for placement readiness.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row items-center justify-between font-semibold">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} PrepMaster AI. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 mt-2 md:mt-0">
            Portfolio Project for Final Year Placement Preparation.
          </p>
        </div>
      </div>
    </footer>
  );
}
