import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function MonthlyBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          stroke="rgba(255,255,255,0.4)"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.4)"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `₹${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a35",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#fff",
          }}
          formatter={(v) => [`₹${v}`]}
        />
        <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c22ff" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
