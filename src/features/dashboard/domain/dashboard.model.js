export const budgetUsage = ({ monthlyBudget, monthlySpending }) => {
  const budget = Number(monthlyBudget);
  if (budget <= 0 || Number.isNaN(budget)) return { hasBudget: false, percent: 0, tone: 'none', over: false };

  const ratio = monthlySpending / budget;
  const percent = Math.min(100, Math.max(0, Math.round(ratio * 100)));
  const over = ratio > 1;
  let tone = 'ok';
  if (over) tone = 'danger';
  else if (ratio >= 0.8) tone = 'warning';
  return { hasBudget: true, percent, tone, over };
};

export const disciplineLabel = (score) => {
  if (score >= 80) return 'Sangat disiplin';
  if (score >= 50) return 'Cukup disiplin';
  return 'Masih banyak keinginan menunggu';
};

export const hasChartData = (values) => values.some((value) => Number(value) > 0);

export const firstName = (fullName = '') => fullName.trim().split(/\s+/)[0] || '';
