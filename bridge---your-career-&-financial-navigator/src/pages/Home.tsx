import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Compass, Wallet, Briefcase, GraduationCap, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-widest mb-6">
            Real Analytics for Teenagers
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 font-sans">
            Your Future <br />
            <span className="text-indigo-600">Unpacked.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Stop guessing. Start bridging. Move from educational myths to real-world employment data, funding routes, and professional portfolios.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/career"
              className="bg-slate-900 text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              01 Carrera Market
            </Link>
            <Link
              to="/finance"
              className="bg-emerald-600 text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
            >
              02 Financial Route
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {[
          {
            num: "01",
            title: "Career Analytics",
            tag: "Real Data",
            desc: "Ditch the myths. See where the money and demand actually are in 2025. Explore 120+ professions with live stats.",
            icon: Compass,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50"
          },
          {
            num: "02",
            title: "Financial Route",
            tag: "Live Match",
            desc: "Estimated costs of living vs available grants. Discover hidden subsidies and regional funding based on your grade.",
            icon: Wallet,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
          },
          {
            num: "03",
            title: "Talent Wrapper",
            tag: "Portfolio",
            desc: "Turn raw school wins into a professional 'Achievement Dossier'. Weak spots identified, strengths verified.",
            icon: Briefcase,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50"
          }
        ].map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (idx + 1) }}
            className="flex flex-col gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className={feat.color}>{feat.num}</span> {feat.title}
              </h3>
              <span className={`${feat.bgColor} ${feat.color.replace('text', 'text').replace('600', '700')} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>
                {feat.tag}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{feat.desc}</p>
            <Link to={feat.link} className="mt-auto flex items-center gap-2 text-xs font-bold text-slate-900 group">
              Explore Section <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 rounded-[2.5rem] p-12 md:p-16 text-white mb-24 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-4 block">Platform Metric Impact</span>
            <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight">Bridging the Gap.</h2>
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="mt-1 bg-white/5 p-2.5 rounded-xl border border-white/10 shrink-0">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-tight mb-1">Market Awareness Gap</p>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-sm">85% of students choose professions based on myths. We provide the 2025 analytics they need.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="mt-1 bg-white/5 p-2.5 rounded-xl border border-white/10 shrink-0">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-tight mb-1">Funding Route Optimization</p>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-sm">$4.2B in regional grants remain unclaimed. Our live matching secures your route.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="mt-1 bg-white/5 p-2.5 rounded-xl border border-white/10 shrink-0">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-tight mb-1">Talent Digitization</p>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-sm">Dossiers packaged with our system see 3x higher positive response rates from top-tier institutions.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="grid grid-cols-2 gap-4">
                <div className="h-48 bg-indigo-600 rounded-3xl p-6 flex flex-col justify-between">
                   <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                   <div className="text-2xl font-black">94%</div>
                </div>
                <div className="h-48 bg-slate-800 rounded-3xl flex items-center justify-center p-6 text-center italic text-xs text-slate-400 font-mono">
                  "System analytics synced. Target: Data Science."
                </div>
                <div className="h-48 bg-slate-800 rounded-3xl flex items-center justify-center p-6 text-center italic text-xs text-slate-400 font-mono">
                   "Grant ID: #402 Housing Subsidy Secured."
                </div>
                <div className="h-48 bg-emerald-600 rounded-3xl p-6 flex flex-col justify-between">
                   <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                   <div className="text-2xl font-black">$14k</div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
