import React from 'react';
import { 
  FlatList, 
  Text, 
  StyleSheet, 
  View, 
  TouchableOpacity 
} from 'react-native';
import ExpenseItem from './ExpenseItem';
import { Expense } from '@/utils/api';
import { formatCurrency, calculateTotal } from '@/utils/formatters';
import { PlusCircle } from 'lucide-react-native';
import Loading from '@/components/common/Loading';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false
}) => {
  if (isLoading) {
    return <Loading message="Loading expenses..." />;
  }

  const total = calculateTotal(expenses);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Expenses</Text>
          <Text style={styles.subtitle}>
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <PlusCircle size={24} color="#5B37B7" />
        </TouchableOpacity>
      </View>

      {expenses.length > 0 ? (
        <>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
          </View>

          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id!}
            renderItem={({ item }) => (
              <ExpenseItem
                expense={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No expenses yet. Tap the + button to add one!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    padding: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0EAFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B37B7',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B37B7',
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 24,
  },
});

export default ExpenseList;
