import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard } from "./pages";
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";
import { useEffect } from "react";

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const hideHeaderRoutes = ["/auth"];
  const { isAuth } = useSelector((state) => state.user);

  // Log state changes for debugging
  useEffect(() => {
    console.log("Auth state:", isAuth);
    console.log("Current path:", location.pathname);
  }, [isAuth, location.pathname]);

  if (isLoading) return <FullScreenLoader />;

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && isAuth && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Home />
            </ProtectedRoutes>
          }
        />
        <Route 
          path="/auth" 
          element={isAuth ? <Navigate to="/" replace /> : <Auth />} 
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoutes>
              <Orders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoutes>
              <Tables />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoutes>
              <Menu />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function ProtectedRoutes({ children }) {
  const { isAuth } = useSelector((state) => state.user);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#1f1f1f]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#f5f5f5] mb-4">404</h1>
        <p className="text-[#ababab] mb-4">Page not found</p>
        <button
          onClick={() => window.location.href = "/"}
          className="bg-[#F6B100] text-[#1f1f1f] px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-200"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
