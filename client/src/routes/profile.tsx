import { Navigate, createRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import { rootRoute } from "./root";

function ProfileAliasRoute() {
  return (
    <ProtectedRoute requireRole="USER" redirectTo="/profile">
      <Navigate to="/user/profile" />
    </ProtectedRoute>
  );
}

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfileAliasRoute,
});
