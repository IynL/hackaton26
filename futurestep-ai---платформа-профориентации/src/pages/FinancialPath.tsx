import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, Calculator, Search, Loader2, Info, PiggyBank } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';
import Markdown from 'react-markdown';
import { useTranslation } from '../lib/i18n';

export default function FinancialPath() {
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, language } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    const langContext = language === 'ru' ? 'Отвечай на русском языке.' : 'Respond in English.';
    const advice = await getFinancialAdvice(`${goal}. ${langContext}`, budget);
    setResult(advice);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">{t('section_02')}</span>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">{t('finance_title')}</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm font-medium">
          {t('finance_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Card */}
        <div className="lg:col-span-1">
          <div className="bg-claude-surface rounded-2xl border border-claude-border shadow-sm p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('finance_params_title')}</h2>
               <div className="bg-white/5 border border-claude-border p-1.5 rounded">
                  <Calculator className="text-white w-4 h-4" />
               </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{t('finance_label_goal')}</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. IT in Moscow..."
                  className="w-full px-4 py-3 bg-claude-bg border border-claude-border rounded-xl focus:ring-1 focus:ring-gray-600 outline-none text-sm font-medium text-white"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{t('finance_label_budget')}</label>
                <input
                  type="number"
                  value={budget || ''}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="Estimated ceiling"
                  className="w-full px-4 py-3 bg-claude-bg border border-claude-border rounded-xl focus:ring-1 focus:ring-gray-600 outline-none text-sm font-medium text-white"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-white text-claude-bg px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {t('finance_btn')}
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
              className="bg-claude-surface rounded-2xl border border-claude-border shadow-sm p-8 md:p-10"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-claude-border">
                 <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <PiggyBank className="text-white w-4 h-4" /> {t('finance_results')}
                 </h2>
                 <span className="bg-white/5 border border-claude-border text-gray-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{t('finance_live_tag')}</span>
              </div>
              
              <div className="markdown-body">
                <Markdown>{result}</Markdown>
              </div>

              <div className="mt-8 pt-8 border-t border-claude-border flex gap-4 items-start">
                <Info className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <p className="text-xs text-gray-500 leading-relaxed italic">
                  {t('finance_disclaimer_full')}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full bg-claude-surface/30 rounded-2xl border border-claude-border border-dashed flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
              <div className="bg-claude-surface p-4 rounded-full mb-4 border border-claude-border">
                <Wallet className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('finance_no_route')}</h3>
              <p className="text-[10px] text-gray-600 uppercase font-mono">{t('finance_no_route_desc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
