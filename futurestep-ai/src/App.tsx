import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Send, Trophy, Sparkles, User, Shield, Zap, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { chatWithAI } from './lib/gemini';
import { UserState, AIResponse, Mode } from './types';
import StatsRadar from './components/StatsRadar';
import SkillTree from './components/SkillTree';
import SalaryGraph from './components/SalaryGraph';
import BattleView from './components/BattleView';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [state, setState] = useState<UserState>({
    stats: { hard_skills: 20, soft_skills: 30, market_value: 10 },
    skills: ['Логика'],
    portfolio: [],
    history: [],
    currentMode: 'choice'
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState<AIResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.history, isLoading]);

  // Initial greeting
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      handleSend("Привет, давай начнем!");
    }
  }, []);

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const newUserHistory = [...state.history, { role: 'user' as const, content: message }];
    
    // Optimistic update
    setState(prev => ({ ...prev, history: newUserHistory }));
    setInput('');

    try {
      const response = await chatWithAI(message, { ...state, history: newUserHistory });
      
      setLastAIResponse(response);
      setState(prev => ({
        ...prev,
        history: [...newUserHistory, { role: 'assistant', content: response.message }],
        currentMode: response.mode,
        stats: {
          hard_skills: Math.min(100, prev.stats.hard_skills + (response.visual_data.stats.hard_skills || 0)),
          soft_skills: Math.min(100, prev.stats.soft_skills + (response.visual_data.stats.soft_skills || 0)),
          market_value: Math.min(100, prev.stats.market_value + (response.visual_data.stats.market_value || 0)),
        },
        skills: [...new Set([...prev.skills, ...(response.visual_data.skill_tree_update || [])])],
        portfolio: response.portfolio_entry ? [...prev.portfolio, response.portfolio_entry] : prev.portfolio
      }));
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Ошибка связи с ядром. Попробуй перезагрузить систему.";
      setState(prev => ({
        ...prev,
        history: [...prev.history, { role: 'assistant', content: `⚠️ **Системный сбой:** ${errorMessage}` }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cyber-black text-white relative selection:bg-cyber-green/30">
      <div className="scanline" />
      
      {/* Sidebar - Stats & Skill Tree */}
      <aside className="w-full md:w-80 lg:w-96 p-6 border-b md:border-b-0 md:border-r border-white/5 space-y-8 bg-black/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-cyber-green/20 rounded-lg border border-cyber-green/50">
            <Terminal className="text-cyber-green w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter uppercase neon-text-green">FutureStep AI</h1>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-mono">
            <Shield className="w-3 h-3" /> Статистика игрока
          </div>
          <div className="glass-panel p-4 neon-border bg-gradient-to-br from-cyber-green/5 to-transparent">
            <StatsRadar stats={state.stats} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-mono">
            <Target className="w-3 h-3" /> Древо навыков
          </div>
          <div className="glass-panel p-2">
            <SkillTree activeSkills={state.skills} />
          </div>
        </section>

        {state.portfolio.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-mono">
              <Trophy className="w-3 h-3" /> Портфолио ({state.portfolio.length})
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {state.portfolio.map((item, i) => (
                <div key={i} className="text-[10px] p-2 border border-white/5 rounded bg-white/5 hover:border-cyber-blue/30 transition-colors">
                  <div className="text-cyber-blue font-bold uppercase">{item.project_name}</div>
                  <div className="opacity-60">{item.role}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* Main Content - Chat & Visuals */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,65,0.02),transparent)]">
        
        {/* Visual Feedback Overlay */}
        <div className="absolute top-0 inset-x-0 h-48 pointer-events-none z-10 p-6 flex justify-center">
          <AnimatePresence mode="wait">
            {lastAIResponse?.visual_data.salary_data && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="w-full max-w-lg mt-12 bg-black/80 p-4 border border-cyber-blue/20 rounded-xl"
              >
                <SalaryGraph 
                  labels={lastAIResponse.visual_data.salary_data.labels} 
                  values={lastAIResponse.visual_data.salary_data.values} 
                />
              </motion.div>
            )}
            
            {lastAIResponse?.mode === 'battle' && lastAIResponse.visual_data.battle_details && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-full max-w-2xl mt-12"
              >
                <BattleView {...lastAIResponse.visual_data.battle_details} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pt-12 md:pt-12 scroll-smooth"
        >
          {state.history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%] md:max-w-[70%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "flex items-center gap-2 mb-1 px-2 text-[10px] font-mono uppercase tracking-widest opacity-50",
                msg.role === 'user' ? "flex-row-reverse" : ""
              )}>
                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                <span>{msg.role === 'user' ? 'Вы' : 'Core Alpha'}</span>
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-cyber-blue/10 border border-cyber-blue/20 text-blue-50 rounded-tr-none" 
                  : "bg-white/5 border border-white/10 rounded-tl-none prose prose-invert prose-sm max-w-none"
              )}>
                {msg.role === 'user' ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex gap-2 items-center text-cyber-green animate-pulse py-4 font-mono text-xs">
              <Sparkles className="w-4 h-4 animate-spin" /> Генерирую симуляцию...
            </div>
          )}
        </div>

        {/* Interactive Bar */}
        <footer className="p-4 md:p-8 border-t border-white/5 bg-black/60 backdrop-blur-md z-30">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Context Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {lastAIResponse?.interactive_elements.map((el) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={el.id}
                  onClick={() => handleSend(el.label)}
                  className="cyber-button text-[10px] px-4 py-2"
                >
                  {el.label}
                </motion.button>
              ))}
            </div>

            {/* Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="relative group"
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Введи команду или ответ..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 pr-16 focus:outline-none focus:border-cyber-green/50 transition-colors font-mono text-sm"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyber-green hover:bg-cyber-green/10 rounded-lg transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </footer>
      </main>

      {/* Badges / Floating Elements */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {state.currentMode === 'simulator' && (
            <motion.div 
              initial={{ x: 100 }} animate={{ x: 0 }} exit={{ x: 100 }}
              className="bg-cyber-pink/20 border border-cyber-pink px-4 py-1 rounded text-[10px] font-mono text-cyber-pink uppercase shadow-[0_0_15px_rgba(255,0,85,0.3)] backdrop-blur-sm"
            >
              Mode: S-Quest Active
            </motion.div>
          )}
          {state.currentMode === 'interview' && (
            <motion.div 
              initial={{ x: 100 }} animate={{ x: 0 }} exit={{ x: 100 }}
              className="bg-cyber-blue/20 border border-cyber-blue px-4 py-1 rounded text-[10px] font-mono text-cyber-blue uppercase"
            >
              Mode: Interview Link
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .prose p { margin-top: 0 !important; margin-bottom: 0.5rem !important; }
        .prose ul { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }
      `}</style>
    </div>
  );
}
