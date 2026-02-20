import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";
import { enqueueSnackbar } from "notistack";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setPhone("");
    setGuestCount(1);
  };

  const increment = () => {
    if (guestCount >= 6) return;
    setGuestCount((prev) => prev + 1);
  };
  
  const decrement = () => {
    if (guestCount <= 1) return;
    setGuestCount((prev) => prev - 1);
  };

  const isActive = (path) => location.pathname === path;

  const handleCreateOrder = () => {
    if (guestCount === 0) {
      enqueueSnackbar("Please enter number of guests!", { variant: "warning" });
      return;
    }

    const customerName = name.trim() || `Guest ${Math.floor(Math.random() * 1000)}`;
    
    dispatch(setCustomer({ 
      name: customerName, 
      phone: phone.trim() || "", 
      guests: guestCount 
    }));
    
    navigate("/tables");
    closeModal();
  };

  if (location.pathname === "/auth") return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around items-center z-50">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center justify-center font-bold transition-colors duration-200 ${
            isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-[#f5f5f5]"
          } w-1/4 sm:w-[300px] rounded-[20px] py-2`}
        >
          <FaHome className="text-xl sm:mr-2" /> 
          <span className="hidden sm:inline">Home</span>
        </button>
        
        <button
          onClick={() => navigate("/orders")}
          className={`flex items-center justify-center font-bold transition-colors duration-200 ${
            isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-[#f5f5f5]"
          } w-1/4 sm:w-[300px] rounded-[20px] py-2`}
        >
          <MdOutlineReorder className="text-xl sm:mr-2" /> 
          <span className="hidden sm:inline">Orders</span>
        </button>
        
        <button
          onClick={() => navigate("/tables")}
          className={`flex items-center justify-center font-bold transition-colors duration-200 ${
            isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-[#f5f5f5]"
          } w-1/4 sm:w-[300px] rounded-[20px] py-2`}
        >
          <MdTableBar className="text-xl sm:mr-2" /> 
          <span className="hidden sm:inline">Tables</span>
        </button>
        
        <button 
          className="flex items-center justify-center font-bold text-[#ababab] hover:text-[#f5f5f5] w-1/4 sm:w-[300px] transition-colors duration-200"
        >
          <CiCircleMore className="text-xl sm:mr-2" /> 
          <span className="hidden sm:inline">More</span>
        </button>

        <button
          disabled={isActive("/tables") || isActive("/menu")}
          onClick={openModal}
          className={`absolute -top-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-3 sm:p-4 items-center transition-transform duration-200 hover:scale-110 ${
            (isActive("/tables") || isActive("/menu")) ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <BiSolidDish size={24} className="sm:size-40" />
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create New Order">
        <div className="space-y-4 p-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-[#ababab]">
              Number of Guests <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg">
              <button
                type="button"
                onClick={decrement}
                className="text-yellow-500 text-2xl hover:text-yellow-600 w-8 h-8 flex items-center justify-center"
              >
                &minus;
              </button>
              <span className="text-white font-semibold">
                {guestCount} {guestCount === 1 ? "Guest" : "Guests"}
              </span>
              <button
                type="button"
                onClick={increment}
                className="text-yellow-500 text-2xl hover:text-yellow-600 w-8 h-8 flex items-center justify-center"
              >
                &#43;
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Customer Name <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter customer name"
              className="w-full bg-[#1f1f1f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Phone Number <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="Enter phone number"
              className="w-full bg-[#1f1f1f] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:flex-1 bg-gray-600 text-white rounded-lg py-3 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateOrder}
              className="w-full sm:flex-1 bg-[#F6B100] text-[#1f1f1f] rounded-lg py-3 font-semibold hover:bg-yellow-500 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BottomNav;
