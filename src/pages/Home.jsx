import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getTables } from "../https";
import { enqueueSnackbar } from "notistack";

const Home = () => {
  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  // Fetch orders for metrics
  const { data: ordersData } = useQuery({
    queryKey: ["home-orders"],
    queryFn: async () => {
      const response = await getOrders();
      return response.data.data;
    },
  });

  // Fetch tables for metrics
  const { data: tablesData } = useQuery({
    queryKey: ["home-tables"],
    queryFn: async () => {
      const response = await getTables();
      return response.data.data;
    },
  });

  // Calculate metrics from real data
  const totalEarnings = ordersData?.reduce((sum, order) => 
    sum + (order.bills?.totalWithTax || 0), 0
  ) || 0;

  const inProgressOrders = ordersData?.filter(
    order => order.orderStatus === "In Progress"
  ).length || 0;

  const totalOrders = ordersData?.length || 0;
  const totalTables = tablesData?.length || 0;
  const bookedTables = tablesData?.filter(table => table.status === "Booked").length || 0;

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3 pb-16">
      {/* Left Div */}
      <div className="flex-[3]">
        <Greetings />
        <div className="flex items-center w-full gap-3 px-8 mt-8">
          <MiniCard 
            title="Total Earnings" 
            icon={<BsCashCoin />} 
            number={totalEarnings.toFixed(2)} 
            footerNum={1.6} 
          />
          <MiniCard 
            title="In Progress" 
            icon={<GrInProgress />} 
            number={inProgressOrders} 
            footerNum={3.6} 
          />
        </div>
        <RecentOrders />
      </div>
      {/* Right Div */}
      <div className="flex-[2]">
        <PopularDishes />
      </div>
      <BottomNav />
    </section>
  );
};

export default Home;
