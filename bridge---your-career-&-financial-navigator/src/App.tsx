import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import CareerExplorer from './pages/CareerExplorer';
import FinancialPath from './pages/FinancialPath';
import PortfolioBuilder from './pages/PortfolioBuilder';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/career" element={<CareerExplorer />} />
            <Route path="/finance" element={<FinancialPath />} />
            <Route path="/portfolio" element={<PortfolioBuilder />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-12 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white rotate-45"></div>
              </div>
              <div className="font-bold text-xl text-slate-800 tracking-tight">Bridge</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 font-bold text-[10px] uppercase tracking-widest text-slate-400">
               <div className="flex flex-col gap-3">
                  <span className="text-slate-900 font-extrabold pb-1">System</span>
                  <a href="/career" className="hover:text-indigo-600 transition-colors">Analytics Sync</a>
                  <a href="/finance" className="hover:text-indigo-600 transition-colors">Route Mapping</a>
                  <a href="/portfolio" className="hover:text-indigo-600 transition-colors">Talent Wrapper</a>
               </div>
               <div className="flex flex-col gap-3">
                  <span className="text-slate-900 font-extrabold pb-1">Documentation</span>
                  <a href="#" className="hover:text-indigo-600 transition-colors">Real Data Sources</a>
                  <a href="#" className="hover:text-indigo-600 transition-colors">Funding Policy</a>
               </div>
               <div className="flex flex-col gap-3">
                  <span className="text-slate-900 font-extrabold pb-1">Verified</span>
                  <a href="#" className="hover:text-indigo-600 transition-colors">2025 Market Stats</a>
                  <a href="#" className="hover:text-indigo-600 transition-colors">System Status</a>
               </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            <span>© 2025 Bridge Education Project</span>
            <span>Last Save: Auto-Sync Active</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}
