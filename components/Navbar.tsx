"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  properties: any[];
  units: any[];
  totalResults: number;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults(null);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchItemClick = () => {
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                EazyRent
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Property Management</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-emerald-600 transition font-medium">Home</Link>
            <Link href="/#features" className="text-gray-700 hover:text-emerald-600 transition font-medium">Services</Link>
            <Link href="/#properties" className="text-gray-700 hover:text-emerald-600 transition font-medium">Properties</Link>
            <Link href="/#testimonials" className="text-gray-700 hover:text-emerald-600 transition font-medium">About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-emerald-600 transition font-medium">Contact</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="px-5 py-2.5 text-gray-700 hover:text-emerald-600 transition font-medium">
              Login
            </Link>
            <Link href="/signup" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold shadow-lg hover:shadow-xl">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <Link href="/" className="block text-gray-700 hover:text-emerald-600 transition font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/#features" className="block text-gray-700 hover:text-emerald-600 transition font-medium" onClick={() => setIsMenuOpen(false)}>Services</Link>
            <Link href="/#properties" className="block text-gray-700 hover:text-emerald-600 transition font-medium" onClick={() => setIsMenuOpen(false)}>Properties</Link>
            <Link href="/#testimonials" className="block text-gray-700 hover:text-emerald-600 transition font-medium" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link href="/contact" className="block text-gray-700 hover:text-emerald-600 transition font-medium" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <Link href="/login" className="block w-full px-4 py-2.5 text-gray-700 hover:text-emerald-600 transition font-medium text-center border border-gray-300 rounded-xl">
              Login
            </Link>
            <Link href="/signup" className="block w-full px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold text-center">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
