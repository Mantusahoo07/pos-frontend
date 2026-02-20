import React, { useState } from "react";
import { useDashboardMetrics } from "../../hooks/useMetrics";
import FullScreenLoader from "../shared/FullScreenLoader";

const Metrics = () => {
  const [timeRange, setTimeRange] = useState("month");
  const { metrics, percentages, isLoading, error } = useDashboardMetrics();

  if (isLoading) return <FullScreenLoader />;
  
  if (error) {
    return (
      <div className="container mx-auto p-6 text-red-500">
        Error loading metrics: {error.message}
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get revenue based on selected time range
  const getRevenue = () => {
    switch(timeRange) {
      case 'today':
        return metrics.revenue.today;
      case 'week':
        return metrics.revenue.week;
      case 'month':
        return metrics.revenue.month;
      default:
        return metrics.revenue.total;
    }
  };

  const metricsData = [
    { 
      title: "Revenue", 
      value: formatCurrency(getRevenue()), 
      percentage: percentages.revenue.value, 
      color: "#025cca", 
      isIncrease: percentages.revenue.isIncrease 
    },
    { 
      title: "Total Orders", 
      value: metrics.orders.total.toString(), 
      percentage: percentages.orders.value, 
      color: "#02ca3a", 
      isIncrease: percentages.orders.isIncrease 
    },
    { 
      title: "Total Customers", 
      value: metrics.customers.total.toString(), 
      percentage: percentages.customers.value, 
      color: "#f6b100", 
      isIncrease: percentages.customers.isIncrease 
    },
    { 
      title: "Active Orders", 
      value: metrics.orders.inProgress.toString(), 
      percentage: "12", 
      color: "#be3e3f", 
      isIncrease: true 
    },
  ];

  const itemsData = [
    { 
      title: "Total Categories", 
      value: metrics.items.totalCategories.toString(), 
      percentage: "0", 
      color: "#5b45b0" 
    },
    { 
      title: "Total Dishes", 
      value: metrics.items.totalDishes.toString(), 
      percentage: "0", 
      color: "#285430" 
    },
    { 
      title: "Active Orders", 
      value: metrics.orders.inProgress.toString(), 
      percentage: "0", 
      color: "#735f32" 
    },
    { 
      title: "Total Tables", 
      value: metrics.tables.total.toString(), 
      color: "#7f167f",
      subtext: `${metrics.tables.available} Available, ${metrics.tables.booked} Booked`
    },
  ];

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">
            Overall Performance
          </h2>
          <p className="text-sm text-[#ababab]">
            Real-time metrics from your restaurant operations
          </p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="flex items-center gap-1 px-4 py-2 rounded-md text-[#f5f5f5] bg-[#1a1a1a] border border-gray-700 focus:outline-none"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {metricsData.map((metric, index) => {
          return (
            <div
              key={index}
              className="shadow-sm rounded-lg p-4"
              style={{ backgroundColor: metric.color }}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-xs text-[#f5f5f5]">
                  {metric.title}
                </p>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    style={{ color: metric.isIncrease ? "#f5f5f5" : "red" }}
                  >
                    <path
                      d={metric.isIncrease ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                    />
                  </svg>
                  <p
                    className="font-medium text-xs"
                    style={{ color: metric.isIncrease ? "#f5f5f5" : "red" }}
                  >
                    {metric.percentage}%
                  </p>
                </div>
              </div>
              <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col justify-between mt-12">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">
            Inventory Overview
          </h2>
          <p className="text-sm text-[#ababab]">
            Current status of your restaurant inventory
          </p>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          {itemsData.map((item, index) => {
            return (
              <div key={index} className="shadow-sm rounded-lg p-4" style={{ backgroundColor: item.color }}>
                <div className="flex justify-between items-center">
                  <p className="font-medium text-xs text-[#f5f5f5]">{item.title}</p>
                  {item.percentage && (
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4" fill="none">
                        <path d="M5 15l7-7 7 7" />
                      </svg>
                      <p className="font-medium text-xs text-[#f5f5f5]">{item.percentage}%</p>
                    </div>
                  )}
                </div>
                <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">{item.value}</p>
                {item.subtext && (
                  <p className="mt-1 text-xs text-[#f5f5f5] opacity-80">{item.subtext}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
