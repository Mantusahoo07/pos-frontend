import { useDispatch } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useNavigate, useLocation } from "react-router-dom";

const useLoadData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // Don't fetch user data if we're on the auth page
      if (location.pathname === "/auth") {
        console.log("On auth page, skipping user fetch");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching user data...");
        const { data } = await getUserData();
        console.log("User data fetched successfully:", data);
        
        if (data?.data) {
          const { _id, name, email, phone, role } = data.data;
          dispatch(setUser({ _id, name, email, phone, role }));
          console.log("User state updated");
        }
      } catch (error) {
        console.log("Error fetching user:", error.response?.status || error.message);
        dispatch(removeUser());
        
        // Only redirect if we're not on auth page and not already navigating
        if (location.pathname !== "/auth" && !location.pathname.includes("auth")) {
          console.log("Redirecting to auth page");
          navigate("/auth", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, navigate, location.pathname]); // Add location.pathname as dependency

  return isLoading;
};

export default useLoadData;
