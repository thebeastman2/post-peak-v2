import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DailyGraph({ hourlyData }) {
  return (
    <div className="w-full">
      <h3 className="text-xs font-medium pp-text-muted uppercase tracking-wider mb-2">Reach Velocity — Next 24h</h3>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="hour"
              tickFormatter={h => `+${h}h`}
              tick={{ fontSize: 10, fill: 'hsl(var(--pp-text-muted))' }}
              interval={2}
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
              formatter={v => [`${v}`, 'Reach']}
              labelFormatter={h => `+${h}h`}
              cursor={{ fill: 'hsl(var(--pp-border))', fillOpacity: 0.25 }}
            />
            <Bar dataKey="score" radius={[3, 3, 0, 0]}>
              {hourlyData.map((d, i) => (
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