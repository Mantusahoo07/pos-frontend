import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory, MdRestaurantMenu, MdPayment } from "react-icons/md";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import TableManagement from "../components/dashboard/TableManagement";
import CategoryManagement from "../components/dashboard/CategoryManagement";
import MenuManagement from "../components/dashboard/MenuManagement";
import PaymentManagement from "../components/dashboard/PaymentManagement"; // Add this import

const tabs = ["Metrics", "Orders", "Tables", "Categories", "Menu", "Payments"];

const Dashboard = () => {
  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  const [activeTab, setActiveTab] = useState("Metrics");

  return (
    <div className="bg-[#1f1f1f] min-h-[calc(100vh-5rem)]">
      <div className="container mx-auto flex items-center justify-between py-14 px-6 md:px-4">
        <div className="flex items-center gap-3">
          {/* Removed the buttons as they're now in tabs */}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`
                px-6 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md whitespace-nowrap transition-all duration-200
                ${activeTab === tab
                  ? "bg-[#262626] border-b-2 border-yellow-400"
                  : "bg-[#1a1a1a] hover:bg-[#262626]"
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Tables" && <MdTableBar className="inline mr-2" />}
              {tab === "Categories" && <MdCategory className="inline mr-2" />}
              {tab === "Menu" && <MdRestaurantMenu className="inline mr-2" />}
              {tab === "Payments" && <MdPayment className="inline mr-2" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 pb-10">
        {activeTab === "Metrics" && <Metrics />}
        {activeTab === "Orders" && <RecentOrders />}
        {activeTab === "Tables" && <TableManagement />}
        {activeTab === "Categories" && <CategoryManagement />}
        {activeTab === "Menu" && <MenuManagement />}
        {activeTab === "Payments" && <PaymentManagement />} {/* Updated this line */}
      </div>
    </div>
  );
};

export default Dashboard;
