import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { userRoute } from "./route";

export const userProfileRoute = createRoute({
  getParentRoute: () => userRoute,
  path: "/profile",
  component: lazyRouteComponent(() => import("@/features/user/pages/profile")),
});
