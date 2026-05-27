import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowRight, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 relative">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-gray-200 bg-white/90 shadow-sm px-4 py-3 backdrop-blur-md md:px-6">
        
        <Link to="/home" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
            <Store className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-900">CampusCart</p>
            <p className="text-sm text-gray-600">College marketplace, reimagined</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/home" className="text-sm text-gray-700 transition hover:text-gray-900">Home</Link>
          <Link to="/about" className="text-sm text-gray-700 transition hover:text-gray-900">About</Link>
          <Link to="/contact" className="text-sm text-gray-700 transition hover:text-gray-900">Contact</Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a href="/login" className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
            Sign In
          </a>
          <a href="/register" className="group rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            <span className="inline-flex items-center gap-2">
              Sign Up
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </a>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-full border border-gray-200 bg-gray-50 p-2 text-gray-700 md:hidden hover:bg-gray-100 transition"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="absolute top-20 left-4 right-4 bg-white border border-gray-200 shadow-lg rounded-3xl p-6 md:hidden flex flex-col gap-4 z-50">
          <Link to="/home" onClick={() => setIsMenuOpen(false)} className="text-gray-800 font-semibold text-lg hover:text-blue-600">Home</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-gray-800 font-semibold text-lg hover:text-blue-600">About</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-gray-800 font-semibold text-lg hover:text-blue-600">Contact</Link>
          <hr className="border-gray-100 my-2" />
          <a href="/login" className="text-center rounded-full border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100">Sign In</a>
          <a href="/register" className="text-center rounded-full bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">Sign Up</a>
        </div>
      )}
    </header>
  );
}
