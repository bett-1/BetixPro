import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { userRoute } from "./route";

export const userContactRoute = createRoute({
  getParentRoute: () => userRoute,
  path: "/contact",
  component: lazyRouteComponent(() => import("@/features/user/pages/contact")),
});
