import { motion } from 'motion/react';
import { Sword } from 'lucide-react';

interface BattleViewProps {
  prof1: string;
  prof2: string;
  arguments1: string[];
  arguments2: string[];
}

export default function BattleView({ prof1, prof2, arguments1, arguments2 }: BattleViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden p-6 glass-panel border-cyber-pink/20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
        <Sword className="w-48 h-48 text-cyber-pink animate-pulse" />
      </div>
      
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="space-y-4 z-10"
      >
        <h3 className="text-2xl font-bold neon-text-blue uppercase italic">{prof1}</h3>
        <ul className="space-y-2">
          {arguments1.map((arg, i) => (
            <li key={i} className="text-sm font-light border-l-2 border-cyber-blue pl-3 py-1">
              {arg}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="space-y-4 z-10 text-right md:text-left"
      >
        <h3 className="text-2xl font-bold neon-text-green uppercase italic">{prof2}</h3>
        <ul className="space-y-2">
          {arguments2.map((arg, i) => (
            <li key={i} className="text-sm font-light border-r-2 md:border-r-0 md:border-l-2 border-cyber-green pr-3 md:pr-0 md:pl-3 py-1">
              {arg}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
