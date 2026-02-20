import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";
import { FaLongArrowAltRight } from "react-icons/fa";

const TableCard = ({ id, name, status, initials, seats }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (status === "Booked") return;

    const table = { tableId: id, tableNo: name };
    dispatch(updateTable({ table }));
    navigate(`/menu`);
  };

  return (
    <div
      onClick={handleClick}
      className={`w-[300px] bg-[#262626] p-4 rounded-lg transition-all duration-200 ${
        status === "Booked" 
          ? "opacity-60 cursor-not-allowed" 
          : "hover:bg-[#2c2c2c] cursor-pointer hover:scale-105"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[#f5f5f5] text-xl font-semibold">
          Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {name}
        </h1>
        <p
          className={`${
            status === "Booked"
              ? "text-green-600 bg-[#2e4a40]"
              : "bg-[#664a04] text-white"
          } px-2 py-1 rounded-lg text-sm font-medium`}
        >
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center mt-5 mb-8">
        <div
          className="text-white rounded-full p-5 text-xl w-20 h-20 flex items-center justify-center"
          style={{ backgroundColor: initials ? getBgColor() : "#1f1f1f" }}
        >
          {getAvatarName(initials) || "N/A"}
        </div>
      </div>
      <p className="text-[#ababab] text-xs">
        Seats: <span className="text-[#f5f5f5] font-semibold">{seats}</span>
      </p>
    </div>
  );
};

export default TableCard;
