'use client';

import React from 'react';
import { Code, Heart, Github } from 'lucide-react';

export const MadeByCredit: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="group relative">
        {/* Main credit badge */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-[2px] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="bg-gray-900 rounded-full px-4 py-2 flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Code size={16} className="text-blue-400 animate-pulse" />
              <Heart size={14} className="text-red-400 animate-bounce" />
            </div>
            <span className="text-white font-medium text-sm">
              Made by <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">ADNAN TABREZI</span>
            </span>
          </div>
        </div>
        
        {/* Hover tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 pointer-events-none">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border border-gray-700">
            <div className="flex items-center space-x-2">
              <Github size={14} className="text-gray-400" />
              <span>Crafted with passion by Adnan Tabrezi</span>
            </div>
            {/* Arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
};