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
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await getUserData();
        console.log("User data fetched:", data);
        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
      } catch (error) {
        console.log("Error fetching user:", error.response?.status);
        dispatch(removeUser());
        // Only navigate to auth if we're not already there
        if (location.pathname !== "/auth") {
          navigate("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, navigate, location.pathname]);

  return isLoading;
};

export default useLoadData;
