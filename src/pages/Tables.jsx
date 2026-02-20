import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";

const Tables = () => {
  const [status, setStatus] = useState("all");

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  // Fetch tables from backend
  const { 
    data: resData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await getTables();
      return response.data.data; // Return the actual data array
    },
    placeholderData: keepPreviousData,
  });

  // Show error message if fetch fails
  useEffect(() => {
    if (isError) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to fetch tables!", { 
        variant: "error" 
      });
      console.error("Tables fetch error:", error);
    }
  }, [isError, error]);

  // Filter tables based on selected status
  const filteredTables = resData?.filter((table) => {
    if (status === "all") return true;
    if (status === "booked") return table.status === "Booked";
    return true;
  });

  // Show loading state
  if (isLoading) {
    return (
      <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden pb-24">
        <div className="flex items-center justify-between px-10 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Tables
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
            Tables
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
            All ({resData?.length || 0})
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`text-lg ${
              status === "booked" 
                ? "bg-[#383838] text-[#f5f5f5]" 
                : "text-[#ababab] hover:text-[#f5f5f5]"
            } rounded-lg px-5 py-2 font-semibold transition-colors duration-200`}
          >
            Booked ({resData?.filter(t => t.status === "Booked").length || 0})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 px-16 py-4 h-[650px] overflow-y-scroll scrollbar-hide">
        {filteredTables?.length > 0 ? (
          filteredTables.map((table) => (
            <TableCard
              key={table._id}
              id={table._id}
              name={table.tableNo}
              status={table.status}
              initials={table?.currentOrder?.customerDetails?.name}
              seats={table.seats}
            />
          ))
        ) : (
          <p className="col-span-5 text-center text-gray-500 py-10">
            No tables found
          </p>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
