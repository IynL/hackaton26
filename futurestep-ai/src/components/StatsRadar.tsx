import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Stats } from '../types';

export default function StatsRadar({ stats }: { stats: Stats }) {
  const data = [
    { subject: 'Hard Skills', A: stats.hard_skills, fullMark: 100 },
    { subject: 'Soft Skills', A: stats.soft_skills, fullMark: 100 },
    { subject: 'Market Val', A: stats.market_value, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#00ff41', fontSize: 12 }} />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#00ff41"
            fill="#00ff41"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
