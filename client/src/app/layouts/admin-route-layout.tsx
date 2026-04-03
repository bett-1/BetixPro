import { Outlet } from "@tanstack/react-router";
import AdminLayout from "@/features/admin/components/layout";

export default function AdminRouteLayout() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
