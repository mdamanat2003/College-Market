import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 px-4 py-8 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 text-sm text-gray-400">
        <p>CampusCart 2026. All rights reserved.</p>
        <div className="flex items-center justify-center gap-6">
          <Link to="/about" className="transition hover:text-white">About</Link>
          <Link to="/home#features" className="transition hover:text-white">Features</Link>
          <button onClick={() => window.scrollTo(0, 0)} className="transition hover:text-white">Back to top</button>
        </div>
      </div>
    </footer>
  );
}