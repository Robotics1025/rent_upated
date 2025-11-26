"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const letters = "NOT FOUND".split("");

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 Number */}
        <div className="mb-8">
          <div className="text-8xl md:text-9xl font-bold text-emerald-600 mb-4 animate-bounce">
            4
            <span className="inline-block animate-spin" style={{ animationDuration: '3s' }}>0</span>
            4
          </div>
        </div>

        {/* Animated "NOT FOUND" Text */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            {letters.map((letter, index) => (
              <span
                key={index}
                className={`inline-block animate-pulse ${
                  mounted ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </h1>
        </div>

        {/* Description */}
        <p className={`text-lg text-gray-600 mb-8 transition-all duration-1000 ${
          mounted ? 'animate-fade-in' : 'opacity-0'
        }`} style={{ animationDelay: '1s', animationFillMode: 'both' }}>
          Oops! The page you're looking for seems to have taken a vacation.
          Don't worry, let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 ${
          mounted ? 'animate-fade-in' : 'opacity-0'
        }`} style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
          <Link
            href="/"
            className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Home
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 bg-white border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition font-semibold inline-flex items-center justify-center gap-2"
          >
            Contact Support
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>
        </div>

        {/* Floating Elements Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-teal-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-teal-500 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
}