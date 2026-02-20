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
  const [guestCount, setGuestCount] = useState(1); // Default to 1
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
    if (guestCount <= 1) return; // Minimum 1 guest
    setGuestCount((prev) => prev - 1);
  };

  const isActive = (path) => location.pathname === path;

  const handleCreateOrder = () => {
    // Only guests is mandatory, name and phone are optional
    if (guestCount === 0) {
      enqueueSnackbar("Please enter number of guests!", { variant: "warning" });
      return;
    }

    // Generate anonymous name if not provided
    const customerName = name.trim() || `Guest ${Math.floor(Math.random() * 1000)}`;
    
    // Send data to store
    dispatch(setCustomer({ 
      name: customerName, 
      phone: phone.trim() || "", 
      guests: guestCount 
    }));
    
    navigate("/tables");
    closeModal();
  };

  // Don't show bottom nav on auth page
  if (location.pathname === "/auth") return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around z-50">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center justify-center font-bold transition-colors duration-200 ${
            isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-[#f5f5f5]"
          } w-[300px] rounded-[20px]`}
        >
          <FaHome className="inline mr-2" size={20} /> <p>Home</p>
        </button>
        <button
          onClick={() => navigate("/orders")}
          className={`flex items-center justify-center font-bold transition-colors duration-200 ${
            isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-[#f5f5f5]"
          } w-[300px] rounded-[20px]`}
        >
          <MdOutlineReorder className="inline mr-2" size={20} /> <p>Orders</p>
        </button>
        <button
          onClick={() => navigate("/tables")}
          className={`flex items-center justify-center font-bold transition-colors duration-200 ${
            isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-[#f5f5f5]"
          } w-[300px] rounded-[20px]`}
        >
          <MdTableBar className="inline mr-2" size={20} /> <p>Tables</p>
        </button>
        <button 
          className="flex items-center justify-center font-bold text-[#ababab] hover:text-[#f5f5f5] w-[300px] transition-colors duration-200"
        >
          <CiCircleMore className="inline mr-2" size={20} /> <p>More</p>
        </button>

        <button
          disabled={isActive("/tables") || isActive("/menu")}
          onClick={openModal}
          className={`absolute bottom-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-4 items-center transition-transform duration-200 hover:scale-110 ${
            (isActive("/tables") || isActive("/menu")) ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <BiSolidDish size={40} />
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create New Order">
        <div className="space-y-4">
          {/* Guest count - Required */}
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

          {/* Customer Name - Optional */}
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Customer Name <span className="text-gray-500">(Optional)</span>
            </label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter customer name"
                className="bg-transparent flex-1 text-white focus:outline-none"
              />
            </div>
            <p className="text-xs text-[#ababab] mt-1">
              If left empty, will be set as "Guest XXX"
            </p>
          </div>

          {/* Customer Phone - Optional */}
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Phone Number <span className="text-gray-500">(Optional)</span>
            </label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="+91-9999999999"
                className="bg-transparent flex-1 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-gray-600 text-white rounded-lg py-3 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateOrder}
              className="flex-1 bg-[#F6B100] text-[#1f1f1f] rounded-lg py-3 font-semibold hover:bg-yellow-500 transition-colors"
            >
              Continue to Tables
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BottomNav;
