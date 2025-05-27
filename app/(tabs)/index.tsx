import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import Card from '@/components/common/Card';
import ExpenseList from '@/components/expenses/ExpenseList';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, calculateTotal } from '@/utils/formatters';
import { DollarSign, TrendingUp, TrendingDown, X } from 'lucide-react-native';
import { Expense } from '@/utils/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const { expenses = [], isLoading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const totalExpenses = calculateTotal(expenses ?? []);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsModalVisible(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalVisible(true);
  };

  const handleSubmitExpense = async (data: Omit<Expense, 'id' | 'createdAt' | 'ownerid'>) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id!, data);
      } else {
        await addExpense(data);
      }
      setIsModalVisible(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error submitting expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingExpense(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user?.username || 'User'}
        </Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.summary}>
          <Card variant="elevated" style={styles.balanceCard}>
            <View style={styles.balanceIconContainer}>
              <DollarSign size={20} color="white" />
            </View>
            <Text style={styles.balanceTitle}>Total Expenses</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(totalExpenses)}
            </Text>
          </Card>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <View style={[styles.statIconContainer, styles.incomeIcon]}>
                <TrendingUp size={18} color="white" />
              </View>
              <View>
                <Text style={styles.statTitle}>Category</Text>
                <Text style={styles.statAmount}>
                  {Array.isArray(expenses) && expenses.length > 0
                    ? expenses?.reduce((acc, curr) =>
                        !acc || curr.amount > acc.amount ? curr : acc
                      ).category || 'Other'
                    : 'N/A'}
                </Text>
              </View>
            </Card>

            <Card style={styles.statCard}>
              <View style={[styles.statIconContainer, styles.expenseIcon]}>
                <TrendingDown size={18} color="white" />
              </View>
              <View>
                <Text style={styles.statTitle}>Largest</Text>
                <Text style={styles.statAmount}>
                  {Array.isArray(expenses) && expenses.length > 0
                    ? formatCurrency(
                        Math.max(...expenses.map(e => e.amount))
                      )
                    : formatCurrency(0)}
                </Text>
              </View>
            </Card>
          </View>
        </View>

        <ExpenseList
          expenses={expenses}
          isLoading={isLoading}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          onAdd={handleAddExpense}
        />
      </View>

      {/* Expense Form Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ExpenseForm
              onSubmit={handleSubmitExpense}
              isLoading={isLoading}
              initialData={editingExpense || undefined}
              onCancel={handleCloseModal}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: '#5B37B7',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  summary: {
    padding: 16,
  },
  balanceCard: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  balanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5B37B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: '#34C759',
  },
  expenseIcon: {
    backgroundColor: '#FF3B30',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingBottom: 48, // Increased bottom padding significantly
    paddingHorizontal: 20,
    maxHeight: '90%',
    minHeight: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // Increased from 16 to 24 for more space below header
    paddingHorizontal: 8,
    paddingBottom: 8, // Add bottom padding to header
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
});