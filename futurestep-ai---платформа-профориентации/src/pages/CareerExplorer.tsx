import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, Sparkles, TrendingUp, Info } from 'lucide-react';
import { getCareerGuidance } from '../services/geminiService';
import Markdown from 'react-markdown';
import { useTranslation } from '../lib/i18n';

export default function CareerExplorer() {
  const [interest, setInterest] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, language } = useTranslation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interest.trim()) return;
    
    setLoading(true);
    const langContext = language === 'ru' ? 'Отвечай на русском языке.' : 'Respond in English.';
    const advice = await getCareerGuidance(`${interest}. ${langContext}`);
    setResult(advice);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">{t('section_01')}</span>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">{t('career_title')}</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm font-medium">
          {t('career_desc')}
        </p>
      </div>

      <div className="bg-claude-surface rounded-2xl border border-claude-border shadow-sm p-6 mb-12">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder={t('career_placeholder')}
              className="w-full pl-10 pr-4 py-3 bg-claude-bg border border-claude-border rounded-xl focus:ring-1 focus:ring-gray-600 outline-none transition-all text-sm font-medium text-white"
            />
          </div>
          <button
            disabled={loading}
            className="bg-white text-claude-bg px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {t('career_btn')}
          </button>
        </form>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-claude-surface rounded-2xl border border-claude-border shadow-sm p-8 md:p-10 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-claude-border">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <TrendingUp className="text-white w-4 h-4" /> {t('career_insights')}
             </h2>
             <span className="bg-white/5 border border-claude-border text-gray-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{t('career_live_tag')}</span>
          </div>
          
          <div className="markdown-body">
            <Markdown>{result}</Markdown>
          </div>

          <div className="mt-12 bg-claude-bg border border-claude-border rounded-2xl p-6 flex gap-4 items-start">
            <Info className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
            <p className="text-xs text-gray-500 italic leading-relaxed">
              {t('career_disclaimer')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Placeholder info when no result */}
      {!result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
           <div className="p-8 border border-claude-border rounded-2xl text-center bg-claude-surface/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{t('career_placeholder_1')}</p>
           </div>
           <div className="p-8 border border-claude-border rounded-2xl text-center bg-claude-surface/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{t('career_placeholder_2')}</p>
           </div>
        </div>
      )}
    </div>
  );
}
