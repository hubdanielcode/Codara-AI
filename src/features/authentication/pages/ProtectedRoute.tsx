import { Navigate, Outlet } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

const ProtectedRoute: React.FC<{ session: Session | null }> = ({ session }) => {
  if (!session) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }
  return <Outlet />;
};

export { ProtectedRoute };
