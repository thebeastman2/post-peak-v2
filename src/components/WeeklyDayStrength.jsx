import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { dayLabelsShort } from '@/data/platforms';

export default function WeeklyDayStrength({ dayStrengths }) {
  const data = dayStrengths.map(d => ({
    day: dayLabelsShort[d.dayOfWeek],
    strength: d.strength,
    hasPost: d.hasPost,
  }));

  return (
    <div className="w-full">
      <h3 className="text-xs font-medium pp-text-muted uppercase tracking-wider mb-2">Day Strength</h3>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'hsl(var(--pp-text-muted))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'hsl(var(--pp-text-muted))' }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--pp-card))',
                border: '1px solid hsl(var(--pp-border))',
                borderRadius: '10px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={v => [`${v}`, 'Day strength']}
              cursor={{ fill: 'hsl(var(--pp-border))', fillOpacity: 0.25 }}
            />
            <Bar dataKey="strength" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.hasPost ? 'hsl(var(--pp-primary))' : 'hsl(var(--pp-border))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}