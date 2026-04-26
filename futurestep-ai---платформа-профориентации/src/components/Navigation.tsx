import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Wallet, Briefcase, Home as HomeIcon, Menu, X, Languages, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../lib/i18n';

export default function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useTranslation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: t('nav_home') },
    { path: '/career', icon: Compass, label: t('nav_career') },
    { path: '/finance', icon: Wallet, label: t('nav_finance') },
    { path: '/portfolio', icon: Briefcase, label: t('nav_portfolio') },
    { path: '/skill-map', icon: Zap, label: t('nav_skill_map') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-claude-bg/85 backdrop-blur-xl border-b border-claude-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white/5 border border-claude-border rounded-lg flex items-center justify-center">
                <div className="w-3.5 h-3.5 border border-gray-400 rotate-45"></div>
              </div>
              <span className="text-lg font-bold tracking-tight text-white uppercase tracking-tighter">FutureStep AI</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 h-full">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 h-full text-[10px] uppercase tracking-widest font-bold transition-all px-1 border-b-2 ${
                    isActive
                      ? 'text-white border-white'
                      : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="h-4 w-px bg-claude-border mx-2" />

            <button
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              <Languages className="w-3.5 h-3.5" />
              {language === 'ru' ? 'RU/EN' : 'EN/RU'}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-claude-surface"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-claude-surface border-b border-claude-border"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white rounded-md"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setLanguage(language === 'ru' ? 'en' : 'ru');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-4 text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                <Languages className="w-4 h-4" />
                {language === 'ru' ? 'Switch to English' : 'Переключить на Русский'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
