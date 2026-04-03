import { Outlet, createRootRoute, createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import AdminSidebar from "@/components/app/admin-sidebar";

export const Route = createRootRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <>
      <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </>
  );
}
