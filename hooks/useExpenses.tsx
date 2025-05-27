import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { expenseApi, Expense } from '@/utils/api';
import { useAuth } from './useAuth';

interface ExpensesContextType {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'ownerid'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType>({
  expenses: [],
  isLoading: false,
  error: null,
  fetchExpenses: async () => {},
  addExpense: async () => {},
  updateExpense: async () => {},
  deleteExpense: async () => {}
});

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch expenses when user changes
  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  // Fetch expenses
  const fetchExpenses = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await expenseApi.getExpenses(user.id);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch expenses');
      console.error('Fetch expenses error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add expense
  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'ownerid'>) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const newExpense: Expense = {
        ...expense,
        ownerid: user.id,
        createdAt: Date.now()
      };

      const { data } = await expenseApi.addExpense(newExpense);
      if (data) {
        setExpenses(prev => [...prev, data]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to add expense');
      console.error('Add expense error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update expense
  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await expenseApi.updateExpense(id, expense);
      if (data) {
        setExpenses(prev => 
          prev.map(exp => (exp.id === id ? { ...exp, ...data } : exp))
        );
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update expense');
      console.error('Update expense error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete expense
  const deleteExpense = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await expenseApi.deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (error: any) {
      setError(error.message || 'Failed to delete expense');
      console.error('Delete expense error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        isLoading,
        error,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

// Hook for using the expenses context
export const useExpenses = () => useContext(ExpensesContext);
