import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { adminRoute } from "./route";

export const adminAppealDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/appeals/$appealId",
  component: lazyRouteComponent(
    () => import("@/features/admin/modules/appeals"),
  ),
});
