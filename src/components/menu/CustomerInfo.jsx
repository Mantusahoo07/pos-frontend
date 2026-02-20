import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";

const CustomerInfo = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const customerData = useSelector((state) => state.customer);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tableInfo = customerData.table 
    ? `Table ${customerData.table.tableNo}`
    : "No table selected";

  const orderId = customerData.orderId 
    ? customerData.orderId.slice(-6) 
    : "N/A";

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] rounded-t-lg">
      <div className="flex flex-col items-start">
        <h1 className="text-lg text-[#f5f5f5] font-semibold tracking-wide">
          {customerData.customerName || "Guest Customer"}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-[#ababab]">
            #{orderId} / Dine in
          </p>
          <span className="text-[#f6b100] text-xs font-semibold">
            {tableInfo}
          </span>
        </div>
        <p className="text-xs text-[#ababab] mt-2">
          {formatDate(currentTime)}
        </p>
      </div>
      <button className="bg-[#f6b100] p-3 text-lg font-bold rounded-lg min-w-[48px] h-12 flex items-center justify-center">
        {getAvatarName(customerData.customerName) || "G"}
      </button>
    </div>
  );
};

export default CustomerInfo;
