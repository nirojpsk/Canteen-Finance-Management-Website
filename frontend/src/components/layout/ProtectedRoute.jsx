import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../common/Loader";
import { useGetAdminProfileQuery } from "../../features/auth/authApiSlice";

const ProtectedRoute = () => {
  const location = useLocation();
  const { adminInfo } = useSelector((state) => state.auth);
  const { data, isLoading, isFetching } = useGetAdminProfileQuery(undefined, {
    skip: Boolean(adminInfo),
  });

  const admin = adminInfo || data?.admin;

  if (admin) {
    return <Outlet />;
  }

  if (isLoading || isFetching) {
    return (
      <main className="auth-screen">
        <Loader label="Checking session" />
      </main>
    );
  }

  return <Navigate to="/login" replace state={{ from: location }} />;
};

export default ProtectedRoute;
