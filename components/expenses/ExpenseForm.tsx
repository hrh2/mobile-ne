import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Expense } from '@/utils/api';
import { expenseCategories } from '@/utils/formatters';
import { X } from 'lucide-react-native';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt' | 'ownerid'>) => void;
  isLoading?: boolean;
  initialData?: Expense;
  onCancel?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Set initial data if provided
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category || '');
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        title,
        description,
        amount: Number(amount),
        category
      });
    }
  };

  const getCategoryName = (value: string) => {
    const category = expenseCategories.find(c => c.value === value);
    return category ? category.label : 'Select Category';
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Title"
        placeholder="Expense Title"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />
      
      <Input
        label="Description"
        placeholder="Expense Description"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
        multiline
      />
      
      <Input
        label="Amount"
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        error={errors.amount}
      />
      
      <View style={styles.categoryContainer}>
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text style={styles.categoryText}>
            {category ? getCategoryName(category) : 'Select Category'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        {onCancel && (
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.cancelButton}
          />
        )}
        <Button
          title={initialData ? 'Update Expense' : 'Add Expense'}
          onPress={handleSubmit}
          isLoading={isLoading}
          style={styles.submitButton}
        />
      </View>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity 
                onPress={() => setCategoryModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoryList}>
              {expenseCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryItem,
                    category === cat.value && styles.selectedCategory
                  ]}
                  onPress={() => {
                    setCategory(cat.value);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.categoryItemText,
                      category === cat.value && styles.selectedCategoryText
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  categorySelector: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#F0EAFF',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#5B37B7',
    fontWeight: '600',
  },
});

export default ExpenseForm;