import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, Sparkles, TrendingUp, Info } from 'lucide-react';
import { getCareerGuidance } from '../services/geminiService';
import Markdown from 'react-markdown';

export default function CareerExplorer() {
  const [interest, setInterest] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interest.trim()) return;
    
    setLoading(true);
    const advice = await getCareerGuidance(interest);
    setResult(advice);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">Section 01</span>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Career Analytics</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm font-medium">
          Ditch the myths. See where the money and demand actually are in 2025.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-12">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="Query specialized professions..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <button
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze Data
          </button>
        </form>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
             <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <TrendingUp className="text-indigo-600 w-4 h-4" /> Market Synthesis
             </h2>
             <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Live Insights</span>
          </div>
          
          <div className="markdown-body prose prose-slate">
            <Markdown>{result}</Markdown>
          </div>

          <div className="mt-12 bg-gray-50 rounded-2xl p-6 flex gap-4 items-start">
            <Info className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-500 italic">
              Insights generated using Gemini AI based on current market trends. Always double-check specific university requirements for your region.
            </p>
          </div>
        </motion.div>
      )}

      {/* Placeholder info when no result */}
      {!result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-500">
           <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center">
              <p className="font-medium text-gray-400">Discover Salary Realities</p>
           </div>
           <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center">
              <p className="font-medium text-gray-400">Debunk Career Myths</p>
           </div>
        </div>
      )}
    </div>
  );
}
