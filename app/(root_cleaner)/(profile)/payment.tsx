import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  DollarSign, 
  Calendar, 
  Download, 
  Filter, 
  ArrowUpRight, 
  AlertCircle, 

} from 'lucide-react-native';

// Types for payment transactions
type PaymentStatus = 'completed' | 'pending' | 'processing' | 'failed';

type PaymentTransaction = {
  id: string;
  date: string;
  amount: string;
  status: PaymentStatus;
  description: string;
  jobId?: string;
  paymentMethod: 'bank' | 'direct_deposit' | 'cash';
  client: string;
};

// Sample cleaner payment transactions
const sampleCleanerTransactions: PaymentTransaction[] = [
  {
    id: '1',
    date: '12 May 2025',
    amount: '150.00',
    status: 'completed',
    description: 'Apartment Cleaning',
    jobId: 'JOB-001',
    paymentMethod: 'bank',
    client: 'Emily Johnson'
  },
  {
    id: '2',
    date: '05 May 2025',
    amount: '200.00',
    status: 'completed',
    description: 'Deep House Cleaning',
    jobId: 'JOB-002',
    paymentMethod: 'direct_deposit',
    client: 'Michael Smith'
  },
  {
    id: '3',
    date: '28 Apr 2025',
    amount: '75.00',
    status: 'processing',
    description: 'Office Cleaning',
    jobId: 'JOB-003',
    paymentMethod: 'cash',
    client: 'Sarah Williams'
  },
  {
    id: '4',
    date: '15 Apr 2025',
    amount: '100.00',
    status: 'failed',
    description: 'Window Cleaning',
    jobId: 'JOB-004',
    paymentMethod: 'bank',
    client: 'David Brown'
  }
];

// Payment filter type
type PaymentFilterType = 'All' | 'Completed' | 'Pending' | 'Failed';

const CleanerPaymentHistoryScreen: React.FC = () => {
  // Filter state
  const [activeFilter, setActiveFilter] = useState<PaymentFilterType>('All');

  // Filter transactions based on active filter
  const filteredTransactions = sampleCleanerTransactions.filter(transaction => {
    switch (activeFilter) {
      case 'Completed':
        return transaction.status === 'completed';
      case 'Pending':
        return transaction.status === 'processing' || transaction.status === 'pending';
      case 'Failed':
        return transaction.status === 'failed';
      default:
        return true;
    }
  });

  // Calculate total amounts
  const calculateTotalAmount = (transactions: PaymentTransaction[]) => {
    return transactions
      .reduce((total, transaction) => total + parseFloat(transaction.amount), 0)
      .toFixed(2);
  };

  // Render payment method icon
  const renderPaymentMethodIcon = (method: 'bank' | 'direct_deposit' | 'cash') => {
    switch (method) {
      case 'bank':
        return <DollarSign size={20} color="#6b7280" />;
      case 'direct_deposit':
        return <ArrowUpRight size={20} color="#10b981" />;
      case 'cash':
        return <DollarSign size={20} color="#eab308" />;
      default:
        return null;
    }
  };

  // Render transaction status color and icon
  const getStatusStyles = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return {
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-100',
          icon: <View className="w-2 h-2 rounded-full bg-green-500" />
        };
      case 'processing':
        return {
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-100',
          icon: <View className="w-2 h-2 rounded-full bg-yellow-500" />
        };
      case 'pending':
        return {
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          icon: <View className="w-2 h-2 rounded-full bg-blue-500" />
        };
      case 'failed':
        return {
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          icon: <View className="w-2 h-2 rounded-full bg-red-500" />
        };
    }
  };

  // Render individual transaction item
  const renderTransactionItem = (transaction: PaymentTransaction) => {
    const statusStyles = getStatusStyles(transaction.status);

    return (
      <TouchableOpacity 
        key={transaction.id} 
        className={`bg-white p-4 rounded-xl mb-3 border ${statusStyles.borderColor} shadow-sm`}
      >
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            {renderPaymentMethodIcon(transaction.paymentMethod)}
            <Text className="ml-2 text-gray-800 font-medium">{transaction.description}</Text>
          </View>
          <Text className="font-bold text-gray-900">${transaction.amount}</Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Calendar size={16} color="#6b7280" />
            <Text className="ml-2 text-gray-500 text-sm">{transaction.date}</Text>
          </View>
          
          <View className="flex-row items-center">
            {statusStyles.icon}
            <Text className={`ml-1 text-sm ${statusStyles.textColor}`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View className="mt-2 flex-row justify-between items-center">
          <Text className="text-gray-600 text-sm">Client: {transaction.client}</Text>
          {transaction.jobId && (
            <Text className="text-gray-500 text-xs">Job ID: {transaction.jobId}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Inline filter button component
  const FilterButton = ({ 
    label, 
    filter 
  }: { 
    label: string, 
    filter: PaymentFilterType 
  }) => (
    <TouchableOpacity
      onPress={() => setActiveFilter(filter)}
      className={`px-4 py-2 rounded-full mr-2 ${
        activeFilter === filter 
          ? 'bg-primary' 
          : 'bg-gray-100'
      }`}
    >
      <Text 
        className={`text-sm font-medium ${
          activeFilter === filter 
            ? 'text-white' 
            : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
   

      {/* Payment Summary */}
      <View className="bg-primary rounded-xl p-5 mx-5 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white mb-1">Total Earnings</Text>
            <View className="flex-row items-center">
              <DollarSign size={24} color="#ffffff" />
              <Text className="text-white text-3xl font-bold ml-1">
                {calculateTotalAmount(sampleCleanerTransactions)}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            className="bg-white/20 px-3 py-2 rounded-lg flex-row items-center"
            onPress={() => {/* Implement download logic */}}
          >
            <Download size={16} color="#ffffff" />
            <Text className="text-white ml-2 text-sm">Export</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-white text-sm mt-2">
          {sampleCleanerTransactions.length} Total Transactions
        </Text>
      </View>

      {/* Inline Filter Buttons */}
      <View className="px-5 mb-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex-row">
            <FilterButton label="All" filter="All" />
            <FilterButton label="Completed" filter="Completed" />
            <FilterButton label="Pending" filter="Pending" />
            <FilterButton label="Failed" filter="Failed" />
          </View>
        </ScrollView>
      </View>

      {/* Transaction List */}
      <ScrollView 
        className="flex-1 px-0"
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(renderTransactionItem)
        ) : (
          <View className="items-center justify-center mt-10">
            <AlertCircle size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4 text-center">
              No transactions found for this filter
            </Text>
          </View>
        )}
        
        {/* Extra space for bottom of scroll */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CleanerPaymentHistoryScreen;