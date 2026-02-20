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
      week: calculateWeekCustomers(ordersData),
      month: calculateMonthCustomers(ordersData),
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

  // Calculate REAL percentage changes (compare current period with previous period)
  const percentages = {
    revenue: calculateRevenuePercentage(ordersData),
    orders: calculateOrdersPercentage(ordersData),
    customers: calculateCustomersPercentage(ordersData),
    activeOrders: calculateActiveOrdersPercentage(ordersData),
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return orders
    .filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= today && orderDate < tomorrow;
    })
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate >= today && orderDate < tomorrow;
  });
  
  const uniquePhones = new Set(todayOrders.map(o => o.customerDetails?.phone).filter(Boolean));
  return uniquePhones.size;
};

const calculateWeekCustomers = (orders) => {
  if (!orders) return 0;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekOrders = orders.filter(o => new Date(o.orderDate) >= weekAgo);
  const uniquePhones = new Set(weekOrders.map(o => o.customerDetails?.phone).filter(Boolean));
  return uniquePhones.size;
};

const calculateMonthCustomers = (orders) => {
  if (!orders) return 0;
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  
  const monthOrders = orders.filter(o => new Date(o.orderDate) >= monthAgo);
  const uniquePhones = new Set(monthOrders.map(o => o.customerDetails?.phone).filter(Boolean));
  return uniquePhones.size;
};

// Calculate revenue percentage change (this week vs last week)
const calculateRevenuePercentage = (orders) => {
  if (!orders || orders.length === 0) return { value: 0, isIncrease: true };
  
  const now = new Date();
  
  // This week (last 7 days)
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  // Last week (7-14 days ago)
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const thisWeekOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate >= weekAgo && orderDate <= now;
  });
  
  const lastWeekOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate >= twoWeeksAgo && orderDate < weekAgo;
  });

  const thisWeekRevenue = thisWeekOrders.reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);
  const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

  if (lastWeekRevenue === 0) {
    return { 
      value: thisWeekRevenue > 0 ? 100 : 0, 
      isIncrease: true 
    };
  }
  
  const percentage = ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100;
  return {
    value: Math.abs(percentage).toFixed(1),
    isIncrease: percentage >= 0
  };
};

// Calculate orders percentage change
const calculateOrdersPercentage = (orders) => {
  if (!orders || orders.length === 0) return { value: 0, isIncrease: true };
  
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const thisWeekOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate >= weekAgo;
  });
  
  const lastWeekOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate >= twoWeeksAgo && orderDate < weekAgo;
  });

  const thisWeekCount = thisWeekOrders.length;
  const lastWeekCount = lastWeekOrders.length;

  if (lastWeekCount === 0) {
    return { 
      value: thisWeekCount > 0 ? 100 : 0, 
      isIncrease: true 
    };
  }
  
  const percentage = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;
  return {
    value: Math.abs(percentage).toFixed(1),
    isIncrease: percentage >= 0
  };
};

// Calculate customers percentage change
const calculateCustomersPercentage = (orders) => {
  if (!orders || orders.length === 0) return { value: 0, isIncrease: true };
  
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const thisWeekOrders = orders.filter(o => new Date(o.orderDate) >= weekAgo);
  const lastWeekOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate >= twoWeeksAgo && orderDate < weekAgo;
  });

  const thisWeekCustomers = new Set(thisWeekOrders.map(o => o.customerDetails?.phone).filter(Boolean)).size;
  const lastWeekCustomers = new Set(lastWeekOrders.map(o => o.customerDetails?.phone).filter(Boolean)).size;

  if (lastWeekCustomers === 0) {
    return { 
      value: thisWeekCustomers > 0 ? 100 : 0, 
      isIncrease: true 
    };
  }
  
  const percentage = ((thisWeekCustomers - lastWeekCustomers) / lastWeekCustomers) * 100;
  return {
    value: Math.abs(percentage).toFixed(1),
    isIncrease: percentage >= 0
  };
};

// Calculate active orders percentage change
const calculateActiveOrdersPercentage = (orders) => {
  if (!orders || orders.length === 0) return { value: 0, isIncrease: true };
  
  const now = new Date();
  const hourAgo = new Date(now);
  hourAgo.setHours(hourAgo.getHours() - 1);
  const twoHoursAgo = new Date(now);
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  
  const currentActive = orders.filter(o => {
    return o.orderStatus === 'In Progress' && new Date(o.orderDate) >= hourAgo;
  }).length;
  
  const previousActive = orders.filter(o => {
    return o.orderStatus === 'In Progress' && 
           new Date(o.orderDate) >= twoHoursAgo && 
           new Date(o.orderDate) < hourAgo;
  }).length;

  if (previousActive === 0) {
    return { 
      value: currentActive > 0 ? 100 : 0, 
      isIncrease: true 
    };
  }
  
  const percentage = ((currentActive - previousActive) / previousActive) * 100;
  return {
    value: Math.abs(percentage).toFixed(1),
    isIncrease: percentage >= 0
  };
};
