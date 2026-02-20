import React from "react";
import { FaSearch, FaUserCircle, FaBell } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth", { replace: true });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center py-4 px-4 sm:px-8 bg-[#1a1a1a] gap-4 sm:gap-0">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
        <img src={logo} className="h-8 w-8" alt="restro logo" />
        <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide">
          Restro
        </h1>
      </div>

      {/* SEARCH - Hidden on mobile, show on tablet/desktop */}
      <div className="hidden md:flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-5 py-2 w-[300px] lg:w-[500px]">
        <FaSearch className="text-[#f5f5f5]" />
        <input
          type="text"
          placeholder="Search orders, tables..."
          className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
        />
      </div>

      {/* USER INFO */}
      <div className="flex items-center gap-2 sm:gap-4">
        {userData.role === "Admin" && (
          <button 
            onClick={() => navigate("/dashboard")} 
            className="bg-[#1f1f1f] rounded-[15px] p-2 sm:p-3 hover:bg-[#2a2a2a] transition-colors"
            title="Dashboard"
          >
            <MdDashboard className="text-[#f5f5f5] text-xl sm:text-2xl" />
          </button>
        )}
        
        <button className="bg-[#1f1f1f] rounded-[15px] p-2 sm:p-3 hover:bg-[#2a2a2a] transition-colors relative">
          <FaBell className="text-[#f5f5f5] text-xl sm:text-2xl" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <FaUserCircle className="text-[#f5f5f5] text-3xl sm:text-4xl" />
          <div className="hidden sm:flex flex-col items-start">
            <h1 className="text-sm sm:text-md text-[#f5f5f5] font-semibold tracking-wide">
              {userData.name || "User"}
            </h1>
            <p className="text-xs text-[#ababab] font-medium">
              {userData.role || "Role"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="p-2 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-colors"
            title="Logout"
          >
            <IoLogOut
              className={`text-[#f5f5f5] text-2xl sm:text-3xl ${logoutMutation.isPending ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
