import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import CareerExplorer from './pages/CareerExplorer';
import FinancialPath from './pages/FinancialPath';
import PortfolioBuilder from './pages/PortfolioBuilder';
import Onboarding from './pages/Onboarding';
import SkillMap from './pages/SkillMap';
import { useTranslation } from './lib/i18n';

export default function App() {
  const { t } = useTranslation();
  const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true';

  return (
    <Router>
      <div className="min-h-screen bg-claude-bg flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route 
              path="/" 
              element={onboardingComplete ? <Home /> : <Navigate to="/onboarding" replace />} 
            />
            <Route path="/career" element={<CareerExplorer />} />
            <Route path="/finance" element={<FinancialPath />} />
            <Route path="/portfolio" element={<PortfolioBuilder />} />
            <Route path="/skill-map" element={<SkillMap />} />
          </Routes>
        </main>
        <footer className="bg-claude-bg border-t border-claude-border py-12 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/5 border border-claude-border rounded flex items-center justify-center">
                <div className="w-3 h-3 border border-gray-400 rotate-45"></div>
              </div>
              <div className="font-bold text-xl text-white tracking-tight uppercase tracking-tighter">FutureStep AI</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 font-bold text-[10px] uppercase tracking-widest text-gray-500">
               <div className="flex flex-col gap-3">
                  <span className="text-white font-extrabold pb-1">System</span>
                  <a href="/career" className="hover:text-white transition-colors">{t('career_insights')}</a>
                  <a href="/finance" className="hover:text-white transition-colors">{t('finance_results')}</a>
                  <a href="/portfolio" className="hover:text-white transition-colors">{t('portfolio_title')}</a>
               </div>
               <div className="flex flex-col gap-3">
                  <span className="text-white font-extrabold pb-1">Documentation</span>
                  <a href="#" className="hover:text-white transition-colors">Real Data Sources</a>
                  <a href="#" className="hover:text-white transition-colors">Funding Policy</a>
               </div>
               <div className="flex flex-col gap-3">
                  <span className="text-white font-extrabold pb-1">Verified</span>
                  <a href="#" className="hover:text-white transition-colors">2025 Market Stats</a>
                  <a href="#" className="hover:text-white transition-colors">System Status</a>
               </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-claude-border flex justify-between items-center text-[10px] text-gray-500 uppercase font-bold tracking-widest">
            <span>{t('footer_copy')}</span>
            <span>{t('footer_sync')}</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}
