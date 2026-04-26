import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Award, Layout, Loader2, Download } from 'lucide-react';
import { packageAchievements } from '../services/geminiService';
import Markdown from 'react-markdown';
import { useTranslation } from '../lib/i18n';

export default function PortfolioBuilder() {
  const [achievements, setAchievements] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, language } = useTranslation();

  const handlePackage = async () => {
    if (!achievements.trim()) return;
    setLoading(true);
    const langContext = language === 'ru' ? 'Отвечай на русском языке.' : 'Respond in English.';
    const boxed = await packageAchievements(`${achievements}. ${langContext}`);
    setResult(boxed);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">{t('section_03')}</span>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">{t('portfolio_title')}</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm font-medium">
          {t('portfolio_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-8">
          <div className="bg-claude-surface rounded-2xl border border-claude-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('portfolio_label')}</h2>
              <div className="bg-white/5 border border-claude-border p-1.5 rounded">
                <Award className="text-white w-4 h-4" />
              </div>
            </div>
            
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-4 bg-white/5 p-3 rounded-lg border border-claude-border">
              {t('portfolio_tip')}
            </p>

            <textarea
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder={t('portfolio_placeholder')}
              className="w-full h-64 p-5 bg-claude-bg border border-claude-border rounded-xl focus:ring-1 focus:ring-gray-600 outline-none resize-none text-sm font-medium leading-relaxed text-white"
            />
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePackage}
                disabled={loading || !achievements.trim()}
                className="bg-white text-claude-bg px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layout className="w-4 h-4" />}
                {t('portfolio_btn')}
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
              className="bg-claude-surface rounded-2xl border border-claude-border shadow-lg p-8 md:p-10 min-h-[512px] border-t-8 border-t-white"
            >
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-claude-border">
                 <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{t('portfolio_dossier_title')}</h2>
                 <button className="p-2 text-gray-500 hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="markdown-body text-sm font-medium">
                <Markdown>{result}</Markdown>
              </div>
            </motion.div>
          ) : (
            <div className="h-full bg-claude-surface/30 rounded-2xl border border-claude-border border-dashed flex flex-col items-center justify-center p-12 text-center min-h-[512px]">
              <div className="bg-claude-surface p-4 rounded-full mb-4 border border-claude-border">
                <Briefcase className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('portfolio_preview_title')}</h3>
              <p className="text-[10px] text-gray-600 uppercase font-mono">{t('portfolio_preview_desc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
