import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { EXPENSE_CATEGORIES } from "../../utils/constants";
import { getCategoryTotals } from "../../utils/calculations";

export default function ExpensePieChart({ expenses }) {
  const data = getCategoryTotals(expenses);
  const colors = EXPENSE_CATEGORIES.reduce(
    (acc, c) => ({ ...acc, [c.id]: c.color }),
    {}
  );

  if (!data.length)
    return <p className="text-white/40 text-center py-8">No expense data yet</p>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={colors[entry.name] || "#6c22ff"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#1a1a35",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#fff",
          }}
          formatter={(v) => [`₹${v}`, ""]}
        />
        <Legend
          formatter={(v) => (
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
              {v}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
