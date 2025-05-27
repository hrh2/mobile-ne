import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Pencil, Trash } from 'lucide-react-native';
import { Expense } from '@/utils/api';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'food':
      return '#FF9500';
    case 'transportation':
      return '#34C759';
    case 'housing':
      return '#AF52DE';
    case 'utilities':
      return '#5856D6';
    case 'entertainment':
      return '#FF2D55';
    case 'shopping':
      return '#007AFF';
    case 'health':
      return '#32ADE6';
    case 'education':
      return '#FF3B30';
    case 'travel':
      return '#E9C46A';
    default:
      return '#8E8E93';
  }
};

const ExpenseItem: React.FC<ExpenseItemProps> = ({ 
  expense, 
  onEdit, 
  onDelete 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View 
          style={[
            styles.categoryIndicator, 
            { backgroundColor: getCategoryColor(expense.category) }
          ]} 
        />
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description}
          </Text>
          {expense.createdAt && (
            <Text style={styles.date}>
              {formatDate(expense.createdAt)}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={styles.amount}>
          {formatCurrency(expense.amount)}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onEdit(expense)}
          >
            <Pencil size={18} color="#5B37B7" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onDelete(expense.id!)}
          >
            <Trash size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leftContent: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ExpenseItem;