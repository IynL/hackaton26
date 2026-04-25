import { motion } from 'motion/react';
import { Cpu, Code, Users, Zap, Database, Layout } from 'lucide-react';

const ALL_SKILLS = [
  { id: 'coding', label: 'Coding', icon: Code, color: '#00ff41' },
  { id: 'hw', label: 'Hardware', icon: Cpu, color: '#ff0055' },
  { id: 'comm', label: 'People Skills', icon: Users, color: '#00d2ff' },
  { id: 'ai', label: 'AI/ML', icon: Zap, color: '#f3ec19' },
  { id: 'db', label: 'Data', icon: Database, color: '#9333ea' },
  { id: 'ux', label: 'UI/UX', icon: Layout, color: '#f97316' },
];

export default function SkillTree({ activeSkills }: { activeSkills: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {ALL_SKILLS.map((skill) => {
        const isActive = activeSkills.some(s => s.toLowerCase().includes(skill.id.toLowerCase()) || skill.label.toLowerCase().includes(s.toLowerCase()));
        return (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative p-4 rounded-xl border ${isActive ? 'border-cyber-green bg-cyber-green/10 shadow-[0_0_15px_rgba(0,255,65,0.2)]' : 'border-white/5 bg-white/5 opacity-40'} transition-all`}
          >
            <skill.icon className={`w-6 h-6 mb-2 ${isActive ? 'text-cyber-green' : 'text-gray-500'}`} />
            <div className="text-xs font-mono uppercase tracking-widest">{skill.label}</div>
            {isActive && (
              <motion.div
                layoutId="glimmer"
                className="absolute inset-0 bg-cyber-green/5 animate-pulse rounded-xl"
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
