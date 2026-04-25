import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Award, Plus, Trash2, Layout, Loader2, Save, Download } from 'lucide-react';
import { packageAchievements } from '../services/geminiService';
import Markdown from 'react-markdown';

export default function PortfolioBuilder() {
  const [achievements, setAchievements] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePackage = async () => {
    if (!achievements.trim()) return;
    setLoading(true);
    const boxed = await packageAchievements(achievements);
    setResult(boxed);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">Section 03</span>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Talent Wrapper</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm font-medium">
          Dossier generation for university applications and early internships.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Inventory Input</h2>
              <div className="bg-indigo-50 p-1.5 rounded">
                <Award className="text-indigo-600 w-4 h-4" />
              </div>
            </div>
            
            <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-tight mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              verified • input raw achievements below
            </p>

            <textarea
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="Query specialized achievements..."
              className="w-full h-64 p-5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm font-medium leading-relaxed"
            />
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePackage}
                disabled={loading || !achievements.trim()}
                className="bg-slate-900 text-white px-10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layout className="w-4 h-4" />}
                Generate Dossier
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="relative">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 md:p-10 min-h-[512px] border-t-8 border-t-indigo-600"
            >
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-100">
                 <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">UNPACKED DOSSIER</h2>
                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Download className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="markdown-body text-sm font-medium">
                <Markdown>{result}</Markdown>
              </div>

              <div className="mt-12 flex justify-center">
                 <button className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-all font-medium text-sm">
                    <Save className="w-4 h-4" /> Save to Profile
                 </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-2">Portfolio Preview</h3>
              <p className="text-gray-400 max-w-xs">Your "Smart Resume" and achievement breakdown will appear here after packaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
