import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalaryGraph({ labels, values }: { labels: string[], values: number[] }) {
  const data = labels.map((label, i) => ({
    name: label,
    salary: values[i],
  }));

  return (
    <div className="h-64 w-full bg-cyber-gray/50 rounded-xl p-4 border border-white/5">
      <h3 className="text-cyber-blue font-mono text-xs uppercase mb-4 tracking-tighter">Прогноз дохода ($/мес)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="name" stroke="#666" fontSize={10} />
          <YAxis stroke="#666" fontSize={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', color: '#fff' }}
            itemStyle={{ color: '#00d2ff' }}
          />
          <Line type="monotone" dataKey="salary" stroke="#00d2ff" strokeWidth={2} dot={{ fill: '#00d2ff' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
