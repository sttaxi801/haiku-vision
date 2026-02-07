
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { HaikuResult } from '../types';

interface HaikuCardProps {
  result: HaikuResult;
}

const HaikuCard: React.FC<HaikuCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${result.poem}\n\n${result.japanesePoem}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all card-shadow flex flex-col group animate-fade-in">
      <div className="aspect-square relative overflow-hidden bg-gray-50">
        <img 
          src={result.imageUrl} 
          alt="AI Generated" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white p-2 text-[10px] rounded uppercase font-bold tracking-widest">
          {result.japanesePoem}
        </div>
      </div>
      
      <div className="p-8 flex-grow">
        <div className="w-10 h-1 border-b-2 border-red-600 mb-6"></div>
        <pre className="haiku-font text-xl font-bold text-gray-900 leading-relaxed whitespace-pre-wrap">
          {result.poem}
        </pre>
      </div>

      <div className="px-8 py-4 bg-gray-50 flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter italic">#{result.keywords}</span>
        <button 
          onClick={handleCopy}
          className="text-gray-400 hover:text-black transition-colors"
        >
          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
};

export default HaikuCard;
