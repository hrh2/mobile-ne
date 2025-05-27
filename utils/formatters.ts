// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Calculate total expenses
export const calculateTotal = (expenses: { amount: number }[] = []): number => {
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
};



// Group expenses by category
export const groupByCategory = (expenses: any[]) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expense);
    return acc;
  }, {});
};

// Generate chart data from expenses
export const generateChartData = (expenses: any[]) => {
  const categories = groupByCategory(expenses);
  
  return {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.keys(categories).map(
          category => 
            categories[category].reduce(
              (sum: number, expense: any) => sum + Number(expense.amount), 
              0
            )
        ),
      },
    ],
  };
};

// Create expense categories
export const expenseCategories = [
  { label: 'Food', value: 'food' },
  { label: 'Transportation', value: 'transportation' },
  { label: 'Housing', value: 'housing' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Travel', value: 'travel' },
  { label: 'Other', value: 'other' }
];