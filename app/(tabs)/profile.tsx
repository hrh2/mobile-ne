import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  UserCircle, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react-native';
import { formatCurrency, calculateTotal } from '@/utils/formatters';

export default function ProfileScreen() {
  const { user, signOut, updateUser, isLoading: authLoading } = useAuth();
  const { expenses } = useExpenses();
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState(user?.budgetLimit?.toString() || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled || false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: signOut,
          style: 'destructive',
        },
      ]
    );
  };

  const handleSaveBudget = async () => {
    try {
      const budgetLimitNum = parseFloat(budgetLimit);
      if (isNaN(budgetLimitNum) || budgetLimitNum <= 0) {
        Alert.alert('Invalid Budget', 'Please enter a valid budget amount');
        return;
      }

      await updateUser({ 
        budgetLimit: budgetLimitNum,
        notificationsEnabled 
      });

      setBudgetModalVisible(false);
      Alert.alert('Success', 'Budget limit updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update budget limit');
      console.error(error);
    }
  };

  const totalSpent = calculateTotal(expenses);
  const expenseCount = expenses.length;
  const avgExpense = expenseCount > 0 ? totalSpent / expenseCount : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <UserCircle size={64} color="#5B37B7" />
          </View>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.userInfo}>
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </Text>
        </View>

        <Card variant="elevated" style={styles.statsCard}>
          <Text style={styles.statsTitle}>Expense Overview</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(totalSpent)}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{expenseCount}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(avgExpense)}
              </Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
          </View>
        </Card>

        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Settings</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <CreditCard size={20} color="#5B37B7" />
            </View>
            <Text style={styles.menuText}>Payment Methods</Text>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Settings size={20} color="#5B37B7" />
            </View>
            <Text style={styles.menuText}>App Settings</Text>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setBudgetModalVisible(true)}
          >
            <View style={styles.menuIcon}>
              <CreditCard size={20} color="#5B37B7" />
            </View>
            <Text style={styles.menuText}>Budget Limit</Text>
            <View style={styles.budgetValueContainer}>
              <Text style={styles.budgetValue}>
                {user?.budgetLimit ? formatCurrency(user.budgetLimit) : 'Not set'}
              </Text>
              <ChevronRight size={20} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <HelpCircle size={20} color="#5B37B7" />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          isLoading={authLoading}
          style={styles.signOutButton}
        />
      </ScrollView>

      {/* Budget Limit Modal */}
      <Modal
        visible={budgetModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBudgetModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Budget Limit</Text>
              <TouchableOpacity
                onPress={() => setBudgetModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Monthly Budget Limit</Text>
              <TextInput
                style={styles.input}
                value={budgetLimit}
                onChangeText={setBudgetLimit}
                placeholder="Enter amount"
                keyboardType="numeric"
              />

              <View style={styles.notificationContainer}>
                <Text style={styles.notificationText}>
                  Enable notifications when expenses approach budget limit
                </Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    notificationsEnabled ? styles.toggleActive : styles.toggleInactive
                  ]}
                  onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  <View 
                    style={[
                      styles.toggleCircle,
                      notificationsEnabled ? styles.toggleCircleRight : styles.toggleCircleLeft
                    ]} 
                  />
                </TouchableOpacity>
              </View>

              <Button
                title="Save Budget"
                onPress={handleSaveBudget}
                isLoading={authLoading}
                style={styles.saveButton}
              />
            </View>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
  },
  statsCard: {
    padding: 16,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  budgetValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetValue: {
    fontSize: 14,
    color: '#5B37B7',
    fontWeight: '600',
    marginRight: 8,
  },
  signOutButton: {
    marginBottom: 32,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '80%',
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
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    marginBottom: 24,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 16,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#5B37B7',
  },
  toggleInactive: {
    backgroundColor: '#E0E0E0',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  toggleCircleLeft: {
    alignSelf: 'flex-start',
  },
  toggleCircleRight: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    marginTop: 8,
  },
});
