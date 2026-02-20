import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack";

const Orders = () => {
  const [status, setStatus] = useState("all");

  useEffect(() => {
    document.title = "POS | Orders";
  }, []);

  // Fetch orders from backend
  const { 
    data: orders, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await getOrders();
      return response.data.data; // Return the actual data array
    },
    placeholderData: keepPreviousData
  });

  // Show error message if fetch fails
  useEffect(() => {
    if (isError) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to fetch orders!", { 
        variant: "error" 
      });
      console.error("Orders fetch error:", error);
    }
  }, [isError, error]);

  // Filter orders based on status
  const filteredOrders = orders?.filter(order => {
    if (status === "all") return true;
    if (status === "progress") return order.orderStatus === "In Progress";
    if (status === "ready") return order.orderStatus === "Ready";
    if (status === "completed") return order.orderStatus === "Completed";
    return true;
  });

  // Get counts for each status
  const counts = {
    all: orders?.length || 0,
    progress: orders?.filter(o => o.orderStatus === "In Progress").length || 0,
    ready: orders?.filter(o => o.orderStatus === "Ready").length || 0,
    completed: orders?.filter(o => o.orderStatus === "Completed").length || 0
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden pb-24">
        <div className="flex items-center justify-between px-10 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Orders
            </h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-[500px]">
          <div className="spinner"></div>
        </div>
        <BottomNav />
      </section>
    );
  }

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden pb-24">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button 
            onClick={() => setStatus("all")} 
            className={`text-lg ${
              status === "all" 
                ? "bg-[#383838] text-[#f5f5f5]" 
                : "text-[#ababab] hover:text-[#f5f5f5]"
            } rounded-lg px-5 py-2 font-semibold transition-colors duration-200`}
          >
            All ({counts.all})
          </button>
          <button 
            onClick={() => setStatus("progress")} 
            className={`text-lg ${
              status === "progress" 
                ? "bg-[#383838] text-[#f5f5f5]" 
                : "text-[#ababab] hover:text-[#f5f5f5]"
            } rounded-lg px-5 py-2 font-semibold transition-colors duration-200`}
          >
            In Progress ({counts.progress})
          </button>
          <button 
            onClick={() => setStatus("ready")} 
            className={`text-lg ${
              status === "ready" 
                ? "bg-[#383838] text-[#f5f5f5]" 
                : "text-[#ababab] hover:text-[#f5f5f5]"
            } rounded-lg px-5 py-2 font-semibold transition-colors duration-200`}
          >
            Ready ({counts.ready})
          </button>
          <button 
            onClick={() => setStatus("completed")} 
            className={`text-lg ${
              status === "completed" 
                ? "bg-[#383838] text-[#f5f5f5]" 
                : "text-[#ababab] hover:text-[#f5f5f5]"
            } rounded-lg px-5 py-2 font-semibold transition-colors duration-200`}
          >
            Completed ({counts.completed})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-16 py-4 overflow-y-scroll scrollbar-hide">
        {filteredOrders?.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-500 py-10">
            No orders found
          </p>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
