import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Compass, Wallet, Briefcase, GraduationCap, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="pt-20 pb-16 px-4 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1 bg-white/5 border border-claude-border text-gray-400 rounded text-[10px] font-bold uppercase tracking-widest mb-6">
            {t('hero_tag')}
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 font-sans">
            {t('hero_title_1')} <br />
            <span className="text-gray-400 italic">{t('hero_title_2')}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {t('hero_desc')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/career"
              className="bg-white text-claude-bg px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-black/20"
            >
              {t('hero_cta_1')}
            </Link>
            <Link
              to="/finance"
              className="bg-white/5 border border-claude-border text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              {t('hero_cta_2')}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {[
          {
            num: "01",
            title: t('career_title'),
            tag: "Real Data",
            desc: t('career_desc'),
            icon: Compass,
            color: "text-white",
            bgColor: "bg-white/5",
            link: "/career"
          },
          {
            num: "02",
            title: t('finance_title'),
            tag: "Live Match",
            desc: t('finance_desc'),
            icon: Wallet,
            color: "text-white",
            bgColor: "bg-white/5",
            link: "/finance"
          },
          {
            num: "03",
            title: t('portfolio_title'),
            tag: "Portfolio",
            desc: t('portfolio_desc'),
            icon: Briefcase,
            color: "text-white",
            bgColor: "bg-white/5",
            link: "/portfolio"
          }
        ].map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (idx + 1) }}
            className="flex flex-col gap-4 bg-claude-surface rounded-2xl border border-claude-border p-6 hover:border-gray-600 transition-all transition-duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="text-gray-500">{feat.num}</span> {feat.title}
              </h3>
              <span className={`${feat.bgColor} text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded border border-claude-border uppercase tracking-wider`}>
                {feat.tag}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{feat.desc}</p>
            <Link to={feat.link} className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors group">
              {t('home_explore_btn')} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Stats Section - Claude Style */}
      <section className="bg-claude-surface rounded-3xl p-12 md:p-16 border border-claude-border mb-24 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 block">{t('home_stats_tag')}</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight text-white">{t('home_stats_title')}</h2>
            <div className="space-y-8">
              {[
                { icon: GraduationCap, color: 'text-blue-400', title: t('home_item1_title'), desc: t('home_item1_desc') },
                { icon: Award, color: 'text-emerald-400', title: t('home_item2_title'), desc: t('home_item2_desc') },
                { icon: TrendingUp, color: 'text-amber-400', title: t('home_item3_title'), desc: t('home_item3_desc') }
              ].map((item, i) => (
                <div key={i} className="flex gap-5">
                  <div className="mt-1 bg-claude-bg p-2 rounded-lg border border-claude-border shrink-0">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white mb-1">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed max-w-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
             <div className="grid grid-cols-2 gap-3">
                <div className="h-40 bg-white/5 border border-claude-border rounded-xl p-6 flex flex-col justify-between">
                   <div className="w-6 h-6 border border-gray-600 rounded"></div>
                   <div className="text-3xl font-bold text-white">94%</div>
                </div>
                <div className="h-40 bg-claude-bg border border-claude-border rounded-xl flex items-center justify-center p-6 text-center italic text-[10px] text-gray-500 uppercase font-mono tracking-tighter">
                  {t('home_quote1')}
                </div>
                <div className="h-40 bg-claude-bg border border-claude-border rounded-xl flex items-center justify-center p-6 text-center italic text-[10px] text-gray-500 uppercase font-mono tracking-tighter">
                   {t('home_quote2')}
                </div>
                <div className="h-40 bg-white/5 border border-claude-border rounded-xl p-6 flex flex-col justify-between">
                   <div className="w-6 h-6 border border-gray-600 rounded"></div>
                   <div className="text-3xl font-bold text-white">$14k</div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
