import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";
import { useMenu } from "../hooks/useMenu";
import FullScreenLoader from "../components/shared/FullScreenLoader";

const Menu = () => {
  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  const customerData = useSelector((state) => state.customer);
  const { isLoading } = useMenu();

  if (isLoading) return <FullScreenLoader />;

  return (
    <div className="bg-[#1f1f1f] h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#1a1a1a] border-b border-[#333] flex-shrink-0">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-white text-lg sm:text-xl font-bold">Menu</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#262626] px-3 py-1.5 rounded-lg">
            <MdRestaurantMenu className="text-[#f6b100] text-xl" />
            <div className="hidden sm:block">
              <p className="text-white text-sm font-medium">
                {customerData.customerName || "Guest"}
              </p>
              <p className="text-[#ababab] text-xs">
                Table: {customerData.table?.tableNo || "Not selected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Flex Row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section - Menu Items (70%) */}
        <div className="w-[70%] overflow-y-auto">
          <MenuContainer />
        </div>

        {/* Right Section - Cart & Bill (30%) */}
        <div className="w-[30%] bg-[#1a1a1a] border-l border-[#333] flex flex-col overflow-hidden">
          {/* Customer Info - Compact */}
          <div className="p-2 border-b border-[#333] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-semibold">
                  {customerData.customerName || "Guest"}
                </p>
                <p className="text-[#ababab] text-[10px]">
                  Table: {customerData.table?.tableNo || "N/A"} | 
                  Guests: {customerData.guests || 1}
                </p>
              </div>
              <div className="bg-[#f6b100] w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm">
                {(customerData.customerName || "G").charAt(0)}
              </div>
            </div>
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto p-2">
            <CartInfo />
          </div>

          {/* Bill - Fixed at bottom with proper spacing */}
          <div className="border-t border-[#333] p-3 bg-[#1a1a1a] flex-shrink-0">
            <Bill />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Menu;
