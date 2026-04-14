import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { adminRoute } from "./route";

export const adminAppealsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/appeals",
  component: lazyRouteComponent(
    () => import("@/features/admin/modules/appeals"),
  ),
});
