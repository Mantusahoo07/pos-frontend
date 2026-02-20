import { useQuery } from '@tanstack/react-query';
import { getOrders, getTables } from '../https';
import { QUERY_KEYS } from '../utils/cacheKeys';

export const useDashboardMetrics = () => {
  // Fetch orders for revenue and order metrics
  const { 
    data: ordersData, 
    isLoading: ordersLoading,
    error: ordersError 
  } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, 'metrics'],
    queryFn: async () => {
      const response = await getOrders();
      return response.data.data;
    },
  });

  // Fetch tables for table metrics
  const { 
    data: tablesData, 
    isLoading: tablesLoading,
    error: tablesError 
  } = useQuery({
    queryKey: [QUERY_KEYS.TABLES, 'metrics'],
    queryFn: async () => {
      const response = await getTables();
      return response.data.data;
    },
  });

  // Calculate real metrics from actual data
  const metrics = {
    // Revenue metrics
    revenue: {
      today: calculateTodayRevenue(ordersData),
      week: calculateWeekRevenue(ordersData),
      month: calculateMonthRevenue(ordersData),
      total: calculateTotalRevenue(ordersData),
    },
    
    // Order metrics
    orders: {
      total: ordersData?.length || 0,
      inProgress: ordersData?.filter(o => o.orderStatus === 'In Progress').length || 0,
      ready: ordersData?.filter(o => o.orderStatus === 'Ready').length || 0,
      completed: ordersData?.filter(o => o.orderStatus === 'Completed').length || 0,
    },
    
    // Customer metrics
    customers: {
      total: calculateUniqueCustomers(ordersData),
      today: calculateTodayCustomers(ordersData),
    },
    
    // Table metrics
    tables: {
      total: tablesData?.length || 0,
      booked: tablesData?.filter(t => t.status === 'Booked').length || 0,
      available: tablesData?.filter(t => t.status === 'Available').length || 0,
    },
    
    // Item metrics (you'll need an items endpoint for this)
    items: {
      totalCategories: 8, // You can fetch this from a categories endpoint
      totalDishes: 50,    // You can fetch this from a menu endpoint
    }
  };

  // Calculate percentage changes (compare with yesterday/last week)
  const percentages = {
    revenue: calculateRevenuePercentage(ordersData),
    customers: calculateCustomerPercentage(ordersData),
    orders: calculateOrderPercentage(ordersData),
  };

  return {
    metrics,
    percentages,
    isLoading: ordersLoading || tablesLoading,
    error: ordersError || tablesError,
  };
};

// Helper functions for calculations
const calculateTodayRevenue = (orders) => {
  if (!orders) return 0;
  const today = new Date().toDateString();
  return orders
    .filter(order => new Date(order.orderDate).toDateString() === today)
    .reduce((sum, order) => sum + (order.bills?.totalWithTax || 0), 0);
};

const calculateWeekRevenue = (orders) => {
  if (!orders) return 0;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return orders
    .filter(order => new Date(order.orderDate) >= weekAgo)
    .reduce((sum, order) => sum + (order.bills?.totalWithTax || 0), 0);
};

const calculateMonthRevenue = (orders) => {
  if (!orders) return 0;
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  return orders
    .filter(order => new Date(order.orderDate) >= monthAgo)
    .reduce((sum, order) => sum + (order.bills?.totalWithTax || 0), 0);
};

const calculateTotalRevenue = (orders) => {
  if (!orders) return 0;
  return orders.reduce((sum, order) => sum + (order.bills?.totalWithTax || 0), 0);
};

const calculateUniqueCustomers = (orders) => {
  if (!orders) return 0;
  const uniquePhones = new Set(orders.map(o => o.customerDetails?.phone).filter(Boolean));
  return uniquePhones.size;
};

const calculateTodayCustomers = (orders) => {
  if (!orders) return 0;
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.orderDate).toDateString() === today);
  const uniquePhones = new Set(todayOrders.map(o => o.customerDetails?.phone).filter(Boolean));
  return uniquePhones.size;
};

const calculateRevenuePercentage = (orders) => {
  // Compare this week with last week
  if (!orders || orders.length === 0) return { value: 0, isIncrease: true };
  
  const today = new Date();
  const thisWeek = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate >= new Date(today.setDate(today.getDate() - 7));
  });
  
  const lastWeek = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    const lastWeekStart = new Date(today.setDate(today.getDate() - 14));
    const lastWeekEnd = new Date(today.setDate(today.getDate() - 7));
    return orderDate >= lastWeekStart && orderDate <= lastWeekEnd;
  });

  const thisWeekRevenue = thisWeek.reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);
  const lastWeekRevenue = lastWeek.reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

  if (lastWeekRevenue === 0) return { value: 100, isIncrease: true };
  
  const percentage = ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100;
  return {
    value: Math.abs(percentage).toFixed(1),
    isIncrease: percentage >= 0
  };
};

const calculateCustomerPercentage = (orders) => {
  // Similar logic for customer percentage
  return { value: 10, isIncrease: true }; // Placeholder
};

const calculateOrderPercentage = (orders) => {
  // Similar logic for order percentage
  return { value: 12, isIncrease: true }; // Placeholder
};
