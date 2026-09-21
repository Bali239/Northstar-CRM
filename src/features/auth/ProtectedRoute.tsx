import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAppSelector } from "../../app/hooks";

export function ProtectedRoute() {
  const { user, isReady } = useAppSelector((state) => state.auth);
  const location = useLocation();
  if (!isReady)
    return (
      <div className="page-loader">
        <Spin size="large" />
      </div>
    );
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
