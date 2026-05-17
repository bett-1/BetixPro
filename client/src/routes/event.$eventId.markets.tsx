import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { rootRoute } from "./root";

export const eventMarketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/event/$eventId/markets",
  component: lazyRouteComponent(
    () => import("@/features/user/pages/event-markets"),
  ),
});
