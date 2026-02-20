import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";

const Tables = () => {
  const [status, setStatus] = useState("all");

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  const { data: tablesData, isLoading, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await getTables();
      return response.data.data;
    },
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  const filteredTables = tablesData?.filter((table) => {
    if (status === "all") return true;
    if (status === "booked") return table.status === "Booked";
    return true;
  });

  return (
    <section className="bg-[#1f1f1f] min-h-screen pb-24">
      <div className="sticky top-0 bg-[#1f1f1f] z-10 px-4 sm:px-10 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-xl sm:text-2xl font-bold tracking-wider">
              Tables
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setStatus("all")}
              className={`text-sm sm:text-lg px-3 sm:px-5 py-2 rounded-lg font-semibold transition-colors ${
                status === "all" 
                  ? "bg-[#383838] text-[#f5f5f5]" 
                  : "text-[#ababab] hover:text-[#f5f5f5]"
              }`}
            >
              All ({tablesData?.length || 0})
            </button>
            <button
              onClick={() => setStatus("booked")}
              className={`text-sm sm:text-lg px-3 sm:px-5 py-2 rounded-lg font-semibold transition-colors ${
                status === "booked" 
                  ? "bg-[#383838] text-[#f5f5f5]" 
                  : "text-[#ababab] hover:text-[#f5f5f5]"
              }`}
            >
              Booked ({tablesData?.filter(t => t.status === "Booked").length || 0})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-16 py-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-10">
            <div className="spinner"></div>
          </div>
        ) : filteredTables?.length > 0 ? (
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
          <p className="col-span-full text-center text-gray-500 py-10">
            No tables found
          </p>
        )}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
