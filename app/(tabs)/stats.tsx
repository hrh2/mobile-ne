import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Dimensions,
  TouchableOpacity 
} from 'react-native';
import { useExpenses } from '@/hooks/useExpenses';
import { 
  formatCurrency, 
  groupByCategory, 
  generateChartData, 
  expenseCategories 
} from '@/utils/formatters';
import Card from '@/components/common/Card';
import { PieChart } from 'react-native-chart-kit';
import Loading from '@/components/common/Loading';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { expenses, isLoading } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const chartData = useMemo(() => {
    return generateChartData(expenses);
  }, [expenses]);

  const categoryExpenses = useMemo(() => {
    return groupByCategory(expenses);
  }, [expenses]);

  const chartColors = [
    '#FF9500', // Orange
    '#34C759', // Green
    '#AF52DE', // Purple
    '#5856D6', // Indigo
    '#FF2D55', // Pink
    '#007AFF', // Blue
    '#32ADE6', // Light Blue
    '#FF3B30', // Red
    '#E9C46A', // Yellow
    '#8E8E93', // Gray
  ];

  const formattedChartData = useMemo(() => {
    if (!chartData || !chartData.labels) return [];

    return chartData.labels.map((label, index) => ({
      name: label,
      amount: chartData.datasets[0].data[index],
      color: chartColors[index % chartColors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  }, [chartData]);

  const getCategoryTotal = (category: string) => {
    if (!categoryExpenses[category]) return 0;
    
    return categoryExpenses[category].reduce(
      (total: number, expense: any) => total + Number(expense.amount),
      0
    );
  };

  const getCategoryColor = (category: string) => {
    const index = expenseCategories.findIndex(cat => cat.value === category.toLowerCase());
    return index >= 0 ? chartColors[index % chartColors.length] : chartColors[9];
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading expense statistics..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expense Statistics</Text>
        <Text style={styles.subtitle}>
          Analyze your spending patterns
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {expenses.length > 0 ? (
          <>
            <Card variant="elevated\" style={styles.chartCard}>
              <Text style={styles.chartTitle}>Expenses by Category</Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={formattedChartData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                />
              </View>
            </Card>

            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Categories</Text>
              {Object.keys(categoryExpenses).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                >
                  <View 
                    style={[
                      styles.categoryIndicator,
                      { backgroundColor: getCategoryColor(category.toLowerCase()) }
                    ]} 
                  />
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryCount}>
                      {categoryExpenses[category].length} 
                      {categoryExpenses[category].length === 1 ? ' expense' : ' expenses'}
                    </Text>
                  </View>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(getCategoryTotal(category))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedCategory && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory} Details
                </Text>
                {categoryExpenses[selectedCategory].map((expense: any) => (
                  <Card key={expense.id} style={styles.expenseDetailCard}>
                    <Text style={styles.expenseTitle}>{expense.title}</Text>
                    <Text style={styles.expenseDescription}>
                      {expense.description}
                    </Text>
                    <Text style={styles.expenseAmount}>
                      {formatCurrency(expense.amount)}
                    </Text>
                  </Card>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No expenses to analyze. Add some expenses to see statistics.
            </Text>
          </View>
        )}
      </ScrollView>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  chartCard: {
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  categoryCard: {
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
  selectedCategory: {
    backgroundColor: '#F0EAFF',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  detailSection: {
    marginBottom: 32,
  },
  expenseDetailCard: {
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5B37B7',
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