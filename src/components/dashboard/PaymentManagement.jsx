import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPayments } from "../../https";
import { enqueueSnackbar } from "notistack";
import { formatDateAndTime } from "../../utils";
import { FaRupeeSign, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { MdPayment, MdReceipt } from "react-icons/md";

const PaymentManagement = () => {
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  // Fetch payments
  const { data: paymentsData, isLoading, error, refetch } = useQuery({
    queryKey: ["payments", filter, dateRange],
    queryFn: async () => {
      const response = await getPayments();
      return response.data.data || [];
    },
  });

  // Filter payments based on status and date
  const filteredPayments = paymentsData?.filter(payment => {
    // Status filter
    if (filter !== "all" && payment.status !== filter) return false;
    
    // Date filter
    if (dateRange !== "all") {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      
      if (dateRange === "today") {
        const today = new Date(now.setHours(0, 0, 0, 0));
        return paymentDate >= today;
      } else if (dateRange === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return paymentDate >= weekAgo;
      } else if (dateRange === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return paymentDate >= monthAgo;
      }
    }
    return true;
  });

  // Calculate totals
  const totalAmount = filteredPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const successfulCount = filteredPayments?.filter(p => p.status === "captured").length || 0;
  const failedCount = filteredPayments?.filter(p => p.status === "failed").length || 0;
  const pendingCount = filteredPayments?.filter(p => p.status === "created").length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#262626] rounded-lg p-6 text-center">
        <p className="text-red-500">Error loading payments: {error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 bg-[#f6b100] text-[#1f1f1f] px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#262626] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#ababab] text-sm">Total Revenue</p>
              <p className="text-[#f5f5f5] text-2xl font-bold mt-2">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-[#025cca] p-3 rounded-full">
              <FaRupeeSign className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-[#262626] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#ababab] text-sm">Successful</p>
              <p className="text-[#f5f5f5] text-2xl font-bold mt-2">{successfulCount}</p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <FaCheckCircle className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-[#262626] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#ababab] text-sm">Failed</p>
              <p className="text-[#f5f5f5] text-2xl font-bold mt-2">{failedCount}</p>
            </div>
            <div className="bg-red-600 p-3 rounded-full">
              <FaTimesCircle className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-[#262626] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#ababab] text-sm">Pending</p>
              <p className="text-[#f5f5f5] text-2xl font-bold mt-2">{pendingCount}</p>
            </div>
            <div className="bg-yellow-600 p-3 rounded-full">
              <FaClock className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#262626] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">Payment Transactions</h2>
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#1f1f1f] text-[#f5f5f5] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">All Status</option>
              <option value="captured">Successful</option>
              <option value="failed">Failed</option>
              <option value="created">Pending</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-[#1f1f1f] text-[#f5f5f5] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#262626] rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[#f5f5f5]">
            <thead className="bg-[#333] text-[#ababab]">
              <tr>
                <th className="p-4">Payment ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments?.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-700 hover:bg-[#333]">
                    <td className="p-4 font-mono text-sm">
                      {payment.paymentId?.slice(-8) || "N/A"}
                    </td>
                    <td className="p-4 font-mono text-sm">
                      {payment.orderId?.slice(-8) || "N/A"}
                    </td>
                    <td className="p-4 font-semibold">
                      ₹{payment.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2">
                        <MdPayment className="text-[#ababab]" />
                        {payment.method || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${payment.status === 'captured' ? 'bg-green-500 bg-opacity-20 text-green-500' : 
                          payment.status === 'failed' ? 'bg-red-500 bg-opacity-20 text-red-500' : 
                          'bg-yellow-500 bg-opacity-20 text-yellow-500'}`}>
                        {payment.status || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">{payment.email || "N/A"}</p>
                        <p className="text-xs text-[#ababab]">{payment.contact || "N/A"}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {payment.createdAt ? formatDateAndTime(payment.createdAt) : "N/A"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => window.open(`https://dashboard.razorpay.com/app/payments/${payment.paymentId}`, '_blank')}
                        className="text-[#f6b100] hover:text-yellow-500 transition-colors"
                        title="View in Razorpay Dashboard"
                      >
                        <MdReceipt size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-[#ababab]">
                    No payment transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            // Convert to CSV and download
            const headers = ['Payment ID', 'Order ID', 'Amount', 'Method', 'Status', 'Email', 'Contact', 'Date'];
            const csvData = filteredPayments?.map(p => [
              p.paymentId,
              p.orderId,
              p.amount,
              p.method,
              p.status,
              p.email,
              p.contact,
              new Date(p.createdAt).toLocaleString()
            ]);
            
            const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="bg-[#1f1f1f] text-[#f5f5f5] px-6 py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"
        >
          Export to CSV
        </button>
      </div>
    </div>
  );
};

export default PaymentManagement;
