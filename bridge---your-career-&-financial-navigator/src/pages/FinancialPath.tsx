import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, Calculator, Search, Loader2, Info, PiggyBank } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';
import Markdown from 'react-markdown';

export default function FinancialPath() {
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    const advice = await getFinancialAdvice(goal, budget);
    setResult(advice);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">Section 02</span>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Financial Route</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm font-medium">
          Live funding matching based on your location and academic grade.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Route Parameters</h2>
               <div className="bg-emerald-50 p-1.5 rounded">
                  <Calculator className="text-emerald-600 w-4 h-4" />
               </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. IT in Moscow..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Monthly Budget ($)</label>
                <input
                  type="number"
                  value={budget || ''}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="Estimated ceiling"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-emerald-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Generate Roadbook
              </button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                 <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <PiggyBank className="text-emerald-600 w-4 h-4" /> Funding Analysis
                 </h2>
                 <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Live Match</span>
              </div>
              
              <div className="markdown-body">
                <Markdown>{result}</Markdown>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 flex gap-4 items-start">
                <Info className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-400 leading-relaxed">
                  Budgeting estimates are based on general student living costs. Grant availability varies by region and application deadlines.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Wallet className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-2">No active route.</h3>
              <p className="text-gray-400 max-w-xs">Enter your education goal to see a breakdown of costs and funding options.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
