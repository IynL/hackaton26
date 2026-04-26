import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ArrowRight, CheckCircle2, ChevronRight, Loader2, Target, Zap } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { getRecommendations, getSkillTree } from '../services/geminiService';
import SkillTreeModal from '../components/SkillTreeModal';

export default function Onboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0: Start, 1-10: Questions, 11: Result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [showTree, setShowTree] = useState(false);

  const startSurvey = () => setStep(1);

  const handleAnswer = (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    if (step < 10) {
      setStep(step + 1);
    } else {
      finalize(newAnswers);
    }
  };

  const finalize = async (finalAnswers: any) => {
    setLoading(true);
    setStep(11);
    const summary = JSON.stringify(finalAnswers);
    const sectors = await getRecommendations(summary, finalAnswers.priority || 'general');
    setRecommendations(sectors.sectors || []);
    setLoading(false);
    localStorage.setItem('onboarding_complete', 'true');
  };

  const questions = [
    { id: 'drive', q: t('onboarding_q1'), options: [
      { id: 'code', label: t('onboarding_q1_code') },
      { id: 'tools', label: t('onboarding_q1_tools') },
      { id: 'people', label: t('onboarding_q1_people') },
    ]},
    { id: 'priority', q: t('onboarding_q2'), options: [
      { id: 'money', label: t('onboarding_q2_money') },
      { id: 'impact', label: t('onboarding_q2_impact') },
      { id: 'freedom', label: t('onboarding_q2_freedom') },
    ]},
    { id: 'learning', q: t('onboarding_q3'), options: [
      { id: 'academic', label: t('onboarding_q3_academic') },
      { id: 'visual', label: t('onboarding_q3_visual') },
      { id: 'practical', label: t('onboarding_q3_practical') },
    ]},
    { id: 'environment', q: t('onboarding_q4'), options: [
      { id: 'office', label: t('onboarding_q4_office') },
      { id: 'startup', label: t('onboarding_q4_startup') },
      { id: 'outdoor', label: t('onboarding_q4_outdoor') },
    ]},
    { id: 'social', q: t('onboarding_q5'), options: [
      { id: 'alone', label: t('onboarding_q5_alone') },
      { id: 'team', label: t('onboarding_q5_team') },
      { id: 'public', label: t('onboarding_q5_public') },
    ]},
    { id: 'complexity', q: t('onboarding_q6'), options: [
      { id: 'puzzle', label: t('onboarding_q6_puzzle') },
      { id: 'creative', label: t('onboarding_q6_creative') },
      { id: 'system', label: t('onboarding_q6_system') },
    ]},
    { id: 'technology', q: t('onboarding_q7'), options: [
      { id: 'latest', label: t('onboarding_q7_latest') },
      { id: 'classic', label: t('onboarding_q7_classic') },
      { id: 'abstract', label: t('onboarding_q7_abstract') },
    ]},
    { id: 'risk', q: t('onboarding_q8'), options: [
      { id: 'stable', label: t('onboarding_q8_stable') },
      { id: 'risk', label: t('onboarding_q8_risk') },
      { id: 'balanced', label: t('onboarding_q8_balanced') },
    ]},
    { id: 'horizon', q: t('onboarding_q9'), options: [
      { id: 'long', label: t('onboarding_q9_long') },
      { id: 'daily', label: t('onboarding_q9_daily') },
      { id: 'instant', label: t('onboarding_q9_instant') },
    ]},
    { id: 'curiosity', q: t('onboarding_q10'), options: [
      { id: 'how', label: t('onboarding_q10_how') },
      { id: 'why', label: t('onboarding_q10_why') },
      { id: 'what', label: t('onboarding_q10_what') },
    ]},
  ];

  const currentQuestion = step >= 1 && step <= 10 ? questions[step - 1] : null;

  const radarData = [
    { subject: 'Logic', A: answers.complexity === 'puzzle' ? 90 : 40, fullMark: 100 },
    { subject: 'Visual', A: answers.learning === 'visual' ? 90 : 40, fullMark: 100 },
    { subject: 'Social', A: answers.social === 'public' ? 90 : 40, fullMark: 100 },
    { subject: 'Income', A: answers.priority === 'money' ? 90 : 40, fullMark: 100 },
    { subject: 'Impact', A: answers.priority === 'impact' ? 90 : 40, fullMark: 100 },
    { subject: 'Risk', A: answers.risk === 'risk' ? 90 : 40, fullMark: 100 },
  ];

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto min-h-screen">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center bg-claude-surface border border-claude-border rounded-[2rem] p-12 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/5 border border-claude-border rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">
                {t('onboarding_start')}
              </h1>
              <p className="text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed uppercase text-[11px] font-bold tracking-[0.2em]">
                Initialize your career trajectory based on 2025 market vectors.
              </p>
              <button
                onClick={startSurvey}
                className="bg-white text-claude-bg px-12 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-black/50 inline-flex items-center gap-3"
              >
                Initiate <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 block">Вопрос {step < 10 ? `0${step}` : step} / 10</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">{currentQuestion.q}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(currentQuestion.id, opt.id)}
                  className="p-8 bg-claude-surface border border-claude-border rounded-3xl text-left transition-all hover:border-gray-500 group"
                >
                  <p className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{opt.label}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-12">
               <div className="flex gap-2">
                 {Array.from({ length: 10 }).map((_, i) => (
                   <div 
                     key={i} 
                     className={`w-8 h-1 rounded-full transition-all ${i < step ? 'bg-white' : 'bg-claude-border'}`}
                   />
                 ))}
               </div>
            </div>
          </motion.div>
        )}

        {step === 11 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-claude-surface border border-claude-border rounded-[2.5rem] p-10">
              <div>
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4 block">{t('onboarding_init_complete')}</span>
                <h2 className="text-4xl font-black text-white mb-6 tracking-tight uppercase">{t('onboarding_result_title')}</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Драйв: {answers.drive}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Приоритет: {answers.priority}
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                    <Radar
                      name="User"
                      dataKey="A"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <ChevronRight className="w-5 h-5 text-gray-500" /> {t('onboarding_recommendations')}
              </h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-claude-surface border border-claude-border p-6 rounded-3xl hover:border-gray-600 transition-all flex flex-col justify-between h-full"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('onboarding_sector')} {i+1}</span>
                           <span className="text-[10px] font-bold text-emerald-400 uppercase">{rec.market_value}% MV</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-3">{rec.name}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mb-6 italic">{rec.matching_reason}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedProfession(rec.name);
                          setShowTree(true);
                        }}
                        className="w-full py-3 bg-white/5 border border-claude-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white text-claude-bg transition-all"
                      >
                        {t('onboarding_roadmap_btn')}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="pt-8 border-t border-claude-border flex justify-center">
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-white text-claude-bg px-12 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  {t('onboarding_enter_btn')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProfession && (
        <SkillTreeModal 
          isOpen={showTree} 
          onClose={() => setShowTree(false)} 
          profession={selectedProfession} 
        />
      )}
    </div>
  );
}
