/**
 * Calculates minimal settlement transactions from a list of expenses.
 * Returns array of { from, to, amount } objects.
 */
export const calculateSettlements = (expenses, memberIds) => {
  const balances = {};
  memberIds.forEach((id) => (balances[id] = 0));

  expenses.forEach(({ amount, paidBy, splitAmong }) => {
    if (!splitAmong?.length) return;
    const share = amount / splitAmong.length;
    balances[paidBy] = (balances[paidBy] || 0) + amount;
    splitAmong.forEach((id) => {
      balances[id] = (balances[id] || 0) - share;
    });
  });

  const settlements = [];
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < -0.01)
    .sort((a, b) => a[1] - b[1]);
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0.01)
    .sort((a, b) => b[1] - a[1]);

  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const [debtorId, debtAmt] = debtors[i];
    const [creditorId, creditAmt] = creditors[j];
    const amount = Math.min(-debtAmt, creditAmt);
    settlements.push({ from: debtorId, to: creditorId, amount: +amount.toFixed(2) });
    debtors[i] = [debtorId, debtAmt + amount];
    creditors[j] = [creditorId, creditAmt - amount];
    if (Math.abs(debtors[i][1]) < 0.01) i++;
    if (Math.abs(creditors[j][1]) < 0.01) j++;
  }

  return settlements;
};

export const getCategoryTotals = (expenses) => {
  const totals = {};
  expenses.forEach(({ category, amount }) => {
    totals[category] = (totals[category] || 0) + amount;
  });
  return Object.entries(totals).map(([name, value]) => ({
    name,
    value: +value.toFixed(2),
  }));
};

export const getChoreLeaderboard = (chores, members) => {
  const scores = {};
  members.forEach((m) => (scores[m.uid] = { ...m, completed: 0, missed: 0 }));
  chores.forEach(({ assignedTo, status }) => {
    if (!scores[assignedTo]) return;
    if (status === "done") scores[assignedTo].completed++;
    if (status === "missed") scores[assignedTo].missed++;
  });
  return Object.values(scores).sort((a, b) => b.completed - a.completed);
};
